import datetime
import uuid
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, Date
from sqlalchemy.orm import relationship
from .database import Base

class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    tier = Column(String, nullable=False)  # Tier 1, Tier 2, etc.
    status = Column(String, default="HEALTHY")  # HEALTHY, DEGRADED, CRITICAL
    depends_on = Column(String, default="")  # Comma-separated list of service IDs they depend on
    business_criticality = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    customer_criticality = Column(String, default="HIGH")  # CRITICAL, HIGH, MEDIUM, LOW
    revenue_impact_per_hr = Column(Integer, default=15000)  # USD estimated revenue exposure / hr
    sla_target_min = Column(Integer, default=30)  # SLA target in minutes
    business_owner = Column(String, default="Claims Operations")
    technical_owner = Column(String, default="SRE Core Team")

class RawEvent(Base):
    __tablename__ = "raw_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    source = Column(String, default="Dynatrace")
    service_id = Column(String, ForeignKey("services.id"), nullable=False)
    message = Column(Text, nullable=False)
    severity = Column(String, default="WARNING")  # WARNING, ERROR, CRITICAL
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    is_suppressed = Column(Boolean, default=False)
    event_fingerprint = Column(String, index=True)
    correlation_id = Column(String, index=True, nullable=True)
    environment = Column(String, default="production")
    entity = Column(String, nullable=True)
    raw_payload = Column(Text, nullable=True)

class CanonicalEvent(Base):
    """
    NEXUS Canonical Event Schema (v1.0)
    All monitoring sources (Dynatrace, CloudWatch, Prometheus, Datadog, Webhooks)
    are normalized into this standard event schema.
    """
    __tablename__ = "canonical_events"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    event_id = Column(String, unique=True, index=True, nullable=False)
    correlation_id = Column(String, index=True, nullable=False)
    source = Column(String, nullable=False)  # dynatrace, cloudwatch, prometheus, datadog, generic_webhook
    service_id = Column(String, ForeignKey("services.id"), nullable=False)
    environment = Column(String, default="production")
    severity = Column(String, default="WARNING")  # INFO, WARNING, ERROR, CRITICAL
    status = Column(String, default="OPEN")  # OPEN, RESOLVED
    problem_type = Column(String, nullable=True)  # database_latency, api_timeout, cpu_spike, memory_pressure
    entity = Column(String, nullable=True)  # host/pod/container/database identifier
    message = Column(Text, nullable=False)
    fingerprint = Column(String, index=True, nullable=False)
    tags_json = Column(Text, nullable=True)
    metadata_json = Column(Text, nullable=True)
    raw_payload = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    pagerduty_id = Column(String, unique=True, index=True, nullable=True)
    servicenow_id = Column(String, unique=True, index=True, nullable=True)
    status = Column(String, default="TRIGGERED")  # TRIGGERED, ACKNOWLEDGED, RESOLVED
    priority = Column(String, default="P2")  # P1, P2, P3, P4
    priority_reason = Column(Text, nullable=True)
    primary_service_id = Column(String, ForeignKey("services.id"), nullable=False)
    root_cause_service_id = Column(String, ForeignKey("services.id"), nullable=True)
    summary = Column(Text, nullable=False)
    gemini_action_details = Column(Text, nullable=True)
    ai_confidence = Column(Integer, default=94)  # 0 to 100%
    risk_level = Column(String, default="HIGH")  # LOW, MEDIUM, HIGH, CRITICAL
    business_impact_json = Column(Text, nullable=True)
    blast_radius_json = Column(Text, nullable=True)
    postmortem_markdown = Column(Text, nullable=True)
    runbook_id = Column(String, nullable=True)
    remediation_status = Column(String, default="PENDING")  # PENDING, AWAITING_APPROVAL, RUNNING, COMPLETED, FAILED, SKIPPED
    tenant_id = Column(String, default="org-default")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)

    primary_service = relationship("Service", foreign_keys=[primary_service_id])
    root_cause_service = relationship("Service", foreign_keys=[root_cause_service_id])

class Runbook(Base):
    __tablename__ = "runbooks"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    target_service_id = Column(String, ForeignKey("services.id"), nullable=False)
    risk_level = Column(String, default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    required_role = Column(String, default="OPERATOR")  # OPERATOR, INCIDENT_MANAGER, SRE, ADMIN
    action_type = Column(String, default="restart")  # restart, scale, pool_reset, cache_clear
    command_template = Column(Text, nullable=False)
    validation_query = Column(Text, nullable=True)
    is_enabled = Column(Boolean, default=True)

class RemediationExecution(Base):
    __tablename__ = "remediation_executions"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    runbook_id = Column(String, ForeignKey("runbooks.id"), nullable=False)
    actor = Column(String, default="Operator")
    status = Column(String, default="SUCCESS")  # SUCCESS, FAILED, RUNNING
    is_dry_run = Column(Boolean, default=False)
    output_log = Column(Text, nullable=True)
    started_at = Column(DateTime, default=datetime.datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

class RemediationApproval(Base):
    __tablename__ = "remediation_approvals"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    runbook_id = Column(String, ForeignKey("runbooks.id"), nullable=False)
    risk_level = Column(String, default="HIGH")
    status = Column(String, default="PENDING")  # PENDING, APPROVED, REJECTED
    requested_by = Column(String, default="Gemini AI")
    decided_by = Column(String, nullable=True)
    decision_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    decided_at = Column(DateTime, nullable=True)

class SuppressionRule(Base):
    __tablename__ = "suppression_rules"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    target_field = Column(String, nullable=False)  # e.g., 'message', 'service_id', 'severity'
    match_pattern = Column(String, nullable=False)  # string or regex to match
    reason = Column(String, nullable=False)
    enabled = Column(Boolean, default=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=True)
    action = Column(String, nullable=False)  # e.g., Alert Normalization, Correlation, AI Summary, ServiceNow Sync
    actor = Column(String, default="System")  # e.g., System, Gemini, Operator (L1/L2/Admin)
    details = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

# ==============================================================================
# NEXUS v2 — TIER-1 ENTERPRISE MODELS
# ==============================================================================

class Problem(Base):
    """
    Groups recurring incidents sharing the same root-cause fingerprint.
    """
    __tablename__ = "problems"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    root_cause_fingerprint = Column(String, index=True, nullable=False)
    title = Column(String, nullable=False)
    primary_service = Column(String, ForeignKey("services.id"), nullable=False)
    first_seen_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_seen_at = Column(DateTime, default=datetime.datetime.utcnow)
    occurrence_count = Column(Integer, default=1)
    status = Column(String, default="ACTIVE")  # ACTIVE, MITIGATED, PERMANENTLY_FIXED
    estimated_cost_per_occurrence = Column(Float, default=24000.0)  # Currency exposure (e.g., INR / USD)
    recommended_permanent_fix = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    incidents = relationship("ProblemIncident", back_populates="problem", cascade="all, delete-orphan")
    action_items = relationship("PostmortemActionItem", back_populates="problem")

class ProblemIncident(Base):
    """
    Join table linking recurring incidents to a Problem record.
    """
    __tablename__ = "problem_incidents"

    problem_id = Column(String, ForeignKey("problems.id"), primary_key=True)
    incident_id = Column(Integer, ForeignKey("incidents.id"), primary_key=True)
    attached_at = Column(DateTime, default=datetime.datetime.utcnow)

    problem = relationship("Problem", back_populates="incidents")
    incident = relationship("Incident")

class PostmortemActionItem(Base):
    """
    Actionable task generated from incident postmortems or created manually.
    """
    __tablename__ = "postmortem_action_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(Integer, ForeignKey("incidents.id"), nullable=False)
    problem_id = Column(String, ForeignKey("problems.id"), nullable=True)
    description = Column(Text, nullable=False)
    owner = Column(String, default="sre-core@nexus.internal")
    due_date = Column(Date, nullable=True)
    status = Column(String, default="OPEN")  # OPEN, IN_PROGRESS, DONE, WONT_FIX
    source = Column(String, default="GEMINI_GENERATED")  # GEMINI_GENERATED, MANUAL
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    incident = relationship("Incident")
    problem = relationship("Problem", back_populates="action_items")

class Deployment(Base):
    """
    CI/CD deployment record used for incident correlation.
    """
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service = Column(String, ForeignKey("services.id"), nullable=False)
    version = Column(String, nullable=True)  # Git commit SHA or build ID, e.g. #482
    deployed_at = Column(DateTime, nullable=False, default=datetime.datetime.utcnow)
    deployed_by = Column(String, default="github-actions[bot]")
    source = Column(String, default="github_actions")  # github_actions, jenkins, manual
    rollback_available = Column(Boolean, default=True)
    rollback_command = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class IncidentDeploymentCorrelation(Base):
    """
    Correlates an incident to deployments occurring in proximity.
    """
    __tablename__ = "incident_deployment_correlations"

    incident_id = Column(Integer, ForeignKey("incidents.id"), primary_key=True)
    deployment_id = Column(String, ForeignKey("deployments.id"), primary_key=True)
    time_delta_seconds = Column(Integer, default=240)  # seconds between deploy and incident start
    correlation_confidence = Column(Float, default=0.91)  # 0.0 - 1.0 (e.g. 91%)

    incident = relationship("Incident")
    deployment = relationship("Deployment")

class DigestRun(Base):
    """
    Executive SRE Digest snapshot (weekly/monthly).
    """
    __tablename__ = "digest_runs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    period_start = Column(Date, nullable=False)
    period_end = Column(Date, nullable=False)
    total_incidents = Column(Integer, default=0)
    p1_count = Column(Integer, default=0)
    avg_mttr_minutes = Column(Float, default=3.8)
    top_problem_id = Column(String, ForeignKey("problems.id"), nullable=True)
    estimated_cost_saved = Column(Float, default=145000.0)  # Calculated downtime cost savings
    generated_summary = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.datetime.utcnow)
    recipients_json = Column(Text, default='["leadership@company.com", "sre-leads@company.com"]')
    pdf_filename = Column(String, nullable=True)

    top_problem = relationship("Problem")

class QueryCache(Base):
    """
    Cache for Ask NEXUS natural-language queries.
    """
    __tablename__ = "query_cache"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    query_text = Column(Text, nullable=False, index=True)
    response_text = Column(Text, nullable=False)
    supporting_data_json = Column(Text, nullable=True)
    generated_at = Column(DateTime, default=datetime.datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

