import React from 'react';
import { Typography, Chip, Box } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { RawEvent } from '../types';

interface LiveAlertFeedProps {
  alerts: RawEvent[];
}

export const LiveAlertFeed: React.FC<LiveAlertFeedProps> = ({ alerts }) => {
  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'ERROR':
        return { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: '1px solid rgba(249, 115, 22, 0.2)' };
      case 'WARNING':
        return { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)' };
      default:
        return { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.2)' };
    }
  };

  return (
    <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="subtitle2" style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#f8fafc' }}>
          <WarningIcon style={{ color: '#ef4444', fontSize: '18px' }} />
          Dynatrace Live Alert Ingestion Feed
        </Typography>
        <Chip 
          label={`${alerts.length} Ingested`} 
          size="small" 
          style={{ background: 'rgba(255,255,255,0.06)', color: '#94a3b8', fontWeight: 600, fontSize: '10px' }} 
        />
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {alerts.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b', gap: 1 }}>
            <InfoIcon style={{ fontSize: '32px', opacity: 0.5 }} />
            <Typography variant="body2">No raw alerts ingested yet.</Typography>
          </Box>
        ) : (
          alerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            return (
              <Box
                key={alert.id}
                sx={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid rgba(255,255,255,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{
                      fontSize: '9px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      color: style.color,
                      background: style.bg,
                      padding: '2px 6px',
                      borderRadius: '4px',
                      border: style.border
                    }}>
                      {alert.severity}
                    </span>
                    <Typography variant="body2" style={{ fontWeight: 600, color: '#e2e8f0', fontFamily: 'monospace', fontSize: '12px' }}>
                      {alert.service_id}
                    </Typography>
                  </div>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <Typography variant="body2" style={{ color: '#94a3b8', fontSize: '12px', lineHeight: 1.4 }}>
                  {alert.message}
                </Typography>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '6px', marginTop: '2px' }}>
                  <span style={{ fontSize: '10px', color: '#475569' }}>
                    Fingerprint: {alert.event_fingerprint.substring(0, 18)}...
                  </span>
                  {alert.is_suppressed ? (
                    <Chip 
                      label="MUTED / SUPPRESSED" 
                      size="small" 
                      color="default" 
                      style={{ fontSize: '9px', height: '18px', fontWeight: 700, background: 'rgba(71, 85, 105, 0.2)', color: '#94a3b8' }} 
                    />
                  ) : (
                    <Chip 
                      icon={<CheckCircleIcon style={{ color: '#10b981', fontSize: '12px' }} />} 
                      label="CORRELATED & DEDUPED" 
                      size="small" 
                      style={{ fontSize: '9px', height: '18px', fontWeight: 700, background: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }} 
                    />
                  )}
                </div>
              </Box>
            );
          })
        )}
      </div>
    </div>
  );
};
