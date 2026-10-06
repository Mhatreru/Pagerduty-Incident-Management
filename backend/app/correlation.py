import datetime
import re
import uuid
import json
import hashlib
from sqlalchemy.orm import Session
from . import models, schemas, gemini_service
from .connectors.pagerduty import pagerduty_connector
from .connectors.servicenow import servicenow_connector
from .connectors.notifications import notification_connector
from .business_impact import calculate_business_impact, calculate_dynamic_priority, get_downstream_dependents
from .remediation_engine import seed_default_runbooks

def check_suppression(db: Session, service_id: str, message: str, severity: str) -> bool:
    rules = db.query(models.SuppressionRule).filter(models.SuppressionRule.enabled == True).all()
    for rule in rules:
        if rule.target_field == "service_id" and rule.match_pattern.lower() in service_id.lower():
            return True
        elif rule.target_field == "message" and re.search(rule.match_pattern, message, re.IGNORECASE):
            return True
        elif rule.target_field == "severity" and rule.match_pattern.lower() == severity.lower():
            return True
    return False

def get_topology_info(db: Session) -> str:
    services = db.query(models.Service).all()
    lines = []
    for s in services:
        dep_str = f"depends on: {s.depends_on}" if s.depends_on else "has no dependencies"
        crit = getattr(s, "business_criticality", "HIGH")
        lines.append(f"- Service: {s.id} ({s.name}), Tier: {s.tier}, Criticality: {crit}, Status: {s.status}, {dep_str}")
    return "\n".join(lines)

def get_all_upstream_dependencies(db: Session, service_id: str, visited=None) -> list:
    if visited is None:
        visited = set()
    if service_id in visited:
        return []
    visited.add(service_id)
    service_obj = db.query(models.Service).filter(models.Service.id == service_id).first()
    if not service_obj or not service_obj.depends_on:
        return []
    deps = [d.strip() for d in service_obj.depends_on.split(",") if d.strip()]
    upstream = []
    for dep in deps:
        upstream.append(dep)
        upstream.extend(get_all_upstream_dependencies(db, dep, visited))
    return upstream

def uuid_like_hash(name: str) -> str:
    return hashlib.md5(name.encode()).hexdigest()[:8]

def process_incoming_alert(
    db: Session,
    service_id: str,
    message: str,
    severity: str,
    source: str = "Dynatrace",
    correlation_id: str = None,
    environment: str = "production",
    entity: str = None
) -> models.Incident:
    """
    Advanced Event Intelligence Engine:
    1. Ingestion & Canonical Normalization
    2. Suppression & Fingerprinting
    3. Time-Window Deduplication
    4. Topological Dependency Correlation
    5. Dynamic Blast Radius & Business Impact Calculation
    6. Intelligent P1–P4 Priority Scoring
    7. Multi-System Orchestration (PagerDuty, ServiceNow, Teams/Slack, Gemini AI)
    """
    # Seed default runbooks if missing
    seed_default_runbooks(db)

    # 1. Normalization & Fingerprinting
    is_suppressed = check_suppression(db, service_id, message, severity)
    
    if "Dynatrace Problem" in message:
        try:
            parts = message.split(":")
            prob_id = parts[0].replace("Dynatrace Problem", "").strip()
            event_fingerprint = f"dt-problem-{prob_id}"
        except Exception:
            event_fingerprint = f"{service_id}-{severity}-{message[:30]}"
    else:
        event_fingerprint = f"{service_id}-{severity}-{message[:30]}"

    corr_id = correlation_id or f"CORR-{uuid_like_hash(f'{service_id}-{message[:25]}')}"

    # Log Raw Event
    raw_event = models.RawEvent(
        source=source,
        service_id=service_id,
        message=message,
        severity=severity,
        is_suppressed=is_suppressed,
        event_fingerprint=event_fingerprint,
        correlation_id=corr_id,
        environment=environment,
        entity=entity or service_id
    )
    db.add(raw_event)

    # Log Canonical Event for enterprise audit
    canonical_event = models.CanonicalEvent(
        event_id=f"EVT-{uuid.uuid4().hex[:8]}",
        correlation_id=corr_id,
        source=source.lower().replace(" ", "_"),
        service_id=service_id,
        environment=environment,
        severity=severity.upper(),
        status="OPEN",
        problem_type="database_latency" if "database" in service_id.lower() or "latency" in message.lower() else "service_degradation",
        entity=entity or service_id,
        message=message,
        fingerprint=event_fingerprint,
        tags_json=json.dumps([source, severity.lower(), environment]),
        metadata_json=json.dumps({"raw_message": message})
    )
    db.add(canonical_event)
    db.commit()

    # Update service status
    service_obj = db.query(models.Service).filter(models.Service.id == service_id).first()
    if service_obj and not is_suppressed:
        service_obj.status = "CRITICAL" if severity.upper() == "CRITICAL" else "DEGRADED"
        db.commit()

    if is_suppressed:
        audit = models.AuditLog(
            action="Alert Suppressed",
            actor="System Suppression Engine",
            details=f"Alert for service '{service_id}' matched suppression rules. Muted."
        )
        db.add(audit)
        db.commit()
        return None

    # 2. Time-Window Deduplication Check (Same service within active state)
    active_incident = db.query(models.Incident).filter(
        models.Incident.primary_service_id == service_id,
        models.Incident.status != "RESOLVED"
    ).order_by(models.Incident.created_at.desc()).first()

    if active_incident:
        audit = models.AuditLog(
            incident_id=active_incident.id,
            action="Alert Deduplicated",
            actor="Correlation Engine",
            details=f"Duplicate alert on {service_id} suppressed and grouped under active Incident #{active_incident.id}."
        )
        db.add(audit)
        db.commit()
        return active_incident

    # 3. Topological Dependency Correlation
    correlated_root_cause_id = None
    if service_obj:
        upstreams = get_all_upstream_dependencies(db, service_id)
        for dep_id in upstreams:
            dep_incident = db.query(models.Incident).filter(
                models.Incident.primary_service_id == dep_id,
                models.Incident.status != "RESOLVED"
            ).first()
            if dep_incident:
                correlated_root_cause_id = dep_id
                audit = models.AuditLog(
                    incident_id=dep_incident.id,
                    action="Topological Correlation",
                    actor="Correlation Engine",
                    details=f"Downstream service '{service_id}' alert correlated under root cause '{dep_id}' (Incident #{dep_incident.id})."
                )
                db.add(audit)
                db.commit()
                return dep_incident

    # 4. New Incident Creation & Intelligence Enrichment
    # Compute Business Impact & Blast Radius
    impact_data = calculate_business_impact(db, service_id, severity)
    blast_radius = impact_data.get("downstream_services", [])
    
    # Calculate Dynamic Priority (P1–P4)
    priority, priority_reason = calculate_dynamic_priority(
        severity=severity,
        business_criticality=impact_data.get("business_criticality", "HIGH"),
        blast_radius_count=len(blast_radius),
        revenue_exposure=impact_data.get("estimated_revenue_exposure_hr", 15000)
    )

    if service_id == "claims-database":
        summary = "Claims Database - Latency Threshold Exceeded"
    elif service_id == "claims-api":
        summary = "Claims API Gateway - Service Degraded"
    elif service_id == "claims-portal":
        summary = "Insurance Claims web-portal - Latency Spiked"
    else:
        service_name = service_obj.name if service_obj else service_id
        summary = f"{service_name} - {message}"

    ts_now = int(datetime.datetime.utcnow().timestamp())
    dedup_key = f"nexus-{service_id}-{ts_now}"

    # 5. PagerDuty Incident Orchestration
    pd_id, pd_msg = pagerduty_connector.create_incident(
        dedup_key=dedup_key,
        summary=f"[{priority}] {summary}",
        severity=severity.lower(),
        service=service_id,
        metadata={"priority": priority, "blast_radius": blast_radius}
    )

    # 6. ServiceNow Ticket Sync
    snow_id, snow_msg = servicenow_connector.create_ticket(
        incident_id=pd_id or dedup_key,
        summary=summary,
        service_id=service_id,
        priority=priority
    )

    # 7. Gemini AI Incident Copilot RCA
    topology_info = get_topology_info(db)
    gemini_details_raw = gemini_service.generate_incident_insights(
        service_id=service_id,
        alert_message=message,
        topology_info=topology_info
    )

    # Parse AI response details
    ai_confidence = 94
    risk_level = "HIGH"
    runbook_id = "rb-db-pool-recovery" if "database" in service_id.lower() else "rb-gateway-traffic-rebalance"
    try:
        parsed_ai = json.loads(gemini_details_raw)
        ai_confidence = parsed_ai.get("confidence", 94)
        risk_level = parsed_ai.get("risk_level", "HIGH")
        runbook_id = parsed_ai.get("recommended_runbook", runbook_id)
    except Exception:
        pass

    target_pd_id = pd_id or dedup_key
    existing_pd = db.query(models.Incident).filter(models.Incident.pagerduty_id == target_pd_id).first()
    if existing_pd:
        target_pd_id = f"{target_pd_id}-{uuid.uuid4().hex[:4]}"

    # Save Enriched Incident
    new_incident = models.Incident(
        pagerduty_id=target_pd_id,
        servicenow_id=snow_id,
        status="TRIGGERED",
        priority=priority,
        priority_reason=priority_reason,
        primary_service_id=service_id,
        root_cause_service_id=correlated_root_cause_id or service_id,
        summary=summary,
        gemini_action_details=gemini_details_raw,
        ai_confidence=ai_confidence,
        risk_level=risk_level,
        business_impact_json=json.dumps(impact_data),
        blast_radius_json=json.dumps(blast_radius),
        runbook_id=runbook_id,
        remediation_status="AWAITING_APPROVAL" if risk_level in ["HIGH", "CRITICAL"] else "READY",
        tenant_id="org-default",
        created_at=datetime.datetime.utcnow()
    )
    db.add(new_incident)
    db.commit()
    db.refresh(new_incident)

    # Update affected services health status
    primary_svc = db.query(models.Service).filter(models.Service.id == (correlated_root_cause_id or service_id)).first()
    if primary_svc:
        primary_svc.status = "CRITICAL" if priority == "P1" else "DEGRADED"
    for blast_id in blast_radius:
        b_svc = db.query(models.Service).filter(models.Service.id == blast_id).first()
        if b_svc and b_svc.status == "HEALTHY":
            b_svc.status = "DEGRADED"
    db.commit()

    # 7b. NEXUS v2: Auto-attach to Problem Management and Deployment correlations
    try:
        from . import v2_services
        v2_services.attach_incident_to_problem(
            db=db,
            incident_id=new_incident.id,
            summary=summary,
            service_id=service_id,
            cost_exposure=float(impact_data.get("estimated_revenue_exposure_hr", 24000))
        )
        v2_services.correlate_incident_with_deployments(
            db=db,
            incident_id=new_incident.id,
            service_id=service_id,
            incident_created_at=new_incident.created_at
        )
    except Exception as ex:
        print(f"NEXUS v2 correlation hook error: {ex}")

    # 8. Dispatch Multi-Channel Notifications (Slack/Teams)
    notification_connector.send_incident_alert({
        "id": new_incident.id,
        "priority": priority,
        "summary": summary,
        "primary_service_id": service_id,
        "root_cause_service_id": new_incident.root_cause_service_id,
        "ai_confidence": ai_confidence,
        "runbook_id": runbook_id,
        "pagerduty_id": target_pd_id
    })

    # 9. Comprehensive Audit Trail Logging
    db.add(models.AuditLog(
        incident_id=new_incident.id,
        action="Incident Created",
        actor="Incident Intelligence Engine",
        details=f"Assigned Priority {priority}. {priority_reason}"
    ))
    db.add(models.AuditLog(
        incident_id=new_incident.id,
        action="PagerDuty Sync",
        actor="PagerDuty Connector",
        details=f"Incident dispatched to PagerDuty Events API v2 (Key: {target_pd_id}). Result: {pd_msg}"
    ))
    db.add(models.AuditLog(
        incident_id=new_incident.id,
        action="ServiceNow Sync",
        actor="ServiceNow Connector",
        details=f"ServiceNow record {snow_id} created. Priority: {priority}."
    ))
    db.add(models.AuditLog(
        incident_id=new_incident.id,
        action="Gemini AI RCA Generated",
        actor="Gemini Copilot",
        details=f"Identified root cause with {ai_confidence}% confidence. Risk level: {risk_level}."
    ))
    db.commit()

    return new_incident
