import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import BuildIcon from '@mui/icons-material/Build';
import TerminalIcon from '@mui/icons-material/Terminal';

interface RecoveryPageProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  onRunHealing: () => void;
}

export const RecoveryPage: React.FC<RecoveryPageProps> = ({
  currentRole,
  onRoleChange,
  onRunHealing,
}) => {
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM] Service Recovery Engine Online',
    '[SYSTEM] Listening for failover and auto-remediation triggers...',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${time}] ${msg}`]);
  };

  const handleAction = (name: string, actionFn: () => void) => {
    addLog(`Initiating manual action: ${name}...`);
    setTimeout(() => {
      actionFn();
      addLog(`[SUCCESS] Action ${name} completed successfully.`);
    }, 1000);
  };

  return (
    <div style={{ padding: '0 8px', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        title="Recovery & Automated Remediation"
        subtitle="MANUAL REMEDIATION COMMAND PANEL & OPERATIONAL LOGS"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1.2fr',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Actions panel */}
        <div style={{
          background: '#fff',
          border: '1px solid #e2e8f0',
          borderRadius: '12px',
          padding: '20px',
        }}>
          <h2 style={{
            margin: '0 0 16px 0', fontSize: '15px', fontWeight: 700, color: '#1e293b',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <BuildIcon style={{ color: '#4f46e5', fontSize: '18px' }} />
            Manual Recovery Actions
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Clear Database Connections Pool
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Resets the database connection limits and drops stagnant pool connections.
              </div>
              <button
                disabled={currentRole === 'VIEWER'}
                onClick={() => handleAction('Clear Connections Pool', onRunHealing)}
                style={{
                  background: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  opacity: currentRole === 'VIEWER' ? 0.6 : 1
                }}
              >
                EXECUTE RESET
              </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Scale Down Batch Processing Job
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Throttles batch workers to reduce active connection load under high latency.
              </div>
              <button
                disabled={currentRole === 'VIEWER'}
                onClick={() => handleAction('Scale Down Batch Job', () => {})}
                style={{
                  background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  opacity: currentRole === 'VIEWER' ? 0.6 : 1
                }}
              >
                SCALE DOWN
              </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '12px' }}>
              <div style={{ fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                Full System Re-balancing
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Restores standard routing and validates gateway response statuses.
              </div>
              <button
                disabled={currentRole === 'VIEWER'}
                onClick={() => handleAction('System Re-balancing', onRunHealing)}
                style={{
                  background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px',
                  padding: '6px 12px', fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                  opacity: currentRole === 'VIEWER' ? 0.6 : 1
                }}
              >
                RE-BALANCE
              </button>
            </div>
          </div>
        </div>

        {/* Console logs */}
        <div style={{
          background: '#0f172a',
          borderRadius: '12px',
          border: '1px solid #1e293b',
          padding: '20px',
          minHeight: '320px',
        }}>
          <h2 style={{
            margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#94a3b8',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <TerminalIcon style={{ fontSize: '18px', color: '#818cf8' }} />
            Automated Remediation Log Output
          </h2>

          <div style={{
            fontFamily: 'monospace', fontSize: '11px', color: '#818cf8',
            maxHeight: '260px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px'
          }}>
            {logs.map((log, idx) => (
              <div key={idx} style={{
                color: log.includes('SUCCESS') ? '#4ade80' : log.includes('Initiating') ? '#f3f4f6' : '#818cf8',
                lineHeight: 1.4
              }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
