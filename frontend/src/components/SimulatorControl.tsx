import React, { useState, useEffect } from 'react';
import { 
  Button, TextField, Select, MenuItem, FormControl, InputLabel,
  Typography, Switch, Box, Divider, List, ListItem, ListItemText,
  ListItemSecondaryAction, Chip, Alert
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import SecurityIcon from '@mui/icons-material/Security';
import BlockIcon from '@mui/icons-material/Block';
import { SuppressionRule } from '../types';

interface SimulatorControlProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onTriggerOutage: () => Promise<void>;
  onTriggerRecovery: () => Promise<void>;
  refreshSignal: number;
  demoStatus: { database_latency_active: boolean; service_failure_active: boolean; offline?: boolean };
  onToggleDemoLatency: (start: boolean) => Promise<void>;
  onToggleDemoFailure: (start: boolean) => Promise<void>;
  onSimulateWebhook: (action: 'incident.acknowledged' | 'incident.resolved') => Promise<void>;
}

export const SimulatorControl: React.FC<SimulatorControlProps> = ({
  currentRole,
  onRoleChange,
  onTriggerOutage,
  onTriggerRecovery,
  refreshSignal,
  demoStatus,
  onToggleDemoLatency,
  onToggleDemoFailure,
  onSimulateWebhook
}) => {
  const [rules, setRules] = useState<SuppressionRule[]>([]);
  const [newRule, setNewRule] = useState({ target_field: 'message', match_pattern: '', reason: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRules();
  }, [refreshSignal]);

  const fetchRules = () => {
    fetch('http://localhost:8000/api/suppression-rules')
      .then(res => res.json())
      .then(data => setRules(data))
      .catch(err => console.error("Failed to fetch rules", err));
  };

  const handleToggleRule = async (ruleId: number) => {
    if (currentRole !== 'Admin') {
      alert("Role violation! Only users with the 'Admin' role can toggle suppression rules.");
      return;
    }
    try {
      await fetch(`http://localhost:8000/api/suppression-rules/${ruleId}/toggle`, { method: 'POST' });
      fetchRules();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (currentRole !== 'Admin') {
      alert("Role violation! Only users with the 'Admin' role can create suppression rules.");
      return;
    }
    if (!newRule.match_pattern || !newRule.reason) return;
    setLoading(true);
    try {
      await fetch('http://localhost:8000/api/suppression-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRule)
      });
      setNewRule({ target_field: 'message', match_pattern: '', reason: '' });
      fetchRules();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel" style={{ height: '675px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <SecurityIcon style={{ color: '#818cf8' }} />
          Control Plane & RBAC Simulator
        </Typography>
      </div>

      <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* SECTION 1: Mock Authentication (RBAC) */}
        <div>
          <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            A. Role-Based Access Control (RBAC)
          </Typography>
          <FormControl fullWidth size="small">
            <InputLabel id="role-select-label">Select Active Session Role</InputLabel>
            <Select
              labelId="role-select-label"
              id="role-select"
              value={currentRole}
              label="Select Active Session Role"
              onChange={(e) => onRoleChange(e.target.value as string)}
            >
              <MenuItem value="Viewer">Viewer (Read-Only SRE)</MenuItem>
              <MenuItem value="Operator">Operator (L1/L2 Incident Responder)</MenuItem>
              <MenuItem value="Admin">Admin (Policy & Ingestion Manager)</MenuItem>
            </Select>
          </FormControl>
          <Alert severity={currentRole === 'Viewer' ? 'info' : (currentRole === 'Admin' ? 'success' : 'warning')} style={{ marginTop: '8px', fontSize: '11px', padding: '0 8px' }}>
            {currentRole === 'Viewer' && 'Permissions: View topology, SLA metrics, incident tables. Restricted from Ack/Resolve/Remediation.'}
            {currentRole === 'Operator' && 'Permissions: Full read/write for Incident acknowledges, manual healing triggers, and resolution.'}
            {currentRole === 'Admin' && 'Permissions: Superuser status. Can toggle correlation filters and edit suppression rules.'}
          </Alert>
        </div>

        <Divider style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* SECTION 2: Outage Simulators */}
        <div>
          <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
            B. Chaos Outage Simulator (Local vs Real)
          </Typography>
          
          {/* Sub-section 1: Local Mock Outage */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="caption" style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              1. Local Pipeline Simulation (Fast Test)
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button
                variant="contained"
                color="error"
                startIcon={<PlayArrowIcon />}
                onClick={onTriggerOutage}
                style={{ fontWeight: 600, height: '36px', fontSize: '12px' }}
              >
                TRIGGER CASCADE
              </Button>
              <Button
                variant="outlined"
                color="success"
                startIcon={<RestartAltIcon />}
                disabled={currentRole === 'Viewer'}
                onClick={onTriggerRecovery}
                style={{ fontWeight: 600, height: '36px', fontSize: '12px' }}
              >
                RUN HEALING
              </Button>
            </div>
          </Box>

          {/* Sub-section 2: Real App Outage */}
          <Box>
            <Typography variant="caption" style={{ color: '#94a3b8', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span>2. Real Monitored Env Simulation (Port 9000)</span>
              {demoStatus.offline ? (
                <Chip label="OFFLINE" size="small" color="error" style={{ height: '16px', fontSize: '8px', fontWeight: 700 }} />
              ) : (
                <Chip label="ONLINE" size="small" color="success" style={{ height: '16px', fontSize: '8px', fontWeight: 700 }} />
              )}
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button
                variant="contained"
                color="warning"
                disabled={currentRole === 'Viewer' || demoStatus.offline}
                onClick={() => onToggleDemoLatency(!demoStatus.database_latency_active)}
                style={{ fontWeight: 600, height: '36px', fontSize: '11px', background: demoStatus.database_latency_active ? '#475569' : '#d97706' }}
              >
                {demoStatus.database_latency_active ? "RESOLVE LATENCY" : "INJECT DB LATENCY"}
              </Button>
              <Button
                variant="contained"
                color="error"
                disabled={currentRole === 'Viewer' || demoStatus.offline}
                onClick={() => onToggleDemoFailure(!demoStatus.service_failure_active)}
                style={{ fontWeight: 600, height: '36px', fontSize: '11px', background: demoStatus.service_failure_active ? '#475569' : '#dc2626' }}
              >
                {demoStatus.service_failure_active ? "RESOLVE DOWNTIME" : "INJECT DOWNTIME"}
              </Button>
            </div>
          </Box>

          {/* Sub-section 3: PagerDuty Webhook Simulation */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="caption" style={{ color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              3. PagerDuty Webhook (Bypass Tunnel / Firewall)
            </Typography>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Button
                variant="contained"
                color="info"
                disabled={currentRole === 'Viewer'}
                onClick={() => onSimulateWebhook('incident.acknowledged')}
                style={{ fontWeight: 600, height: '36px', fontSize: '11px', background: '#0284c7' }}
              >
                SIMULATE PD ACK
              </Button>
              <Button
                variant="contained"
                color="success"
                disabled={currentRole === 'Viewer'}
                onClick={() => onSimulateWebhook('incident.resolved')}
                style={{ fontWeight: 600, height: '36px', fontSize: '11px', background: '#16a34a' }}
              >
                SIMULATE PD RESOLVED
              </Button>
            </div>
          </Box>
        </div>

        <Divider style={{ background: 'rgba(255,255,255,0.08)' }} />

        {/* SECTION 3: Suppression Rules Engine */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <BlockIcon fontSize="small" style={{ color: '#f43f5e' }} />
            C. Alert Suppression Engine (Mute Rules)
          </Typography>

          {/* New Rule form */}
          <form onSubmit={handleAddRule} style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', gap: '6px', margin: '8px 0' }}>
            <Select
              size="small"
              value={newRule.target_field}
              onChange={(e) => setNewRule(prev => ({ ...prev, target_field: e.target.value }))}
            >
              <MenuItem value="message">Message Match</MenuItem>
              <MenuItem value="service_id">Service Name</MenuItem>
              <MenuItem value="severity">Severity level</MenuItem>
            </Select>
            <TextField
              size="small"
              placeholder="Regex pattern (e.g. .*Patching.*)"
              value={newRule.match_pattern}
              onChange={(e) => setNewRule(prev => ({ ...prev, match_pattern: e.target.value }))}
            />
            <Button type="submit" variant="contained" size="small" disabled={loading || currentRole !== 'Admin'} style={{ background: '#818cf8', fontWeight: 600 }}>
              ADD
            </Button>
            <div style={{ gridColumn: 'span 3' }}>
              <TextField
                fullWidth
                size="small"
                placeholder="Reason (e.g. maintenance window)"
                value={newRule.reason}
                onChange={(e) => setNewRule(prev => ({ ...prev, reason: e.target.value }))}
              />
            </div>
          </form>

          {/* Active Rules List */}
          <div style={{ flex: 1, overflowY: 'auto', background: 'rgba(0,0,0,0.1)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
            <List dense>
              {rules.map((rule) => (
                <ListItem key={rule.id} divider>
                  <ListItemText
                    primary={
                      <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        <Chip label={rule.target_field} size="small" style={{ height: '16px', fontSize: '9px', background: '#334155' }} />
                        <span style={{ fontFamily: 'monospace', fontSize: '11px', color: '#e2e8f0' }}>{rule.match_pattern}</span>
                      </div>
                    }
                    secondary={<span style={{ fontSize: '10px', color: '#64748b' }}>{rule.reason}</span>}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      edge="end"
                      checked={rule.enabled}
                      disabled={currentRole !== 'Admin'}
                      onChange={() => handleToggleRule(rule.id)}
                      color="primary"
                      size="small"
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
          </div>
        </div>
      </div>
    </div>
  );
};
