import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import CableIcon from '@mui/icons-material/Cable';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AssessmentIcon from '@mui/icons-material/Assessment';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';

interface PathwayStepperProps {
  activeIncidentCount?: number;
}

export const PathwayStepper: React.FC<PathwayStepperProps> = ({ activeIncidentCount = 0 }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const steps = [
    {
      step: 1,
      id: 'detection',
      path: '/monitoring',
      label: 'Detection & APM',
      system: 'Dynatrace',
      desc: 'Metrics & Anomalies',
      icon: SearchIcon,
    },
    {
      step: 2,
      id: 'response',
      path: '/incident-response',
      label: 'On-Call & Triage',
      system: 'PagerDuty',
      desc: 'Escalation & Responders',
      icon: CableIcon,
    },
    {
      step: 3,
      id: 'remediation',
      path: '/incidents',
      label: 'Remediation War Room',
      system: 'AIOps + Gemini',
      desc: 'Runbooks & Diagnostics',
      icon: NotificationsActiveIcon,
      badge: activeIncidentCount > 0 ? `${activeIncidentCount} Active` : undefined,
    },
    {
      step: 4,
      id: 'governance',
      path: '/reports',
      label: 'Postmortem & ROI',
      system: 'Executive Insights',
      desc: 'RCA & Cost Saved',
      icon: AssessmentIcon,
    },
  ];

  const currentStepIndex = steps.findIndex(s => s.path === location.pathname);

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid #e2e8f0',
      borderRadius: '10px',
      padding: '10px 16px',
      marginBottom: '18px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.03)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      overflowX: 'auto',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: '130px' }}>
        <div style={{
          fontSize: '10px',
          fontWeight: 800,
          color: '#475569',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
        }}>
          Incident Pathway:
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
        {steps.map((s, idx) => {
          const isActive = location.pathname === s.path;
          const isPast = currentStepIndex > -1 && idx < currentStepIndex;

          return (
            <React.Fragment key={s.id}>
              <div
                onClick={() => navigate(s.path)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '7px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  background: isActive ? '#f0fdf4' : isPast ? '#f8fafc' : '#ffffff',
                  border: isActive ? '1.5px solid #16a34a' : isPast ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  transition: 'all 0.15s ease',
                  flex: 1,
                  maxWidth: '240px',
                }}
              >
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: '11px',
                  background: isActive ? '#16a34a' : isPast ? '#64748b' : '#e2e8f0',
                  color: isActive || isPast ? '#ffffff' : '#64748b',
                }}>
                  {s.step}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: isActive ? 700 : 600,
                      color: isActive ? '#15803d' : '#1e293b',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {s.label}
                    </span>
                    {s.badge && (
                      <span style={{
                        background: '#ef4444',
                        color: '#fff',
                        fontSize: '9px',
                        fontWeight: 700,
                        padding: '1px 5px',
                        borderRadius: '6px'
                      }}>
                        {s.badge}
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: '10px', color: '#64748b' }}>
                    {s.system}
                  </div>
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div style={{ padding: '0 4px', color: '#cbd5e1', display: 'flex', alignItems: 'center' }}>
                  <ArrowForwardIosIcon style={{ fontSize: '11px' }} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
