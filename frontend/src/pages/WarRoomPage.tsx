import React, { useState } from "react";
import { Incident } from "../types";
import { SimulationBar } from "../components/SimulationBar";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import BoltIcon from "@mui/icons-material/Bolt";
import CurrencyExchangeIcon from "@mui/icons-material/CurrencyExchange";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

interface WarRoomPageProps {
  incidents: Incident[];
  currentRole: string;
  onRoleChange: (role: string) => void;
  onTriggerCascade: () => Promise<void>;
  onRunHealing: () => Promise<void>;
  onInjectLatency: () => Promise<void>;
  onInjectDowntime: () => Promise<void>;
  onSimulatePDAck: () => Promise<void>;
  onSimulatePDResolved: () => Promise<void>;
  onAcknowledgeIncident: (id: number) => Promise<void>;
  onResolveIncident: (id: number) => Promise<void>;
  onExecuteRunbook: (runbookId: string, incidentId: number, isDryRun: boolean) => Promise<void>;
  demoStatus?: { database_latency_active: boolean; service_failure_active: boolean; offline?: boolean };
}

export const WarRoomPage: React.FC<WarRoomPageProps> = ({
  incidents,
  currentRole,
  onRoleChange,
  onTriggerCascade,
  onRunHealing,
  onInjectLatency,
  onInjectDowntime,
  onSimulatePDAck,
  onSimulatePDResolved,
  onAcknowledgeIncident,
  onResolveIncident,
  onExecuteRunbook,
  demoStatus
}) => {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [executing, setExecuting] = useState<boolean>(false);

  // Pick the active P1 incident or most recent incident
  const activeIncident = incidents.find(i => i.status !== "RESOLVED" && i.priority === "P1") 
    || incidents.find(i => i.status !== "RESOLVED") 
    || incidents[0];

  const incidentIdStr = activeIncident ? `INC-${10200 + activeIncident.id}` : "INC-10291";
  const title = activeIncident?.summary || "Claims Platform Outage";

  const handleApprove = async () => {
    if (!activeIncident) return;
    setExecuting(true);
    setActionMessage(null);
    try {
      const rbId = activeIncident.runbook_id || "rb-db-pool-recovery";
      await onExecuteRunbook(rbId, activeIncident.id, false);
      setActionMessage("Approved and applied runbook: " + rbId);
    } catch (e: any) {
      setActionMessage("Execution error: " + e.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleAcknowledge = async () => {
    if (!activeIncident) return;
    try {
      await onAcknowledgeIncident(activeIncident.id);
      setActionMessage("Incident ACKNOWLEDGED.");
    } catch (e: any) {
      setActionMessage("Ack error: " + e.message);
    }
  };

  const handleResolve = async () => {
    if (!activeIncident) return;
    try {
      await onResolveIncident(activeIncident.id);
      setActionMessage("Incident marked as RESOLVED.");
    } catch (e: any) {
      setActionMessage("Resolution error: " + e.message);
    }
  };

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif" }}>
      {/* Top Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 4px 8px", borderBottom: "1px solid #e2e8f0", marginBottom: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
            Major Incident War Room
          </h1>
          <span style={{
            background: "#fee2e2", color: "#dc2626", fontSize: "10px", fontWeight: 700,
            padding: "2px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }}></span>
            P1 Active
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{
              background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px",
              padding: "3px 8px", fontSize: "11px", fontWeight: 600, color: "#1e293b", cursor: "pointer"
            }}
          >
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Simulation Bar */}
      <SimulationBar
        currentRole={currentRole}
        onTriggerCascade={onTriggerCascade}
        onRunHealing={onRunHealing}
        onInjectLatency={onInjectLatency}
        onInjectDowntime={onInjectDowntime}
        onSimulatePDAck={onSimulatePDAck}
        onSimulatePDResolved={onSimulatePDResolved}
        demoStatus={demoStatus}
      />

      {/* War Room Main Container (Mockup #4 Dark Theme) */}
      <div style={{
        background: "#080e1a", border: "1px solid #1e293b", borderRadius: "10px",
        display: "flex", flexDirection: "column"
      }}>
        {/* Banner matching Mockup #4 */}
        <div style={{
          padding: "16px 20px 12px", borderBottom: "1px solid #1e293b",
          background: "linear-gradient(90deg, #0f172a 0%, #1e1b4b 100%)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{
                background: "#ef4444", color: "#fff", fontSize: "12px", fontWeight: 900,
                padding: "4px 10px", borderRadius: "6px"
              }}>
                P1
              </span>
              <div>
                <div style={{ fontSize: "18px", fontWeight: 800, color: "#f8fafc" }}>
                  {title}
                </div>
                <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "2px" }}>
                  ID: <strong style={{ color: "#38bdf8" }}>{incidentIdStr}</strong> | Duration: <strong>1h 24m</strong> | Status: <strong style={{ color: "#f59e0b" }}>{activeIncident?.status === "RESOLVED" ? "Resolved" : "Investigating"}</strong>
                </div>
              </div>
            </div>

            {activeIncident?.status !== "RESOLVED" && (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                {activeIncident?.status === "TRIGGERED" && (
                  <button
                    onClick={handleAcknowledge}
                    disabled={currentRole === "VIEWER"}
                    className="btn-tactile btn-tactile-warning"
                    style={{ padding: "6px 14px", fontSize: "11px" }}
                  >
                    Acknowledge
                  </button>
                )}
                <button
                  onClick={handleResolve}
                  disabled={currentRole === "VIEWER"}
                  className="btn-tactile btn-tactile-success"
                  style={{ padding: "6px 14px", fontSize: "11px" }}
                >
                  Resolve Incident
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 3-Column Split Content matching Mockup #4 */}
        <div style={{
          flex: 1, padding: "16px 20px", display: "grid", gridTemplateColumns: "0.8fr 1.2fr 1.1fr",
          gap: "16px", overflowY: "auto"
        }}>
          {/* Column 1: Impact Metrics (Mockup #4) */}
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px",
            padding: "16px", display: "flex", flexDirection: "column", gap: "14px"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9", letterSpacing: "0.05em" }}>
              Impact
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#1e1b4b", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PeopleAltIcon style={{ color: "#a855f7", fontSize: "16px" }} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Users</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>12,500</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#172554", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <BoltIcon style={{ color: "#3b82f6", fontSize: "16px" }} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Transactions/min</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>840</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#451a03", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <CurrencyExchangeIcon style={{ color: "#f59e0b", fontSize: "16px" }} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>Revenue Exposure</div>
                <div style={{ fontSize: "16px", fontWeight: 800, color: "#f8fafc" }}>₹ 2.4L/hr</div>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div style={{ width: "30px", height: "30px", borderRadius: "6px", background: "#450a0a", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <WarningAmberIcon style={{ color: "#ef4444", fontSize: "16px" }} />
              </div>
              <div>
                <div style={{ fontSize: "10px", color: "#64748b" }}>SLA Risk</div>
                <div style={{ fontSize: "13px", fontWeight: 800, color: "#ef4444" }}>At Risk</div>
              </div>
            </div>
          </div>

          {/* Column 2: Live Timeline (Mockup #4 Stepper) */}
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px",
            padding: "16px", display: "flex", flexDirection: "column"
          }}>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#f1f5f9", marginBottom: "14px", letterSpacing: "0.05em" }}>
              Live Timeline
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px", position: "relative", paddingLeft: "16px" }}>
              <div style={{ position: "absolute", left: "6px", top: "6px", bottom: "6px", width: "2px", background: "#334155" }}></div>

              {[
                { time: "10:32", text: "Dynatrace detected anomaly", status: "completed", color: "#ef4444" },
                { time: "10:34", text: "Correlated 17 alerts into single incident", status: "completed", color: "#ef4444" },
                { time: "10:34", text: "PagerDuty incident created (dedup active)", status: "completed", color: "#ef4444" },
                { time: "10:35", text: "AI analysis completed (Confidence: 94%)", status: "completed", color: "#ef4444" },
                { time: "10:36", text: activeIncident?.remediation_status === "COMPLETED" ? "Remediation applied & verified" : "Approval pending for remediation", status: activeIncident?.remediation_status === "COMPLETED" ? "completed" : "pending", color: activeIncident?.remediation_status === "COMPLETED" ? "#10b981" : "#94a3b8" }
              ].map((step, idx) => (
                <div key={idx} style={{ display: "flex", alignItems: "center", gap: "10px", position: "relative" }}>
                  <span style={{
                    position: "absolute", left: "-14px", width: "8px", height: "8px", borderRadius: "50%",
                    background: step.color, border: "2px solid #0f172a"
                  }}></span>
                  <div>
                    <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>{step.time}</span>
                    <div style={{ fontSize: "11px", color: "#e2e8f0", fontWeight: 500 }}>{step.text}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Column 3: AI Recommendation Card (Mockup #4) */}
          <div style={{
            background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px",
            padding: "16px", display: "flex", flexDirection: "column", justifyContent: "space-between"
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "#38bdf8", fontWeight: 700, fontSize: "12px", marginBottom: "8px" }}>
                <AutoAwesomeIcon style={{ fontSize: "14px" }} />
                AI Recommendation
              </div>

              <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", lineHeight: "1.4" }}>
                Increase DB connection pool size (150 → 250)
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                Terminates 14 stagnant queries on claims_records and expands connection limits safely.
              </div>

              {/* Confidence & Risk */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "16px" }}>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Confidence</div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#10b981" }}>94%</div>
                </div>
                <div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>Risk</div>
                  <span style={{
                    background: "#451a03", color: "#f59e0b", fontSize: "10px", fontWeight: 700,
                    padding: "2px 8px", borderRadius: "4px"
                  }}>
                    Medium
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div>
              {actionMessage && (
                <div style={{
                  fontSize: "10px", padding: "6px 8px", borderRadius: "4px", marginBottom: "8px",
                  background: actionMessage.includes("error") ? "#450a0a" : "#064e3b",
                  color: actionMessage.includes("error") ? "#f87171" : "#34d399"
                }}>
                  {actionMessage}
                </div>
              )}

              <div>
                <button
                  onClick={handleApprove}
                  disabled={executing || currentRole === "VIEWER"}
                  className="btn-tactile btn-tactile-primary"
                  style={{
                    padding: "11px 16px",
                    fontSize: "12px",
                    width: "100%"
                  }}
                >
                  {executing ? "Applying Runbook..." : "Approve & Execute Remediation"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
