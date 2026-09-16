import datetime
import random
from sqlalchemy.orm import Session
from . import models

def seed_initial_data(db: Session):
    # 1. Seed Services Topology
    default_services = [
        models.Service(id="claims-database", name="Claims Primary Database", tier="Tier 1", status="HEALTHY", depends_on=""),
        models.Service(id="claims-api", name="Claims API Gateway", tier="Tier 2", status="HEALTHY", depends_on="claims-database"),
        models.Service(id="claims-portal", name="Insurance Claims web-portal", tier="Tier 3", status="HEALTHY", depends_on="claims-api"),
        models.Service(id="billing-service", name="Billing Batch Processor", tier="Tier 2", status="HEALTHY", depends_on="claims-database")
    ]
    
    for s in default_services:
        exists = db.query(models.Service).filter(models.Service.id == s.id).first()
        if not exists:
            db.add(s)
            
    # 2. Seed Suppression Rules
    default_rules = [
        models.SuppressionRule(target_field="message", match_pattern=".*TEST_ALERT.*", reason="Synthetic SRE heartbeat healthcheck alerts", enabled=True),
        models.SuppressionRule(target_field="message", match_pattern=".*SundayPatching.*", reason="Scheduled database maintenance window", enabled=True),
        models.SuppressionRule(target_field="severity", match_pattern="info", reason="Mute informational severity logs", enabled=True)
    ]
    
    for r in default_rules:
        exists = db.query(models.SuppressionRule).filter(
            models.SuppressionRule.target_field == r.target_field,
            models.SuppressionRule.match_pattern == r.match_pattern
        ).first()
        if not exists:
            db.add(r)
            
    # 3. Seed Historical Incidents & Audit Logs for Analytics Charts (Recharts)
    # We want to represent 7 days of historical incident statistics
    now = datetime.datetime.utcnow()
    
    # Check if we already have historical incidents
    historical_count = db.query(models.Incident).count()
    if historical_count == 0:
        # Create some random past incidents
        for i in range(1, 15):
            days_ago = 8 - (i % 7)
            created = now - datetime.timedelta(days=days_ago, hours=random.randint(1, 20), minutes=random.randint(1, 50))
            
            # Simulated MTTD is 1-5 minutes, MTTR is 10-45 minutes
            mttd_minutes = random.randint(1, 5)
            mttr_minutes = random.randint(10, 45)
            resolved = created + datetime.timedelta(minutes=mttr_minutes)
            
            pd_id = f"PD-HIST-{10000 + i}"
            snow_id = f"INC{8000000 + i}"
            
            svc = random.choice(["claims-database", "claims-api", "billing-service"])
            
            inc = models.Incident(
                pagerduty_id=pd_id,
                servicenow_id=snow_id,
                status="RESOLVED",
                primary_service_id=svc,
                root_cause_service_id=svc,
                summary=f"Historical incident: High error rates detected on {svc}",
                gemini_action_details="AI SRE diagnosis complete. Resolved by automated rollback/recycle action.",
                created_at=created,
                resolved_at=resolved
            )
            db.add(inc)
            db.commit()
            
            # Log some audits for these past incidents
            db.add(models.AuditLog(incident_id=inc.id, action="Alert Ingested", actor="System", details="Dynatrace problem opened.", timestamp=created - datetime.timedelta(minutes=mttd_minutes)))
            db.add(models.AuditLog(incident_id=inc.id, action="PagerDuty Triggered", actor="System", details=f"PD Alert generated: {pd_id}", timestamp=created))
            db.add(models.AuditLog(incident_id=inc.id, action="ServiceNow Incident Created", actor="System", details=f"SNOW Ticket: {snow_id}", timestamp=created + datetime.timedelta(seconds=30)))
            db.add(models.AuditLog(incident_id=inc.id, action="Incident Acknowledged", actor="Operator", details="Acknowledged by L1 engineer.", timestamp=created + datetime.timedelta(minutes=3)))
            db.add(models.AuditLog(incident_id=inc.id, action="Incident Resolved", actor="Operator", details="Incident resolved automatically.", timestamp=resolved))

        # Add some raw events to establish alert reduction rates (noise reduction ~95%)
        # Let's add 300 raw events in the past week
        for i in range(300):
            days_ago = random.randint(1, 7)
            ts = now - datetime.timedelta(days=days_ago, hours=random.randint(1, 23))
            
            # 50% suppressed, 45% deduplicated, 5% actual incidents
            is_supp = random.choice([True, False, False, False])
            
            ev = models.RawEvent(
                source="Dynatrace",
                service_id=random.choice(["claims-database", "claims-api", "claims-portal"]),
                message=f"Telemetry warning CPU/Memory utilization alert #{i}",
                severity=random.choice(["WARNING", "ERROR", "CRITICAL"]),
                timestamp=ts,
                is_suppressed=is_supp,
                event_fingerprint=f"fingerprint-{i}"
            )
            db.add(ev)
        
        # Add basic audit logs
        db.add(models.AuditLog(action="System Seeded", actor="System", details="Seeded topology, alert correlation rules, and historical analytics data successfully."))
        db.commit()
