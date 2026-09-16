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

