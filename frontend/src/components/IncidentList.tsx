import React, { useState, useEffect } from 'react';
import { 
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Button, Chip, Typography, Box, CircularProgress, Collapse
} from '@mui/material';
import AssignmentIcon from '@mui/icons-material/Assignment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { Incident, AuditLog } from '../types';

interface IncidentListProps {
  incidents: Incident[];
  selectedIncident: Incident | null;
  onSelectIncident: (incident: Incident) => void;
  onAckIncident: (incidentId: number) => Promise<void>;
  onResolveIncident: (incidentId: number) => Promise<void>;
  currentRole: string;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedIncident,
  onSelectIncident,
  onAckIncident,
  onResolveIncident,
  currentRole
}) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingAudit, setLoadingAudit] = useState(false);

  // Fetch audit logs when active incident changes
  useEffect(() => {
    if (!selectedIncident) {
      setAuditLogs([]);
      return;
    }
    setLoadingAudit(true);
    fetch(`http://localhost:8000/api/incidents/${selectedIncident.id}/audit`)
      .then(res => res.json())
      .then(data => {
        setAuditLogs(data);
        setLoadingAudit(false);
      })
      .catch(err => {
        console.error("Failed to fetch audit logs", err);
        setLoadingAudit(false);
      });
  }, [selectedIncident?.id]);

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'TRIGGERED':
        return <Chip label="TRIGGERED" color="error" size="small" style={{ fontWeight: 600 }} />;
      case 'ACKNOWLEDGED':
        return <Chip label="ACKNOWLEDGED" color="warning" size="small" style={{ fontWeight: 600 }} />;
      case 'RESOLVED':
        return <Chip label="RESOLVED" color="success" size="small" style={{ fontWeight: 600 }} />;
      default:
        return <Chip label={status} size="small" />;
    }
  };

  const getPriority = (serviceId: string) => {
    if (serviceId === 'claims-database') return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>P1</span>;
    if (serviceId === 'claims-api') return <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>P2</span>;
    return <span style={{ color: '#60a5fa', fontWeight: 'bold' }}>P3</span>;
  };

  return (
    <div className="glass-panel" style={{ height: '550px', overflowY: 'auto' }}>
      <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <Typography variant="h6" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <NotificationsActiveIcon style={{ color: '#f59e0b' }} />
          Incident Command Center
        </Typography>
      </div>

      <TableContainer>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>ID</TableCell>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>Pri</TableCell>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>Status</TableCell>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>Impact Service</TableCell>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>Root Cause</TableCell>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>PagerDuty ID</TableCell>
              <TableCell style={{ background: '#111827', color: '#9ca3af', fontWeight: 600 }}>ServiceNow ID</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {incidents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" style={{ padding: '30px', color: '#64748b' }}>
                  No active incidents recorded. System is healthy.
                </TableCell>
              </TableRow>
            ) : (
              incidents.map((inc) => {
                const isSelected = selectedIncident?.id === inc.id;
                return (
                  <React.Fragment key={inc.id}>
                    <TableRow 
                      hover 
                      selected={isSelected}
                      onClick={() => onSelectIncident(inc)}
                      style={{ cursor: 'pointer', background: isSelected ? 'rgba(99, 102, 241, 0.1)' : 'transparent' }}
                    >
                      <TableCell style={{ fontWeight: 600 }}>#{inc.id}</TableCell>
                      <TableCell>{getPriority(inc.primary_service_id)}</TableCell>
                      <TableCell>{getStatusChip(inc.status)}</TableCell>
                      <TableCell style={{ fontFamily: 'monospace' }}>{inc.primary_service_id}</TableCell>
                      <TableCell style={{ color: inc.root_cause_service_id ? '#f87171' : '#f8fafc' }}>
                        {inc.root_cause_service_id || 'Self'}
                      </TableCell>
                      <TableCell style={{ fontFamily: 'monospace', fontSize: '12px' }}>{inc.pagerduty_id || 'N/A'}</TableCell>
                      <TableCell style={{ fontFamily: 'monospace', fontSize: '12px' }}>{inc.servicenow_id || 'N/A'}</TableCell>
                    </TableRow>

                    {/* Expandable audit log / action panel */}
                    <TableRow>
                      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={7}>
                        <Collapse in={isSelected} timeout="auto" unmountOnExit>
                          <Box sx={{ margin: 2, padding: 2, borderRadius: '8px', background: 'rgba(0,0,0,0.2)', border: '1px solid rgba(255,255,255,0.05)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                              <div>
                                <Typography variant="subtitle2" style={{ fontWeight: 600 }}>
                                  Incident Summary:
                                </Typography>
                                <Typography variant="body2" color="textSecondary" style={{ marginTop: '4px' }}>
                                  {inc.summary}
                                </Typography>
                              </div>
                              
                              {/* Action Buttons */}
                              {inc.status !== 'RESOLVED' && (
                                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                  {inc.status === 'TRIGGERED' && (
                                    <Button 
                                      variant="outlined" 
                                      color="warning" 
                                      size="small"
                                      disabled={currentRole === 'Viewer'}
                                      onClick={(e) => { e.stopPropagation(); onAckIncident(inc.id); }}
                                    >
                                      ACKNOWLEDGE
                                    </Button>
                                  )}
                                  <Button 
                                    variant="contained" 
                                    color="success" 
                                    size="small"
                                    disabled={currentRole === 'Viewer'}
                                    onClick={(e) => { e.stopPropagation(); onResolveIncident(inc.id); }}
                                  >
                                    RESOLVE INCIDENT
                                  </Button>
                                </Box>
                              )}
                            </div>

                            {/* Audit Trail Timeline */}
                            <Typography variant="subtitle2" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                              <AssignmentIcon fontSize="small" style={{ color: '#818cf8' }} />
                              Audit Trail & Orchestration Timeline
                            </Typography>
                            
                            {loadingAudit ? (
                              <CircularProgress size={20} />
                            ) : (
                              <div style={{ maxHeight: '180px', overflowY: 'auto', borderLeft: '2px solid #334155', paddingLeft: '14px', marginLeft: '6px' }}>
                                {auditLogs.map((log) => (
                                  <div key={log.id} style={{ position: 'relative', marginBottom: '12px' }}>
                                    {/* Timeline bullet */}
                                    <div style={{
                                      position: 'absolute',
                                      left: '-20px',
                                      top: '4px',
                                      width: '10px',
                                      height: '10px',
                                      borderRadius: '50%',
                                      background: log.action.includes('Resolve') ? '#10b981' : (log.action.includes('Trigger') ? '#ef4444' : '#818cf8'),
                                      border: '2px solid #0f172a'
                                    }} />
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                                      <span style={{ fontWeight: 600, color: '#f8fafc' }}>
                                        {log.action} <span style={{ opacity: 0.6, fontWeight: 400 }}>({log.actor})</span>
                                      </span>
                                      <span style={{ opacity: 0.5 }}>
                                        {new Date(log.timestamp).toLocaleTimeString()}
                                      </span>
                                    </div>
                                    <div style={{ fontSize: '11px', color: '#9ca3af', marginTop: '2px' }}>
                                      {log.details}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </Box>
                        </Collapse>
                      </TableCell>
                    </TableRow>
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};
