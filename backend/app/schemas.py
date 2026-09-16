from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DynatraceAlert(BaseModel):
    ProblemID: str
    ProblemTitle: str
    ProblemSeverity: str  # WARNING, ERROR, CRITICAL
    ImpactedEntity: str   # e.g., claims-database, claims-api
    Message: str
    State: str            # OPEN, RESOLVED

class RawEventCreate(BaseModel):
    source: str
    service_id: str
    message: str
    severity: str
    event_fingerprint: str

class RawEventSchema(BaseModel):
    id: int
    source: str
    service_id: str
    message: str
    severity: str
    timestamp: datetime
    is_suppressed: bool
    event_fingerprint: str
    correlation_id: Optional[str] = None
    environment: Optional[str] = "production"
    entity: Optional[str] = None

    class Config:
        orm_mode = True
        from_attributes = True

class ServiceSchema(BaseModel):
    id: str
    name: str
    tier: str
    status: str
    depends_on: str
    business_criticality: Optional[str] = "HIGH"
    customer_criticality: Optional[str] = "HIGH"
    revenue_impact_per_hr: Optional[int] = 15000
    sla_target_min: Optional[int] = 30
    business_owner: Optional[str] = "Claims Operations"
    technical_owner: Optional[str] = "SRE Core Team"

    class Config:
        orm_mode = True
        from_attributes = True

class IncidentSchema(BaseModel):
    id: int
    pagerduty_id: Optional[str] = None
    servicenow_id: Optional[str] = None
    status: str
    priority: Optional[str] = "P2"
    priority_reason: Optional[str] = None
    primary_service_id: str
    root_cause_service_id: Optional[str] = None
    summary: str
    gemini_action_details: Optional[str] = None
    ai_confidence: Optional[int] = 94
    risk_level: Optional[str] = "HIGH"
    business_impact_json: Optional[str] = None
    blast_radius_json: Optional[str] = None
    postmortem_markdown: Optional[str] = None
    runbook_id: Optional[str] = None
    remediation_status: Optional[str] = "PENDING"
    tenant_id: Optional[str] = "org-default"
    created_at: datetime
    resolved_at: Optional[datetime] = None

    class Config:
        orm_mode = True
        from_attributes = True

class CanonicalEventCreate(BaseModel):
    event_id: Optional[str] = None
    correlation_id: Optional[str] = None
    source: str = "generic_webhook"
    service_id: str
    environment: str = "production"
    severity: str = "WARNING"
    status: str = "OPEN"
    problem_type: Optional[str] = None
    entity: Optional[str] = None
    message: str
    tags: Optional[List[str]] = None
    metadata: Optional[dict] = None

class CanonicalEventSchema(BaseModel):
    id: int
    event_id: str
    correlation_id: str
    source: str
    service_id: str
    environment: str
    severity: str
    status: str
    problem_type: Optional[str]
    entity: Optional[str]
    message: str
    fingerprint: str
    tags_json: Optional[str]
    metadata_json: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class RunbookSchema(BaseModel):
    id: str
    name: str
    description: str
    target_service_id: str
    risk_level: str
    required_role: str
    action_type: str
    command_template: str
    validation_query: Optional[str]
    is_enabled: bool

    class Config:
        orm_mode = True
        from_attributes = True

class RunbookExecuteRequest(BaseModel):
    runbook_id: str
    incident_id: Optional[int] = None
    is_dry_run: bool = False
    role: str = "OPERATOR"

class RemediationApprovalSchema(BaseModel):
    id: int
    incident_id: int
    runbook_id: str
    risk_level: str
    status: str
    requested_by: str
    decided_by: Optional[str]
    decision_notes: Optional[str]
    created_at: datetime
    decided_at: Optional[datetime]

    class Config:
        orm_mode = True
        from_attributes = True

class ApprovalDecisionRequest(BaseModel):
    approval_id: int
    decision: str  # APPROVED, REJECTED
    role: str
    notes: Optional[str] = None

class IntegrationModeRequest(BaseModel):
    mode: str  # event_driven, polling, hybrid

class SuppressionRuleCreate(BaseModel):
    target_field: str
    match_pattern: str
    reason: str

class SuppressionRuleSchema(BaseModel):
    id: int
    target_field: str
    match_pattern: str
    reason: str
    enabled: bool

    class Config:
        orm_mode = True
        from_attributes = True

class AuditLogSchema(BaseModel):
    id: int
    incident_id: Optional[int]
    action: str
    actor: str
    details: Optional[str]
    timestamp: datetime

    class Config:
        orm_mode = True
        from_attributes = True

class TriggerLatencyRequest(BaseModel):
    latency_ms: int = 4000

class RoleSelector(BaseModel):
    role: str  # Admin, Operator, Viewer, SRE, Incident Manager

class GeminiChatRequest(BaseModel):
    query: str
    incident_id: Optional[int] = None
    service_id: Optional[str] = None

