import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
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
