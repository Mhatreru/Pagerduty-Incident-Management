import React, { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { Runbook, RemediationApproval } from "../types";
import BuildIcon from "@mui/icons-material/Build";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";

interface RunbooksPageProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const RunbooksPage: React.FC<RunbooksPageProps> = ({ currentRole, onRoleChange }) => {
  const [runbooks, setRunbooks] = useState<Runbook[]>([]);
  const [approvals, setApprovals] = useState<RemediationApproval[]>([]);
  const [execLog, setExecLog] = useState<string>("");
  const [executingId, setExecutingId] = useState<string | null>(null);

  const fetchRunbooksAndApprovals = async () => {
    try {
      const [rbRes, appRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/runbooks"),
        fetch("http://localhost:8000/api/v1/approvals")
      ]);
      const rbData = await rbRes.json();
      const appData = await appRes.json();
      setRunbooks(rbData);
      setApprovals(appData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRunbooksAndApprovals();
  }, []);

  const handleExecute = async (rbId: string, isDryRun: boolean) => {
    setExecutingId(rbId);
    setExecLog("");
    try {
      const res = await fetch("http://localhost:8000/api/v1/runbooks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runbook_id: rbId,
          is_dry_run: isDryRun,
          role: currentRole
        })
      });
      const data = await res.json();
      setExecLog(data.message + (data.log ? "\n\n" + data.log : ""));
      fetchRunbooksAndApprovals();
    } catch (e: any) {
      setExecLog("Execution Error: " + e.message);
    } finally {
      setExecutingId(null);
    }
  };

  const handleApprovalDecision = async (approvalId: number, decision: "APPROVED" | "REJECTED") => {
    try {
      await fetch("http://localhost:8000/api/v1/approvals/decision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approval_id: approvalId,
          decision: decision,
          role: currentRole
        })
      });
      fetchRunbooksAndApprovals();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif" }}>
      <PageHeader
        title="Runbook Automation & Controlled Remediation"
        subtitle="SRE RUNBOOK REPOSITORY • POLICY-BASED HUMAN APPROVAL ENGINE • DRY-RUN VALIDATION"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{
        display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "14px",
        height: "calc(100vh - 140px)", overflow: "hidden"
      }}>
        {/* Left: Runbook Catalog */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
          padding: "16px", display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
              <BuildIcon style={{ color: "#4f46e5", fontSize: "18px" }} />
              Active Runbook Library ({runbooks.length})
            </h2>
            <span style={{ fontSize: "11px", color: "#64748b" }}>Self-Healing Policies</span>
          </div>

          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px", paddingRight: "4px" }}>
            {runbooks.map((rb) => (
              <div key={rb.id} style={{
                border: "1px solid #e2e8f0", borderRadius: "8px", padding: "12px", background: "#f8fafc"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{rb.name}</span>
                    <span style={{ fontSize: "10px", color: "#64748b", marginLeft: "6px" }}>({rb.id})</span>
                  </div>
                  <span style={{
                    background: rb.risk_level === "HIGH" ? "#fee2e2" : rb.risk_level === "MEDIUM" ? "#fef3c7" : "#ecfdf5",
                    color: rb.risk_level === "HIGH" ? "#dc2626" : rb.risk_level === "MEDIUM" ? "#d97706" : "#059669",
                    fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px"
                  }}>
                    RISK: {rb.risk_level}
                  </span>
                </div>

                <div style={{ fontSize: "11px", color: "#475569", marginBottom: "8px" }}>
                  {rb.description}
                </div>

                <div style={{
                  background: "#0f172a", color: "#818cf8", fontFamily: "monospace", fontSize: "10px",
                  padding: "6px 8px", borderRadius: "4px", marginBottom: "8px", overflowX: "auto"
                }}>
                  {rb.command_template}
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "10px", color: "#64748b" }}>
                    Target: <strong>{rb.target_service_id}</strong> | Min Role: <strong>{rb.required_role}</strong>
                  </span>

                  <div style={{ display: "flex", gap: "6px" }}>
                    <button
                      disabled={executingId === rb.id || currentRole === "VIEWER"}
                      onClick={() => handleExecute(rb.id, true)}
                      style={{
                        background: "#fff", border: "1px solid #cbd5e1", color: "#475569",
                        borderRadius: "4px", padding: "3px 8px", fontSize: "10px", fontWeight: 600, cursor: "pointer"
                      }}
                    >
                      Dry Run
                    </button>
                    <button
                      disabled={executingId === rb.id || currentRole === "VIEWER"}
                      onClick={() => handleExecute(rb.id, false)}
                      style={{
                        background: "#4f46e5", border: "none", color: "#fff",
                        borderRadius: "4px", padding: "3px 10px", fontSize: "10px", fontWeight: 700, cursor: "pointer",
                        display: "flex", alignItems: "center", gap: "3px"
                      }}
                    >
                      <PlayArrowIcon style={{ fontSize: "12px" }} />
                      Execute
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Approvals Queue & Real-time Console */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>
          {/* Pending Approvals */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
            padding: "16px", flex: 1, display: "flex", flexDirection: "column", overflow: "hidden"
          }}>
            <h3 style={{
              margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "#1e293b",
              display: "flex", alignItems: "center", gap: "6px"
            }}>
              <HourglassEmptyIcon style={{ color: "#f59e0b", fontSize: "16px" }} />
              Human-in-the-Loop Approvals ({approvals.filter(a => a.status === "PENDING").length} Pending)
            </h3>

            <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
              {approvals.length === 0 ? (
                <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>
                  No pending remediation approvals required.
                </div>
              ) : (
                approvals.map((app) => (
                  <div key={app.id} style={{
                    border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 10px", background: "#f8fafc",
                    display: "flex", justifyContent: "space-between", alignItems: "center"
                  }}>
                    <div>
                      <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                        Runbook: {app.runbook_id} (Inc #{app.incident_id})
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b" }}>
                        Risk: <strong style={{ color: app.risk_level === "CRITICAL" ? "#ef4444" : "#d97706" }}>{app.risk_level}</strong> | Status: <strong>{app.status}</strong>
                      </div>
                    </div>

                    {app.status === "PENDING" ? (
                      <div style={{ display: "flex", gap: "4px" }}>
                        <button
                          disabled={currentRole === "VIEWER"}
                          onClick={() => handleApprovalDecision(app.id, "APPROVED")}
                          style={{
                            background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px",
                            padding: "3px 8px", fontSize: "10px", fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          Approve
                        </button>
                        <button
                          disabled={currentRole === "VIEWER"}
                          onClick={() => handleApprovalDecision(app.id, "REJECTED")}
                          style={{
                            background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px",
                            padding: "3px 8px", fontSize: "10px", fontWeight: 700, cursor: "pointer"
                          }}
                        >
                          Reject
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: "10px", color: app.status === "APPROVED" ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                        {app.status}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Execution Output Console */}
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: "10px",
            padding: "14px", height: "180px", display: "flex", flexDirection: "column"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#94a3b8", marginBottom: "6px" }}>
              RUNBOOK EXECUTION LOGS
            </div>
            <pre style={{
              flex: 1, margin: 0, overflowY: "auto", fontFamily: "monospace", fontSize: "10px",
              color: "#818cf8", whiteSpace: "pre-wrap", lineHeight: "1.4"
            }}>
              {execLog || "Ready. Select a runbook and click Dry Run or Execute to view output telemetry..."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
