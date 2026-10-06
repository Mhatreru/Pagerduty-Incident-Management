import datetime
import uuid
from sqlalchemy.orm import Session
from . import models

def seed_v2_enterprise_data(db: Session):
    """
    Seeds comprehensive data for NEXUS v2 Tier-1 capabilities:
    1. Recurring Problems with linked incidents
    2. Postmortem action items (3 open, 1 done)
    3. Deployments with correlation to claims-database
    4. Past executive digests
    """
    now = datetime.datetime.utcnow()

    # 1. Top Recurring Problem: Claims DB Pool Exhaustion
    prob = db.query(models.Problem).filter(models.Problem.primary_service == "claims-database").first()
    if not prob:
        prob = models.Problem(
            id=str(uuid.uuid4()),
            root_cause_fingerprint="claims-database-pool-exhaustion-8x",
            title="Claims DB Connection Pool Exhaustion",
            primary_service="claims-database",
            first_seen_at=now - datetime.timedelta(days=22),
            last_seen_at=now - datetime.timedelta(hours=2),
            occurrence_count=8,
            status="ACTIVE",
            estimated_cost_per_occurrence=24000.0,
            recommended_permanent_fix=(
                "1. Deploy PgBouncer in Transaction Pooling Mode: Insert connection pooler proxy between application containers and primary database socket.\n"
                "2. Add Composite Index: Create index on claims (policy_id, status, filing_date) to eliminate full-table scan timeouts.\n"
                "3. Configure Aggressive Statement Timeouts: Set statement_timeout = '4500ms' to prevent zombie queries from starving the pool."
            ),
            created_at=now - datetime.timedelta(days=22),
            updated_at=now - datetime.timedelta(hours=2)
        )
        db.add(prob)
        db.flush()

    # Link existing incidents to this problem
    incidents = db.query(models.Incident).all()
    for inc in incidents:
        link_exists = db.query(models.ProblemIncident).filter(
            models.ProblemIncident.problem_id == prob.id,
            models.ProblemIncident.incident_id == inc.id
        ).first()
        if not link_exists:
            db.add(models.ProblemIncident(
                problem_id=prob.id,
                incident_id=inc.id,
                attached_at=inc.created_at
            ))

    # 2. Action Items (3 OPEN, 1 DONE)
    first_inc = incidents[0] if incidents else None
    if first_inc:
        existing_actions = db.query(models.PostmortemActionItem).filter(
            models.PostmortemActionItem.problem_id == prob.id
        ).all()
        if not existing_actions:
            actions = [
                models.PostmortemActionItem(
                    id=str(uuid.uuid4()),
                    incident_id=first_inc.id,
                    problem_id=prob.id,
                    description="Implement PgBouncer connection pooling sidecar in Kubernetes Helm charts",
                    owner="sre-infra@nexus.internal",
                    due_date=(now + datetime.timedelta(days=5)).date(),
                    status="OPEN",
                    source="GEMINI_GENERATED",
                    created_at=now - datetime.timedelta(days=2)
                ),
                models.PostmortemActionItem(
                    id=str(uuid.uuid4()),
                    incident_id=first_inc.id,
                    problem_id=prob.id,
                    description="Audit long-running SELECT queries on claims table and apply composite indexing",
                    owner="db-core@nexus.internal",
                    due_date=(now + datetime.timedelta(days=2)).date(),
                    status="OPEN",
                    source="GEMINI_GENERATED",
                    created_at=now - datetime.timedelta(days=2)
                ),
                models.PostmortemActionItem(
                    id=str(uuid.uuid4()),
                    incident_id=first_inc.id,
                    problem_id=prob.id,
                    description="Set aggressive client-side connection timeout (3000ms) on Claims API Gateway",
                    owner="backend-team@nexus.internal",
                    due_date=(now + datetime.timedelta(days=7)).date(),
                    status="OPEN",
                    source="GEMINI_GENERATED",
                    created_at=now - datetime.timedelta(days=2)
                ),
                models.PostmortemActionItem(
                    id=str(uuid.uuid4()),
                    incident_id=first_inc.id,
                    problem_id=prob.id,
                    description="Configure Dynatrace APM alert threshold on Postgres active_connections > 80%",
                    owner="observability-lead@nexus.internal",
                    due_date=(now - datetime.timedelta(days=1)).date(),
                    status="DONE",
                    source="MANUAL",
                    created_at=now - datetime.timedelta(days=3)
                )
            ]
            for a in actions:
                db.add(a)

    # 3. Deployments (Deploy #482 and Deploy #481)
    dep_exists = db.query(models.Deployment).filter(models.Deployment.version == "#482").first()
    if not dep_exists:
        dep482 = models.Deployment(
            id=str(uuid.uuid4()),
            service="claims-database",
            version="#482",
            deployed_at=now - datetime.timedelta(minutes=4),
            deployed_by="github-actions[bot]",
            source="github_actions",
            rollback_available=True,
            rollback_command="kubectl rollout undo deployment/claims-database -n production",
            created_at=now - datetime.timedelta(minutes=4)
        )
        db.add(dep482)
        db.flush()

        dep481 = models.Deployment(
            id=str(uuid.uuid4()),
            service="claims-database",
            version="#481 (Stable)",
            deployed_at=now - datetime.timedelta(days=3),
            deployed_by="devops-lead@nexus.internal",
            source="github_actions",
            rollback_available=True,
            rollback_command="kubectl rollout undo deployment/claims-database -n production --to-revision=481",
            created_at=now - datetime.timedelta(days=3)
        )
        db.add(dep481)

        # Correlate with all recent incidents
        for inc in incidents:
            corr_exists = db.query(models.IncidentDeploymentCorrelation).filter(
                models.IncidentDeploymentCorrelation.incident_id == inc.id,
                models.IncidentDeploymentCorrelation.deployment_id == dep482.id
            ).first()
            if not corr_exists:
                db.add(models.IncidentDeploymentCorrelation(
                    incident_id=inc.id,
                    deployment_id=dep482.id,
                    time_delta_seconds=240,  # 4 minutes
                    correlation_confidence=0.91  # 91% correlation
                ))

    # 4. Past Executive Digests
    digest_exists = db.query(models.DigestRun).first()
    if not digest_exists:
        d1 = models.DigestRun(
            id=str(uuid.uuid4()),
            period_start=(now - datetime.timedelta(days=7)).date(),
            period_end=now.date(),
            total_incidents=len(incidents) or 12,
            p1_count=len([i for i in incidents if i.priority == "P1"]) or 4,
            avg_mttr_minutes=3.8,
            top_problem_id=prob.id,
            estimated_cost_saved=185000.0,
            generated_summary=(
                "Weekly SRE Operations Review: Fleet stability remained resilient under simulated chaos. "
                "All 12 incidents were resolved within 4 minutes via automated runbook execution. "
                "The primary recurrence pattern is 'Claims DB Connection Pool Exhaustion' (8 occurrences,  exposure). "
                "Action items for PgBouncer sidecar integration are actively in progress to deliver permanent architectural mitigation."
            ),
            sent_at=now - datetime.timedelta(hours=6),
            recipients_json='["leadership@company.com", "sre-leads@company.com", "vp-engineering@company.com"]',
            pdf_filename="NEXUS_Executive_Digest_Latest.pdf"
        )
        db.add(d1)

    db.commit()
    print("NEXUS v2 Enterprise Data seeded successfully.")
