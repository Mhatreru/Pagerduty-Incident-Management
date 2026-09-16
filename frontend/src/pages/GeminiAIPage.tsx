import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import PsychologyIcon from '@mui/icons-material/Psychology';
import ConstructionIcon from '@mui/icons-material/Construction';

interface GeminiAIPageProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  activeIncidentSummary?: string;
  activeIncidentRCA?: string;
}

export const GeminiAIPage: React.FC<GeminiAIPageProps> = ({
  currentRole,
  onRoleChange,
  activeIncidentSummary,
  activeIncidentRCA,
}) => {
  const [checklist, setChecklist] = useState({
    killConnections: false,
    increasePool: false,
    scaleDown: false,
  });

  const defaultSummary = "Claims Processing Database is experiencing high connection latency (exceeding 4,000ms), causing cascading timeouts in downstream applications, specifically the `claims-api` and `claims-portal` front-ends.";
  const defaultRCA = "* Database connection pool exhaustion detected.\n* Active connections spiked from a baseline of 45 to the maximum limit of 150.\n* Davis AI topological analysis correlates this with an unindexed query execution on the `claims_records` table by the billing service batch job.";

  return (
    <div style={{ padding: '0 8px', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        title="Quoting Hub — Gemini AI View"
        subtitle="AI-ASSISTED INCIDENT CORRELATION AND ROOT CAUSE ANALYTICS"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{
        background: '#fff',
        border: '1px solid #e2e8f0',
        borderRadius: '12px',
        overflow: 'hidden',
      }}>
        {/* Panel Header */}
        <div style={{
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          padding: '14px 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{
            margin: 0, fontSize: '14px', fontWeight: 700, color: '#0f172a',
            display: 'flex', alignItems: 'center', gap: '8px'
          }}>
            <PsychologyIcon style={{ color: '#6366f1', fontSize: '18px' }} />
            Generative AI Analysis (Gemini 1.5 Flash)
          </h2>
          <span style={{
            background: '#f0fdf4', color: '#16a34a', fontSize: '10px', fontWeight: 700,
            padding: '2px 8px', borderRadius: '4px', textTransform: 'uppercase'
          }}>
            ACTIVE
          </span>
        </div>

        {/* Panel Content */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          gap: '2px',
          background: '#e2e8f0',
        }}>
          {/* Left panel: Intelligence */}
          <div style={{ background: '#fff', padding: '24px' }}>
            <h3 style={{
              margin: '0 0 20px', fontSize: '16px', fontWeight: 700, color: '#6366f1',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <PsychologyIcon style={{ fontSize: '20px' }} />
              Gemini Incident Intelligence
            </h3>

            <div style={{ marginBottom: '24px' }}>
              <h4 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                INCIDENT SUMMARY
              </h4>
              <p style={{ margin: 0, fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                {activeIncidentSummary || defaultSummary}
              </p>
            </div>

            <div>
              <h4 style={{ margin: '0 0 8px', fontSize: '11px', fontWeight: 700, color: '#475569', letterSpacing: '0.05em' }}>
                ROOT CAUSE ANALYSIS
              </h4>
              <div style={{ fontSize: '13px', color: '#334155', lineHeight: '1.6' }}>
                {(activeIncidentRCA || defaultRCA).split('\n').map((line, idx) => (
                  <div key={idx} style={{ marginBottom: '6px', display: 'flex', alignItems: 'flex-start', gap: '6px' }}>
                    <span>•</span>
                    <span>{line.replace(/^\*\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right panel: Remediation runbook */}
          <div style={{ background: '#fff', padding: '24px' }}>
            <h3 style={{
              margin: '0 0 20px', fontSize: '14px', fontWeight: 700, color: '#4f46e5',
              display: 'flex', alignItems: 'center', gap: '8px'
            }}>
              <ConstructionIcon style={{ fontSize: '18px' }} />
              Remediation Runbook Checklist
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Step 1 */}
              <label style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px',
                cursor: 'pointer', background: checklist.killConnections ? '#f8fafc' : '#fff'
              }}>
                <input
                  type="checkbox"
                  checked={checklist.killConnections}
                  onChange={e => setChecklist({ ...checklist, killConnections: e.target.checked })}
                  style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  <strong>*Kill Blocked Connections**:</strong> Run diagnostic query in pg_stat_activity and terminate long-running billing queries.
                </span>
              </label>

              {/* Step 2 */}
              <label style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px',
                cursor: 'pointer', background: checklist.increasePool ? '#f8fafc' : '#fff'
              }}>
                <input
                  type="checkbox"
                  checked={checklist.increasePool}
                  onChange={e => setChecklist({ ...checklist, increasePool: e.target.checked })}
                  style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  <strong>*Increase Pool Size (Short-Term)**:</strong> Run execution command:<br />
                  <code style={{ background: '#f1f5f9', padding: '2px 4px', borderRadius: '4px', fontFamily: 'monospace', display: 'inline-block', marginTop: '4px' }}>
                    ALTER SYSTEM SET max_connections = 250; SELECT pg_reload_conf();
                  </code>
                </span>
              </label>

              {/* Step 3 */}
              <label style={{
                display: 'flex', gap: '12px', alignItems: 'flex-start',
                border: '1px solid #e2e8f0', borderRadius: '8px', padding: '14px',
                cursor: 'pointer', background: checklist.scaleDown ? '#f8fafc' : '#fff'
              }}>
                <input
                  type="checkbox"
                  checked={checklist.scaleDown}
                  onChange={e => setChecklist({ ...checklist, scaleDown: e.target.checked })}
                  style={{ marginTop: '3px', width: '16px', height: '16px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#334155', lineHeight: '1.4' }}>
                  <strong>*Scale Down Batch Job**:</strong> Pause billing batch workers until database latency returns to healthy levels (&lt;200ms).
                </span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
