import React, { useState, useEffect } from 'react';
import { Problem, ProblemDetail } from '../types';
import { PageHeader } from '../components/PageHeader';
import HubIcon from '@mui/icons-material/Hub';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface ProblemManagementPageProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const ProblemManagementPage: React.FC<ProblemManagementPageProps> = ({
  currentRole,
  onRoleChange
}) => {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [selectedProblemId, setSelectedProblemId] = useState<string | null>(null);
  const [problemDetail, setProblemDetail] = useState<ProblemDetail | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'incidents' | 'fix'>('overview');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const fetchProblems = async () => {
    try {
      const res = await fetch('http://127.0.0.1:8000/api/v2/problems');
      if (res.ok) {
        const data = await res.json();
        setProblems(data);
      }
    } catch (err) {
      console.error('Failed to fetch problems', err);
    }
  };

  const fetchProblemDetail = async (id: string) => {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v2/problems/${id}`);
      if (res.ok) {
        const data = await res.json();
        setProblemDetail(data);
      }
    } catch (err) {
      console.error('Failed to fetch problem detail', err);
    }
  };

  useEffect(() => {
    fetchProblems();
    const interval = setInterval(fetchProblems, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedProblemId) {
      fetchProblemDetail(selectedProblemId);
    } else {
      setProblemDetail(null);
    }
  }, [selectedProblemId]);

  const handleUpdateStatus = async (status: string) => {
    if (!selectedProblemId) return;
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v2/problems/${selectedProblemId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchProblems();
        fetchProblemDetail(selectedProblemId);
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  const handleEvaluateFix = async () => {
    if (!selectedProblemId) return;
    setIsEvaluating(true);
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/v2/problems/${selectedProblemId}/evaluate-fix`, {
        method: 'POST'
      });
      if (res.ok) {
        const data = await res.json();
        if (problemDetail) {
          setProblemDetail({
            ...problemDetail,
            recommended_permanent_fix: data.recommended_permanent_fix
          });
        }
        fetchProblems();
      }
    } catch (err) {
      console.error('Failed to evaluate fix', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>ACTIVE</span>;
      case 'MITIGATED':
        return <span style={{ background: '#fefce8', color: '#ca8a04', border: '1px solid #fef08a', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>MITIGATED</span>;
      case 'PERMANENTLY_FIXED':
        return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700 }}>PERMANENTLY FIXED</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div style={{ padding: '20px 24px', maxWidth: '1440px', margin: '0 auto', fontFamily: 'Inter, sans-serif' }}>
      <PageHeader
        title="Problem Management and Root Cause Clusters"
        subtitle="Groups recurring microservice incidents into systemic architectural flaws to track permanent fixes and cost exposure"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      {/* Top Banner KPI row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '18px' }}>
        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Identified Problems</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>{problems.length}</div>
          <div style={{ fontSize: '11px', color: '#10b981', marginTop: '2px', fontWeight: 500 }}>Fuzzy root-cause clustered</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Top Recurrence Count</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginTop: '4px' }}>
            {problems.length > 0 ? `${problems[0].occurrence_count}x` : '0x'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
            {problems.length > 0 ? problems[0].title.slice(0, 24) + '...' : 'None'}
          </div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Total 30-Day Cost Exposure</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color: '#0f172a', marginTop: '4px' }}>
            {problems.length > 0 ? `₹${((problems[0].occurrence_count * problems[0].estimated_cost_per_occurrence) / 100000).toFixed(1)}L` : '₹0'}
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Est. revenue loss avoided</div>
        </div>

        <div style={{ background: '#ffffff', borderRadius: '8px', padding: '14px 16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
          <div style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Fix Evaluation Mode</div>
          <div style={{ fontSize: '15px', fontWeight: 700, color: '#6366f1', marginTop: '7px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <AutoAwesomeIcon style={{ fontSize: '16px' }} /> Gemini Copilot
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Architectural RAG active</div>
        </div>
      </div>

      {/* Main Problems Table */}
      <div style={{ background: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>Active Problem Registry</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Incidents sharing identical root-cause fingerprints are grouped into single problem records</div>
          </div>
          <div style={{ fontSize: '11px', color: '#64748b' }}>
            Showing <strong>{problems.length}</strong> problem cluster(s)
          </div>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '12px' }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              <th style={{ padding: '10px 16px' }}>Problem Description</th>
              <th style={{ padding: '10px 16px' }}>Occurrences</th>
              <th style={{ padding: '10px 16px' }}>Primary Service</th>
              <th style={{ padding: '10px 16px' }}>Est. Cost Exposure</th>
              <th style={{ padding: '10px 16px' }}>Status</th>
              <th style={{ padding: '10px 16px' }}>Last Seen</th>
              <th style={{ padding: '10px 16px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {problems.map((prob) => (
              <tr key={prob.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}>
                <td style={{ padding: '12px 16px' }}>
                  <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <HubIcon style={{ fontSize: '16px', color: '#6366f1' }} />
                    {prob.title}
                  </div>
                  <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px', fontFamily: 'monospace' }}>
                    Fingerprint: {prob.root_cause_fingerprint.slice(0, 16)}...
                  </div>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{
                    background: prob.occurrence_count >= 5 ? '#fef2f2' : '#f8fafc',
                    color: prob.occurrence_count >= 5 ? '#dc2626' : '#0f172a',
                    padding: '3px 8px', borderRadius: '12px', fontWeight: 800, fontSize: '12px',
                    border: prob.occurrence_count >= 5 ? '1px solid #fecaca' : '1px solid #e2e8f0'
                  }}>
                    {prob.occurrence_count}x
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ background: '#f1f5f9', color: '#334155', padding: '2px 8px', borderRadius: '4px', fontWeight: 600, fontSize: '11px', fontFamily: 'monospace' }}>
                    {prob.primary_service}
                  </span>
                </td>
                <td style={{ padding: '12px 16px', fontWeight: 700, color: '#0f172a' }}>
                  ₹{((prob.occurrence_count * prob.estimated_cost_per_occurrence) / 100000).toFixed(1)}L
                  <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 400, marginLeft: '4px' }}>
                    (~)
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  {getStatusBadge(prob.status)}
                </td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: '11.5px' }}>
                  {new Date(prob.last_seen_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(prob.last_seen_at).toLocaleDateString()}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                  <button
                    onClick={() => setSelectedProblemId(prob.id)}
                    style={{
                      background: '#0f172a', color: '#ffffff', border: 'none', borderRadius: '4px',
                      padding: '5px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                      display: 'inline-flex', alignItems: 'center', gap: '4px'
                    }}
                  >
                    Analyze Problem <ArrowForwardIcon style={{ fontSize: '12px' }} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Problem Detail Modal */}
      {selectedProblemId && problemDetail && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(15, 23, 42, 0.75)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
        }}>
          <div style={{
            background: '#ffffff', borderRadius: '10px', width: '920px', maxHeight: '90vh',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            {/* Modal Header */}
            <div style={{ background: '#0f172a', padding: '16px 20px', color: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '10px', color: '#818cf8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  SYSTEMIC PROBLEM CLUSTER ANALYSIS
                </div>
                <div style={{ fontSize: '16px', fontWeight: 800, color: '#ffffff', marginTop: '2px' }}>
                  {problemDetail.title}
                </div>
              </div>
              <button
                onClick={() => setSelectedProblemId(null)}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
              >
                <CloseIcon />
              </button>
            </div>

            {/* Modal Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', padding: '0 20px' }}>
              <button
                onClick={() => setActiveTab('overview')}
                style={{
                  padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, color: activeTab === 'overview' ? '#6366f1' : '#64748b',
                  borderBottom: activeTab === 'overview' ? '2px solid #6366f1' : '2px solid transparent'
                }}
              >
                Cluster Overview & Trends
              </button>
              <button
                onClick={() => setActiveTab('incidents')}
                style={{
                  padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, color: activeTab === 'incidents' ? '#6366f1' : '#64748b',
                  borderBottom: activeTab === 'incidents' ? '2px solid #6366f1' : '2px solid transparent'
                }}
              >
                Linked Incidents ({problemDetail.linked_incidents.length})
              </button>
              <button
                onClick={() => setActiveTab('fix')}
                style={{
                  padding: '12px 16px', border: 'none', background: 'transparent', cursor: 'pointer',
                  fontSize: '12px', fontWeight: 700, color: activeTab === 'fix' ? '#6366f1' : '#64748b',
                  borderBottom: activeTab === 'fix' ? '2px solid #6366f1' : '2px solid transparent'
                }}
              >
                Recommended Permanent Fix
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px', flex: 1, overflowY: 'auto' }}>
              {activeTab === 'overview' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>RECURRENCE FREQUENCY</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#dc2626', marginTop: '2px' }}>{problemDetail.occurrence_count} occurrences</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>First seen: {new Date(problemDetail.first_seen_at).toLocaleDateString()}</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>CUMULATIVE EXPOSURE</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                        ₹{((problemDetail.occurrence_count * problemDetail.estimated_cost_per_occurrence) / 100000).toFixed(1)}L
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>₹{problemDetail.estimated_cost_per_occurrence.toLocaleString()} / outage</div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>ACTION ITEMS PROGRESS</div>
                      <div style={{ fontSize: '20px', fontWeight: 800, color: '#16a34a', marginTop: '2px' }}>
                        {problemDetail.action_items_completion_pct}%
                      </div>
                      <div style={{ fontSize: '10.5px', color: '#64748b', marginTop: '2px' }}>
                        {problemDetail.action_items_done} of {problemDetail.action_items_total} action items closed
                      </div>
                    </div>
                  </div>

                  {/* Sparkline visualization */}
                  <div style={{ background: '#f8fafc', padding: '14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155', marginBottom: '8px' }}>
                      Occurrence Pattern (Last 30 Days)
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px', padding: '0 4px' }}>
                      {[1, 0, 0, 2, 0, 1, 0, 0, 1, 2, 0, 1].map((val, idx) => (
                        <div key={idx} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                          <div style={{
                            width: '100%', height: `${Math.max(val * 24, 4)}px`,
                            background: val > 0 ? '#6366f1' : '#e2e8f0', borderRadius: '2px'
                          }} />
                          <span style={{ fontSize: '8.5px', color: '#94a3b8' }}>W{Math.floor(idx / 3) + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Lifecycle Status controls */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid #e2e8f0' }}>
                    <div>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#334155' }}>Problem Lifecycle Status</div>
                      <div style={{ fontSize: '10.5px', color: '#64748b' }}>Current: {getStatusBadge(problemDetail.status)}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => handleUpdateStatus('ACTIVE')}
                        style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}
                      >
                        Mark Active
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('MITIGATED')}
                        style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #fef08a', background: '#fefce8', color: '#ca8a04', cursor: 'pointer' }}
                      >
                        Mark Mitigated
                      </button>
                      <button
                        onClick={() => handleUpdateStatus('PERMANENTLY_FIXED')}
                        style={{ padding: '6px 12px', fontSize: '11px', fontWeight: 600, borderRadius: '4px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#16a34a', cursor: 'pointer' }}
                      >
                        Mark Permanently Fixed
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'incidents' && (
                <div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '10px' }}>
                    All incidents that were automatically rolled into this problem cluster via root-cause fingerprinting:
                  </div>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                      <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', color: '#475569', textTransform: 'uppercase' }}>
                        <th style={{ padding: '8px' }}>Incident ID</th>
                        <th style={{ padding: '8px' }}>Summary</th>
                        <th style={{ padding: '8px' }}>Priority</th>
                        <th style={{ padding: '8px' }}>Status</th>
                        <th style={{ padding: '8px' }}>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {problemDetail.linked_incidents.map((inc) => (
                        <tr key={inc.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '8px', fontWeight: 700, color: '#6366f1' }}>#{inc.id}</td>
                          <td style={{ padding: '8px', color: '#0f172a' }}>{inc.summary}</td>
                          <td style={{ padding: '8px' }}><span style={{ background: '#fee2e2', color: '#991b1b', padding: '1px 6px', borderRadius: '4px', fontWeight: 700 }}>{inc.priority}</span></td>
                          <td style={{ padding: '8px' }}><span style={{ background: '#f1f5f9', color: '#334155', padding: '1px 6px', borderRadius: '4px' }}>{inc.status}</span></td>
                          <td style={{ padding: '8px', color: '#64748b' }}>{new Date(inc.created_at).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === 'fix' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#166534', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <CheckCircleIcon style={{ fontSize: '16px' }} /> Gemini AI Architectural Recommendation
                      </div>
                      <button
                        onClick={handleEvaluateFix}
                        disabled={isEvaluating}
                        style={{
                          background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: '4px',
                          padding: '4px 10px', fontSize: '11px', fontWeight: 600, cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: '4px'
                        }}
                      >
                        <AutoAwesomeIcon style={{ fontSize: '12px' }} />
                        {isEvaluating ? 'Evaluating...' : 'Re-Evaluate with Gemini'}
                      </button>
                    </div>
                    <div style={{ fontSize: '12px', color: '#14532d', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
                      {problemDetail.recommended_permanent_fix || 'No permanent fix generated yet.'}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
