import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel

# ----------------- PROBLEMS -----------------

class ProblemBase(BaseModel):
    title: str
    primary_service: str
    status: str = "ACTIVE"
    estimated_cost_per_occurrence: float = 24000.0
    recommended_permanent_fix: Optional[str] = None

class ProblemStatusUpdate(BaseModel):
    status: str  # ACTIVE, MITIGATED, PERMANENTLY_FIXED

class ProblemSchema(ProblemBase):
    id: str
    root_cause_fingerprint: str
    first_seen_at: datetime.datetime
    last_seen_at: datetime.datetime
    occurrence_count: int
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True

class LinkedIncidentSummary(BaseModel):
    id: int
    summary: str
    status: str
    priority: str
    created_at: datetime.datetime
    pagerduty_id: Optional[str] = None

class ProblemDetailSchema(ProblemSchema):
    linked_incidents: List[LinkedIncidentSummary] = []
    action_items_total: int = 0
    action_items_done: int = 0
    action_items_completion_pct: float = 0.0

# ----------------- ACTION ITEMS -----------------

class ActionItemCreate(BaseModel):
    description: str
    owner: Optional[str] = "sre-core@nexus.internal"
    due_date: Optional[datetime.date] = None
    problem_id: Optional[str] = None

class ActionItemUpdate(BaseModel):
    status: Optional[str] = None  # OPEN, IN_PROGRESS, DONE, WONT_FIX
    owner: Optional[str] = None
    due_date: Optional[datetime.date] = None
    description: Optional[str] = None

class ActionItemSchema(BaseModel):
    id: str
    incident_id: int
    problem_id: Optional[str] = None
    description: str
    owner: Optional[str] = None
    due_date: Optional[datetime.date] = None
    status: str
    source: str
    created_at: datetime.datetime
    updated_at: datetime.datetime

    class Config:
        orm_mode = True

# ----------------- DEPLOYMENTS -----------------

class DeployWebhookPayload(BaseModel):
    service: str
    version: Optional[str] = None  # e.g. #482 or sha1
    deployed_by: Optional[str] = "github-actions[bot]"
    source: Optional[str] = "github_actions"
    rollback_available: Optional[bool] = True
    rollback_command: Optional[str] = None

class DeploymentSchema(BaseModel):
    id: str
    service: str
    version: Optional[str]
    deployed_at: datetime.datetime
    deployed_by: Optional[str]
    source: Optional[str]
    rollback_available: bool
    rollback_command: Optional[str]

    class Config:
        orm_mode = True

class DeploymentCorrelationSchema(BaseModel):
    deployment: DeploymentSchema
    time_delta_seconds: int
    correlation_confidence: float

# ----------------- ASK NEXUS -----------------

class AskNexusRequest(BaseModel):
    query: str

class AskNexusResponse(BaseModel):
    answer: str
    supporting_data: Optional[Dict[str, Any]] = None
    confidence: str = "high"
    suggested_queries: List[str] = []

# ----------------- EXECUTIVE DIGEST -----------------

class DigestGenerateRequest(BaseModel):
    period_days: int = 7

class DigestRunSchema(BaseModel):
    id: str
    period_start: datetime.date
    period_end: datetime.date
    total_incidents: int
    p1_count: int
    avg_mttr_minutes: float
    top_problem_id: Optional[str] = None
    top_problem_title: Optional[str] = None
    estimated_cost_saved: float
    generated_summary: str
    sent_at: datetime.datetime
    recipients: List[str] = []

    class Config:
        orm_mode = True

# ----------------- ROI & FINANCIAL IMPACT -----------------

class RoiMetricsSchema(BaseModel):
    total_incidents_remediated: int
    manual_mttr_minutes: float
    nexus_mttr_minutes: float
    mttr_reduction_pct: float
    hourly_outage_cost_usd: float
    total_cost_saved_usd: float
    total_cost_saved_formatted: str
    top_recurring_problem: Optional[Dict[str, Any]] = None
