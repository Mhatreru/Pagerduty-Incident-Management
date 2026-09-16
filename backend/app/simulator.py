import datetime
from sqlalchemy.orm import Session
from . import models, correlation, pd_service

def trigger_database_outage(db: Session):
    """
    Simulates a database outage cascade. Generates 5 alerts in sequence.
    All alerts will be processed through the correlation engine.
    """
    # Verify/create services if missing
    ensure_services_exist(db)

    # Sequence of events to trigger
    events_to_trigger = [
        # 1. Root Cause Event
        ("claims-database", "Connection pool exhausted. active_connections=150, limit=150", "CRITICAL"),
        # 2. Duplicate Root Cause Event
        ("claims-database", "Slow query warning: SELECT * FROM claims WHERE id = ? taking 8400ms", "CRITICAL"),
        # 3. Downstream API Outage Alert
        ("claims-api", "Database connection timeout after 5000ms", "ERROR"),
        # 4. Duplicate Downstream Alert
        ("claims-api", "500 Internal Server Error - DB Connection Unavailable", "ERROR"),
        # 5. Cascading Portal Alert
        ("claims-portal", "Portal latency spiked to 6200ms. Response failures detected.", "WARNING")
    ]

    incidents_involved = []

    for service_id, message, severity in events_to_trigger:
        incident = correlation.process_incoming_alert(
            db=db,
            service_id=service_id,
            message=message,
            severity=severity,
            source="Dynatrace"
        )
    # Update affected service health statuses in database
    db_svc = db.query(models.Service).filter(models.Service.id == "claims-database").first()
    if db_svc:
        db_svc.status = "CRITICAL"
    api_svc = db.query(models.Service).filter(models.Service.id == "claims-api").first()
    if api_svc:
        api_svc.status = "DEGRADED"
    portal_svc = db.query(models.Service).filter(models.Service.id == "claims-portal").first()
    if portal_svc:
        portal_svc.status = "DEGRADED"
    db.commit()

    return {"status": "Database outage cascade triggered", "incidents_processed": len(events_to_trigger)}

def recover_all_services(db: Session, actor: str = "Operator"):
    """
    Recovers all services, marks active incidents as RESOLVED, and logs audits.
    """
    # Reset service statuses to HEALTHY
    services = db.query(models.Service).all()
    for service in services:
        service.status = "HEALTHY"
    
    # Resolve all open incidents
    active_incidents = db.query(models.Incident).filter(models.Incident.status != "RESOLVED").all()
    resolved_count = 0
    
    for incident in active_incidents:
        incident.status = "RESOLVED"
        incident.resolved_at = datetime.datetime.utcnow()
        
        # Notify PagerDuty of resolution (both Events API and REST API)
        pd_service.resolve_incident_everywhere(
            pagerduty_id_field=incident.pagerduty_id,
            summary=f"Resolved: {incident.summary}",
            service_id=incident.primary_service_id
        )
        
        # Notify ServiceNow of resolution
        pd_service.sync_servicenow_incident(
            action="resolve",
            pd_incident_id=incident.pagerduty_id,
            summary=incident.summary,
            service_id=incident.primary_service_id
        )
        
        # Log Audit Trail
        audit = models.AuditLog(
            incident_id=incident.id,
            action="Incident Resolved",
            actor=actor,
            details=f"Service status recovered. PagerDuty {incident.pagerduty_id} and ServiceNow {incident.servicenow_id} updated to RESOLVED."
        )
        db.add(audit)
        resolved_count += 1
        
    db.commit()
    return {"status": "Recovery completed", "incidents_resolved": resolved_count}

def ensure_services_exist(db: Session):
    """
    Helper to seed services if database is cleared.
    """
    default_services = [
        models.Service(id="claims-database", name="Claims Primary Database", tier="Tier 1", status="HEALTHY", depends_on=""),
        models.Service(id="claims-api", name="Claims API Gateway", tier="Tier 2", status="HEALTHY", depends_on="claims-database"),
        models.Service(id="claims-portal", name="Insurance Claims web-portal", tier="Tier 3", status="HEALTHY", depends_on="claims-api"),
        models.Service(id="billing-service", name="Billing Batch Processor", tier="Tier 2", status="HEALTHY", depends_on="claims-database")
    ]
    
    for service in default_services:
        exists = db.query(models.Service).filter(models.Service.id == service.id).first()
        if not exists:
            db.add(service)
    db.commit()
