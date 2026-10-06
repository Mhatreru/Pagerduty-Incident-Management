export interface Service {
  id: string;
  name: string;
  tier: string;
  status: 'HEALTHY' | 'DEGRADED' | 'CRITICAL';
  depends_on: string;
  business_criticality?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  customer_criticality?: string;
  revenue_impact_per_hr?: number;
  sla_target_min?: number;
  business_owner?: string;
  technical_owner?: string;
}

export interface RawEvent {
  id: number;
  source: string;
  service_id: string;
  message: string;
  severity: 'WARNING' | 'ERROR' | 'CRITICAL' | 'INFO';
  timestamp: string;
  is_suppressed: boolean;
  event_fingerprint: string;
  correlation_id?: string;
  environment?: string;
}

export interface Incident {
  id: number;
  pagerduty_id?: string;
  servicenow_id?: string;
  status: 'TRIGGERED' | 'ACKNOWLEDGED' | 'RESOLVED';
  priority?: 'P1' | 'P2' | 'P3' | 'P4';
  priority_reason?: string;
  primary_service_id: string;
  root_cause_service_id?: string;
  summary: string;
  gemini_action_details?: string;
  ai_confidence?: number;
  risk_level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  business_impact_json?: string;
  blast_radius_json?: string;
  postmortem_markdown?: string;
  runbook_id?: string;
  remediation_status?: 'PENDING' | 'AWAITING_APPROVAL' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'READY';
  tenant_id?: string;
  created_at: string;
  resolved_at?: string;
}

export interface Runbook {
  id: string;
  name: string;
  description: string;
  target_service_id: string;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  required_role: string;
  action_type: string;
  command_template: string;
  is_enabled: boolean;
}

export interface RemediationApproval {
  id: number;
  incident_id: number;
  runbook_id: string;
  risk_level: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requested_by: string;
  decided_by?: string;
  decision_notes?: string;
  created_at: string;
  decided_at?: string;
}

export interface SuppressionRule {
  id: number;
  target_field: string;
  match_pattern: string;
  reason: string;
  enabled: boolean;
}

export interface AuditLog {
  id: number;
  incident_id?: number;
  action: string;
  actor: string;
  details?: string;
  timestamp: string;
}

export interface Analytics {
  raw_alerts: number;
  open_incidents: number;
  p1_incidents: number;
  alert_reduction_rate: number;
  mttd_minutes: number;
  mttr_minutes: number;
  sla_compliance_rate: number;
  timeline: Array<{ day: string; RawAlerts: number; Incidents: number }>;
  service_distribution: Array<{ name: string; incidents: number }>;
}

export interface PlatformHealth {
  status: 'HEALTHY' | 'DEGRADED' | 'UNAVAILABLE';
  timestamp: string;
  version: string;
  database: string;
  event_bus: {
    queue_depth: number;
    total_ingested: number;
    total_processed: number;
    total_failed: number;
  };
  connectors: {
    dynatrace: string;
    pagerduty: string;
    gemini_ai: string;
    servicenow: string;
  };
  ingestion_mode: string;
}

// ----------------- NEXUS v2 TIER-1 ENTERPRISE TYPES -----------------

export interface Problem {
  id: string;
  root_cause_fingerprint: string;
  title: string;
  primary_service: string;
  first_seen_at: string;
  last_seen_at: string;
  occurrence_count: number;
  status: 'ACTIVE' | 'MITIGATED' | 'PERMANENTLY_FIXED';
  estimated_cost_per_occurrence: number;
  recommended_permanent_fix?: string;
  created_at: string;
  updated_at: string;
}

export interface LinkedIncidentSummary {
  id: number;
  summary: string;
  status: string;
  priority: string;
  created_at: string;
  pagerduty_id?: string;
}

export interface ProblemDetail extends Problem {
  linked_incidents: LinkedIncidentSummary[];
  action_items_total: number;
  action_items_done: number;
  action_items_completion_pct: number;
}

export interface PostmortemActionItem {
  id: string;
  incident_id: number;
  problem_id?: string;
  description: string;
  owner?: string;
  due_date?: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'DONE' | 'WONT_FIX';
  source: 'GEMINI_GENERATED' | 'MANUAL';
  created_at: string;
  updated_at: string;
}

export interface Deployment {
  id: string;
  service: string;
  version?: string;
  deployed_at: string;
  deployed_by?: string;
  source?: string;
  rollback_available: boolean;
  rollback_command?: string;
}

export interface DeploymentCorrelation {
  deployment: Deployment;
  time_delta_seconds: number;
  correlation_confidence: number;
}

export interface DigestRun {
  id: string;
  period_start: string;
  period_end: string;
  total_incidents: number;
  p1_count: number;
  avg_mttr_minutes: number;
  top_problem_id?: string;
  top_problem_title?: string;
  estimated_cost_saved: number;
  generated_summary: string;
  sent_at: string;
  recipients: string[];
}

export interface RoiMetrics {
  total_incidents_remediated: number;
  manual_mttr_minutes: number;
  nexus_mttr_minutes: number;
  mttr_reduction_pct: number;
  hourly_outage_cost_usd: number;
  total_cost_saved_usd: number;
  total_cost_saved_formatted: string;
  top_recurring_problem?: {
    title: string;
    occurrences: number;
    service: string;
    exposure: number;
  };
}


