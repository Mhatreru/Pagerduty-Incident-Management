import json
from typing import Dict, Any, List, Tuple
from sqlalchemy.orm import Session
from . import models

def get_downstream_dependents(db: Session, root_service_id: str) -> List[str]:
    """
    Finds all downstream services that depend directly or indirectly on root_service_id.
    """
    all_services = db.query(models.Service).all()
    downstream = []
    
    # Direct dependents
    to_visit = [root_service_id]
    visited = set()

    while to_visit:
        curr = to_visit.pop(0)
        if curr in visited:
            continue
        visited.add(curr)
        for s in all_services:
            if s.depends_on and curr in [d.strip() for d in s.depends_on.split(",")]:
                if s.id not in downstream and s.id != root_service_id:
                    downstream.append(s.id)
                    to_visit.append(s.id)
    return downstream

def calculate_business_impact(db: Session, service_id: str, severity: str) -> Dict[str, Any]:
    svc = db.query(models.Service).filter(models.Service.id == service_id).first()
    downstream = get_downstream_dependents(db, service_id)
    
    # Compute impacted users and financial exposure
    base_users = 12500 if "portal" in service_id or "database" in service_id else 4500
    if len(downstream) > 1:
        base_users += len(downstream) * 3500

    revenue_hr = getattr(svc, "revenue_impact_per_hr", 15000) if svc else 10000
    total_revenue_exposure = revenue_hr * (1 + len(downstream) * 0.5)

    sla_risk = "CRITICAL" if severity == "CRITICAL" or len(downstream) >= 2 else "AT_RISK" if severity == "ERROR" else "HEALTHY"

    return {
        "service_id": service_id,
        "business_criticality": getattr(svc, "business_criticality", "HIGH") if svc else "HIGH",
        "affected_users": base_users,
        "transactions_per_min": 840 if "database" in service_id else 320,
        "estimated_revenue_exposure_hr": total_revenue_exposure,
        "sla_risk": sla_risk,
        "downstream_services": downstream,
        "total_blast_radius_nodes": len(downstream) + 1
    }

def calculate_dynamic_priority(
    severity: str,
    business_criticality: str,
    blast_radius_count: int,
    revenue_exposure: float
) -> Tuple[str, str]:
    """
    Intelligent Priority Calculation:
    Score = Technical Severity + Business Impact + Blast Radius + Financial Exposure
    Output: (Priority, Reason)
    """
    reasons = []

    # Score technical severity
    sev_score = {"CRITICAL": 40, "ERROR": 25, "WARNING": 15, "INFO": 5}.get(severity.upper(), 15)
    reasons.append(f"Severity is {severity.upper()}")

    # Score business criticality
    crit_score = {"CRITICAL": 35, "HIGH": 25, "MEDIUM": 15, "LOW": 5}.get(business_criticality.upper(), 20)
    reasons.append(f"{business_criticality} business criticality")

    # Score blast radius
    blast_score = min(blast_radius_count * 10, 25)
    if blast_radius_count > 1:
        reasons.append(f"{blast_radius_count} services in blast radius")

    total_score = sev_score + crit_score + blast_score

    if total_score >= 80 or severity == "CRITICAL" and blast_radius_count >= 2:
        priority = "P1"
        summary_reason = f"P1 Critical Outage: {', '.join(reasons)}. Estimated exposure: ${revenue_exposure:,.0f}/hr."
    elif total_score >= 55:
        priority = "P2"
        summary_reason = f"P2 Major Incident: {', '.join(reasons)}."
    elif total_score >= 35:
        priority = "P3"
        summary_reason = f"P3 Moderate Incident: {', '.join(reasons)}."
    else:
        priority = "P4"
        summary_reason = f"P4 Low Priority Alert: Non-critical impact."

    return priority, summary_reason
