import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app import models, correlation, seed

# Setup in-memory database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture(scope="function")
def db_session():
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    models.Base.metadata.create_all(bind=engine)
    
    db = TestingSessionLocal()
    # Seed base topology and rules
    seed.seed_initial_data(db)
    
    # Clear raw events and incidents before each test for absolute isolation
    db.query(models.RawEvent).delete()
    db.query(models.Incident).delete()
    db.query(models.AuditLog).delete()
    db.commit()
    
    try:
        yield db
    finally:
        db.close()
        models.Base.metadata.drop_all(bind=engine)

def test_initial_services_seeded(db_session):
    services = db_session.query(models.Service).all()
    assert len(services) == 4
    db_service = db_session.query(models.Service).filter(models.Service.id == "claims-database").first()
    assert db_service is not None
    assert db_service.name == "Claims Primary Database"

def test_alert_suppression(db_session):
    # Alert matching active suppression regex rule: ".*TEST_ALERT.*"
    incident = correlation.process_incoming_alert(
        db=db_session,
        service_id="claims-api",
        message="Triggering TEST_ALERT ping check",
        severity="WARNING"
    )
    
    # Incident should be None (alert muted)
    assert incident is None
    
    # Raw event should still be logged and marked suppressed (query latest)
    raw_event = db_session.query(models.RawEvent).filter(
        models.RawEvent.service_id == "claims-api"
    ).order_by(models.RawEvent.id.desc()).first()
    
    assert raw_event is not None
    assert raw_event.is_suppressed is True

def test_alert_deduplication(db_session):
    # Trigger first event
    inc1 = correlation.process_incoming_alert(
        db=db_session,
        service_id="claims-database",
        message="Connection pool maxed out",
        severity="CRITICAL"
    )
    
    # Trigger second event immediately
    inc2 = correlation.process_incoming_alert(
        db=db_session,
        service_id="claims-database",
        message="Database slow query warnings",
        severity="CRITICAL"
    )
    
    assert inc1 is not None
    assert inc2 is not None
    # They should deduplicate and merge into the same Incident ID
    assert inc1.id == inc2.id
    
    # Check that both raw events were saved in database
    events = db_session.query(models.RawEvent).filter(
        models.RawEvent.service_id == "claims-database"
    ).all()
    assert len(events) == 2

def test_topological_correlation(db_session):
    # 1. Trigger parent outage (Database latency)
    inc_db = correlation.process_incoming_alert(
        db=db_session,
        service_id="claims-database",
        message="Database pool exhausted",
        severity="CRITICAL"
    )
    
    # 2. Trigger downstream service outage (API Gateway timeouts)
    # Since claims-api depends on claims-database, it should correlate under the database incident!
    inc_api = correlation.process_incoming_alert(
        db=db_session,
        service_id="claims-api",
        message="Gateway timeout connecting to DB",
        severity="ERROR"
    )
    
    assert inc_db is not None
    assert inc_api is not None
    
    # Downstream alert correlated under parent root-cause incident
    assert inc_api.id == inc_db.id
    
    # Check that root_cause_service_id is claims-database
    assert inc_api.root_cause_service_id == "claims-database"

def test_dynamic_priority_and_business_impact(db_session):
    from app.business_impact import calculate_business_impact, calculate_dynamic_priority
    impact = calculate_business_impact(db_session, "claims-database", "CRITICAL")
    assert impact["business_criticality"] in ["HIGH", "CRITICAL"]
    assert len(impact["downstream_services"]) >= 1

    priority, reason = calculate_dynamic_priority(
        severity="CRITICAL",
        business_criticality="HIGH",
        blast_radius_count=len(impact["downstream_services"]),
        revenue_exposure=impact["estimated_revenue_exposure_hr"]
    )
    assert priority in ["P1", "P2"]
    assert "Critical" in reason or "Major" in reason

def test_runbook_execution_and_safety(db_session):
    from app.remediation_engine import seed_default_runbooks, execute_runbook
    seed_default_runbooks(db_session)
    rbs = db_session.query(models.Runbook).all()
    assert len(rbs) >= 3

    # Test viewer unauthorized
    success, msg, extra = execute_runbook(
        db=db_session,
        runbook_id="rb-db-pool-recovery",
        incident_id=None,
        role="VIEWER"
    )
    assert success is False
    assert "Unauthorized" in msg

def test_postmortem_generation(db_session):
    from app.postmortem import generate_postmortem_markdown
    inc = correlation.process_incoming_alert(
        db=db_session,
        service_id="claims-database",
        message="Database latency exceeded 4000ms",
        severity="CRITICAL"
    )
    assert inc is not None
    pm = generate_postmortem_markdown(db_session, inc)
    assert "Post-Incident Review" in pm
    assert str(inc.id) in pm
