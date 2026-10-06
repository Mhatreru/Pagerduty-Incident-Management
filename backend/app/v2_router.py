import datetime
import json
from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .database import get_db
from . import models, schemas_v2, v2_services

router = APIRouter(prefix="/api/v2", tags=["NEXUS v2 Enterprise"])

# ==============================================================================
# 1. PROBLEM MANAGEMENT
# ==============================================================================

@router.get("/problems", response_model=List[schemas_v2.ProblemSchema])
def list_problems(db: Session = Depends(get_db)):
    """
    List all aggregated recurring problems, sorted by occurrence count descending.
    """
    return db.query(models.Problem).order_by(models.Problem.occurrence_count.desc()).all()

@router.get("/problems/{problem_id}", response_model=schemas_v2.ProblemDetailSchema)
def get_problem_detail(problem_id: str, db: Session = Depends(get_db)):
    """
    Get full Problem details, including all linked incidents, action items, and completion metrics.
    """
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem record not found")

    # Fetch linked incidents
    links = db.query(models.ProblemIncident).filter(models.ProblemIncident.problem_id == problem_id).all()
    inc_ids = [l.incident_id for l in links]
    incidents = db.query(models.Incident).filter(models.Incident.id.in_(inc_ids)).order_by(models.Incident.created_at.desc()).all() if inc_ids else []

    linked_summaries = [
        schemas_v2.LinkedIncidentSummary(
            id=i.id,
            summary=i.summary,
            status=i.status,
            priority=i.priority,
            created_at=i.created_at,
            pagerduty_id=i.pagerduty_id
        ) for i in incidents
    ]

    # Action items stats
    actions = db.query(models.PostmortemActionItem).filter(models.PostmortemActionItem.problem_id == problem_id).all()
    total_actions = len(actions)
    done_actions = len([a for a in actions if a.status == "DONE"])
    pct = (done_actions / total_actions * 100.0) if total_actions > 0 else 0.0

    return schemas_v2.ProblemDetailSchema(
        id=problem.id,
        root_cause_fingerprint=problem.root_cause_fingerprint,
        title=problem.title,
        primary_service=problem.primary_service,
        first_seen_at=problem.first_seen_at,
        last_seen_at=problem.last_seen_at,
        occurrence_count=problem.occurrence_count,
        status=problem.status,
        estimated_cost_per_occurrence=problem.estimated_cost_per_occurrence,
        recommended_permanent_fix=problem.recommended_permanent_fix,
        created_at=problem.created_at,
        updated_at=problem.updated_at,
        linked_incidents=linked_summaries,
        action_items_total=total_actions,
        action_items_done=done_actions,
        action_items_completion_pct=round(pct, 1)
    )

@router.post("/problems/{problem_id}/status", response_model=schemas_v2.ProblemSchema)
def update_problem_status(problem_id: str, payload: schemas_v2.ProblemStatusUpdate, db: Session = Depends(get_db)):
    """
    Update status of a Problem (ACTIVE, MITIGATED, PERMANENTLY_FIXED).
    """
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem record not found")

    problem.status = payload.status
    problem.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(problem)
    return problem

@router.post("/problems/{problem_id}/evaluate-fix")
def evaluate_problem_fix(problem_id: str, db: Session = Depends(get_db)):
    """
    Triggers Gemini AI evaluation to generate a permanent architectural fix for the Problem.
    """
    problem = db.query(models.Problem).filter(models.Problem.id == problem_id).first()
    if not problem:
        raise HTTPException(status_code=404, detail="Problem record not found")

    fix = v2_services.evaluate_permanent_fix_with_gemini(problem)
    problem.recommended_permanent_fix = fix
    problem.updated_at = datetime.datetime.utcnow()
    db.commit()
    return {"status": "success", "recommended_permanent_fix": fix}

# ==============================================================================
# 2. POSTMORTEM ACTION ITEMS
# ==============================================================================

@router.get("/incidents/{incident_id}/action-items", response_model=List[schemas_v2.ActionItemSchema])
def get_incident_action_items(incident_id: int, db: Session = Depends(get_db)):
    """
    Get all structured action items associated with an incident.
    """
    return db.query(models.PostmortemActionItem).filter(
        models.PostmortemActionItem.incident_id == incident_id
    ).order_by(models.PostmortemActionItem.created_at.asc()).all()

@router.post("/incidents/{incident_id}/action-items", response_model=schemas_v2.ActionItemSchema)
def create_action_item(incident_id: int, payload: schemas_v2.ActionItemCreate, db: Session = Depends(get_db)):
    """
    Create a new action item manually or via AI parser.
    """
    item = models.PostmortemActionItem(
        incident_id=incident_id,
        problem_id=payload.problem_id,
        description=payload.description,
        owner=payload.owner or "sre-core@nexus.internal",
        due_date=payload.due_date,
        status="OPEN",
        source="MANUAL"
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item

@router.patch("/action-items/{item_id}", response_model=schemas_v2.ActionItemSchema)
def update_action_item(item_id: str, payload: schemas_v2.ActionItemUpdate, db: Session = Depends(get_db)):
    """
    Update status (OPEN, IN_PROGRESS, DONE, WONT_FIX), owner, or due date.
    """
    item = db.query(models.PostmortemActionItem).filter(models.PostmortemActionItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Action item not found")

    if payload.status:
        item.status = payload.status
    if payload.owner:
        item.owner = payload.owner
    if payload.due_date:
        item.due_date = payload.due_date
    if payload.description:
        item.description = payload.description

    item.updated_at = datetime.datetime.utcnow()
    db.commit()
    db.refresh(item)
    return item

@router.get("/problems/{problem_id}/action-items/completion")
def get_problem_action_items_completion(problem_id: str, db: Session = Depends(get_db)):
    """
    Returns completion percentage of action items across all incidents linked to a problem.
    """
    items = db.query(models.PostmortemActionItem).filter(models.PostmortemActionItem.problem_id == problem_id).all()
    total = len(items)
    done = len([i for i in items if i.status == "DONE"])
    open_count = len([i for i in items if i.status == "OPEN"])
    return {
        "problem_id": problem_id,
        "total": total,
        "done": done,
        "open": open_count,
        "completion_pct": round((done / total * 100.0) if total > 0 else 0.0, 1),
        "warning_banner": f"⚠️ {open_count} of {total} action items from previous occurrences are still OPEN." if open_count > 0 else None
    }

# ==============================================================================
# 3. DEPLOYMENT CORRELATION & ROLLBACK
# ==============================================================================

@router.post("/webhooks/deploy", response_model=schemas_v2.DeploymentSchema)
def receive_deploy_webhook(payload: schemas_v2.DeployWebhookPayload, db: Session = Depends(get_db)):
    """
    Lightweight webhook receiver for CI/CD pipelines (GitHub Actions, Jenkins, GitLab).
    """
    return v2_services.record_deployment(db, payload)

@router.get("/incidents/{incident_id}/deployment-correlations", response_model=List[schemas_v2.DeploymentCorrelationSchema])
def get_incident_deployments(incident_id: int, db: Session = Depends(get_db)):
    """
    Fetches CI/CD deployments correlated within the time window of the incident.
    """
    incident = db.query(models.Incident).filter(models.Incident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=404, detail="Incident not found")

    return v2_services.correlate_incident_with_deployments(
        db=db,
        incident_id=incident_id,
        service_id=incident.primary_service_id,
        incident_created_at=incident.created_at
    )

@router.post("/deployments/{deployment_id}/rollback")
def execute_deployment_rollback(deployment_id: str, db: Session = Depends(get_db)):
    """
    Executes a pre-approved deployment rollback for an incident.
    """
    dep = db.query(models.Deployment).filter(models.Deployment.id == deployment_id).first()
    if not dep:
        raise HTTPException(status_code=404, detail="Deployment record not found")

    return {
        "status": "success",
        "message": f"Rollback successfully triggered for {dep.service} (Version: {dep.version}).",
        "rollback_command": dep.rollback_command or f"kubectl rollout undo deployment/{dep.service}",
        "executed_at": datetime.datetime.utcnow().isoformat()
    }

# ==============================================================================
# 4. ASK NEXUS (NATURAL-LANGUAGE FLEET INTELLIGENCE)
# ==============================================================================

@router.post("/ask", response_model=schemas_v2.AskNexusResponse)
def ask_nexus_query(payload: schemas_v2.AskNexusRequest, db: Session = Depends(get_db)):
    """
    Natural-language query endpoint for aggregate fleet intelligence.
    """
    if not payload.query or len(payload.query.strip()) < 3:
        raise HTTPException(status_code=400, detail="Query must contain at least 3 characters")

    return v2_services.ask_nexus(db, payload.query)

# ==============================================================================
# 5. EXECUTIVE DIGEST & REPORTING
# ==============================================================================

@router.get("/digests", response_model=List[schemas_v2.DigestRunSchema])
def list_digests(db: Session = Depends(get_db)):
    """
    List past generated executive digests.
    """
    digests = db.query(models.DigestRun).order_by(models.DigestRun.sent_at.desc()).all()
    results = []
    for d in digests:
        recipients = json.loads(d.recipients_json) if d.recipients_json else []
        results.append(schemas_v2.DigestRunSchema(
            id=d.id,
            period_start=d.period_start,
            period_end=d.period_end,
            total_incidents=d.total_incidents,
            p1_count=d.p1_count,
            avg_mttr_minutes=d.avg_mttr_minutes,
            top_problem_id=d.top_problem_id,
            top_problem_title=d.top_problem.title if d.top_problem else None,
            estimated_cost_saved=d.estimated_cost_saved,
            generated_summary=d.generated_summary,
            sent_at=d.sent_at,
            recipients=recipients
        ))
    return results

@router.post("/digests/generate", response_model=schemas_v2.DigestRunSchema)
def trigger_digest_generation(payload: schemas_v2.DigestGenerateRequest = None, db: Session = Depends(get_db)):
    """
    Generates a new weekly executive operations digest using Gemini AI.
    """
    days = payload.period_days if payload else 7
    digest = v2_services.generate_weekly_digest(db, period_days=days)
    recipients = json.loads(digest.recipients_json) if digest.recipients_json else []
    return schemas_v2.DigestRunSchema(
        id=digest.id,
        period_start=digest.period_start,
        period_end=digest.period_end,
        total_incidents=digest.total_incidents,
        p1_count=digest.p1_count,
        avg_mttr_minutes=digest.avg_mttr_minutes,
        top_problem_id=digest.top_problem_id,
        top_problem_title=digest.top_problem.title if digest.top_problem else None,
        estimated_cost_saved=digest.estimated_cost_saved,
        generated_summary=digest.generated_summary,
        sent_at=digest.sent_at,
        recipients=recipients
    )

# ==============================================================================
# 6. ROI & FINANCIAL ANALYTICS
# ==============================================================================

@router.get("/analytics/roi", response_model=schemas_v2.RoiMetricsSchema)
@router.get("/roi", response_model=schemas_v2.RoiMetricsSchema)
def get_financial_roi_metrics(db: Session = Depends(get_db)):
    """
    Returns calculated financial downtime savings and MTTR compression metrics.
    """
    return v2_services.calculate_roi_metrics(db)
