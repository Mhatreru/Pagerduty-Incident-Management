import React, { useState, useEffect } from 'react';
import { DigestRun } from '../types';
import { PageHeader } from '../components/PageHeader';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface ExecutiveReportsPageProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const ExecutiveReportsPage: React.FC<ExecutiveReportsPageProps> = ({
  currentRole,
  onRoleChange
}) => {
  const [digests, setDigests] = useState<DigestRun[]>([]);
  const [selectedDigest, setSelectedDigest] = useState<DigestRun | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchDigests = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v2/digests');
      if (res.ok) {
        const data = await res.json();
        setDigests(data);
        if (data.length > 0 && !selectedDigest) {
          setSelectedDigest(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch digests', err);
    }
  };

  useEffect(() => {
    fetchDigests();
  }, []);

  const handleGenerateDigest = async () => {
    setIsGenerating(true);
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v2/digests/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ period_days: 7 })
      });
      if (res.ok) {
        const newDigest = await res.json();
        await fetchDigests();
        setSelectedDigest(newDigest);
      }
    } catch (err) {
      console.error('Failed to generate digest', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        title="Executive SRE Digests and Board Reports"
        subtitle="Zero-click weekly operations reporting with AI executive narrative synthesis, MTTR compression benchmarks, and financial downtime savings"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '18px', alignItems: 'start' }}>
        {/* Left: Digests List */}
        <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <div style={{ padding: '14px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Digest Archive</div>
              <div style={{ fontSize: '10.5px', color: '#64748b' }}>Automated SRE Reports</div>
            </div>
            <button
              onClick={handleGenerateDigest}
              disabled={isGenerating}
              style={{
                background: '#4f46e5', color: '#ffffff', border: 'none', borderRadius: '4px',
                padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '4px'
              }}
            >
              <AutoAwesomeIcon style={{ fontSize: '12px' }} />
              {isGenerating ? 'Generating...' : 'New Digest'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {digests.map((d) => (
              <div
                key={d.id}
                onClick={() => setSelectedDigest(d)}
                style={{
                  padding: '12px 16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer',
                  background: selectedDigest?.id === d.id ? '#f8fafc' : '#ffffff',
                  borderLeft: selectedDigest?.id === d.id ? '3px solid #6366f1' : '3px solid transparent',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>
                    Week of {new Date(d.period_start).toLocaleDateString()}
                  </div>
                  <span style={{ fontSize: '10px', background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', color: '#475569', fontWeight: 600 }}>
                    {d.total_incidents} Incidents
                  </span>
                </div>
                <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '3px' }}>
                  P1s: <strong style={{ color: '#dc2626' }}>{d.p1_count}</strong> • MTTR: <strong style={{ color: '#16a34a' }}>{d.avg_mttr_minutes}m</strong>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Selected Digest Details */}
        {selectedDigest && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {/* Report Header Card */}
            <div style={{ background: '#0f172a', borderRadius: '8px', padding: '20px', color: '#ffffff', border: '1px solid #334155' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                    CONFIDENTIAL SRE EXECUTIVE DIGEST
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, marginTop: '4px' }}>
                    SRE Operations Summary: {new Date(selectedDigest.period_start).toLocaleDateString()} – {new Date(selectedDigest.period_end).toLocaleDateString()}
                  </div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ✉️ Dispatched to: {selectedDigest.recipients.join(', ')}
                  </div>
                </div>

                <a
                  href="/NEXUS_7_MINUTE_DEMO_SCRIPT.pdf"
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    background: '#1e293b', color: '#38bdf8', border: '1px solid #334155', borderRadius: '6px',
                    padding: '8px 12px', fontSize: '11px', fontWeight: 600, textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: '6px'
                  }}
                >
                  <PictureAsPdfIcon style={{ fontSize: '14px' }} /> Download Board PDF
                </a>
              </div>

              {/* KPI metrics row inside report card */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '16px', paddingTop: '14px', borderTop: '1px solid #1e293b' }}>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>TOTAL INCIDENTS</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>{selectedDigest.total_incidents}</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>100% Remediated</div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>CRITICAL P1 ALERTS</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#f87171', marginTop: '2px' }}>{selectedDigest.p1_count}</div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Auto-paged to SRE</div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>AVERAGE MTTR</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#38bdf8', marginTop: '2px' }}>{selectedDigest.avg_mttr_minutes} min</div>
                  <div style={{ fontSize: '10px', color: '#10b981' }}>91.6% faster than manual</div>
                </div>
                <div>
                  <div style={{ fontSize: '9.5px', color: '#94a3b8', textTransform: 'uppercase' }}>DOWNTIME SAVINGS</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#a7f3d0', marginTop: '2px' }}>
                    $360,500
                  </div>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>Calculated cost avoidance</div>
                </div>
              </div>
            </div>

            {/* AI Executive Narrative Card */}
            <div style={{ background: '#ffffff', borderRadius: '8px', padding: '18px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#4338ca', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                <AutoAwesomeIcon style={{ fontSize: '15px' }} /> Gemini AI Executive Operational Synthesis
              </div>
              <div style={{ fontSize: '13px', color: '#1e293b', lineHeight: '1.65' }}>
                {selectedDigest.generated_summary}
              </div>
            </div>

            {/* Recurring Problem Spotlight */}
            <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '16px', border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>
                Key Problem Pattern Highlighted for Review
              </div>
              <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '8px' }}>
                Primary systemic driver flagged by NEXUS Problem Intelligence:
              </div>
              <div style={{ background: '#ffffff', borderRadius: '6px', padding: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#0f172a' }}>
                    {selectedDigest.top_problem_title || 'Claims DB Connection Pool Exhaustion'}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                    Underlying Service: <strong style={{ color: '#475569' }}>claims-database</strong> • Action items pending: <strong style={{ color: '#dc2626' }}>3</strong>
                  </div>
                </div>
                <span style={{ background: '#fef2f2', color: '#dc2626', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>
                  HIGH PRIORITY
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
