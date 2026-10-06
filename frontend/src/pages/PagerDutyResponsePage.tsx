import React from "react";
import { useNavigate } from "react-router-dom";
import { Incident } from "../types";
import { PageHeader } from "../components/PageHeader";
import { PathwayStepper } from "../components/PathwayStepper";
import PersonIcon from "@mui/icons-material/Person";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ScheduleIcon from "@mui/icons-material/Schedule";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

interface PagerDutyResponsePageProps {
  incidents: Incident[];
  currentRole: string;
  onRoleChange: (role: string) => void;
  onAcknowledgeIncident: (id: number) => Promise<void>;
  onResolveIncident: (id: number) => Promise<void>;
}

export const PagerDutyResponsePage: React.FC<PagerDutyResponsePageProps> = ({
  incidents,
  currentRole,
  onRoleChange,
  onAcknowledgeIncident,
  onResolveIncident
}) => {
  const navigate = useNavigate();
  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED");
  const isViewer = currentRole === "VIEWER";
  const sortedIncidents = [...incidents].sort((a, b) => (a.status === "RESOLVED" ? 1 : 0) - (b.status === "RESOLVED" ? 1 : 0));

  return (
    <div style={{
      padding: "20px 24px",
      maxWidth: "1500px",
      margin: "0 auto",
      fontFamily: "Inter, sans-serif",
      color: "#0f172a",
      boxSizing: "border-box"
    }}>
      <PageHeader
        title="Step 2: On-Call Triage & Dispatch"
        subtitle="PagerDuty automated escalation policies, active on-call responders, and primary incident dispatch."
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        badge="PAGERDUTY LIVE"
      />

      {/* Guided Pathway Stepper */}
      <PathwayStepper activeIncidentCount={activeIncidents.length} />

      {/* Guided Navigation Bar */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "12px 18px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px"
      }}>
        <button
          onClick={() => navigate("/monitoring")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f1f5f9",
            color: "#334155",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            padding: "8px 14px",
            fontSize: "12.5px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <ArrowBackIcon style={{ fontSize: "16px" }} />
          <span>Back: Step 1 Detection</span>
        </button>

        <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center" }}>
          {activeIncidents.length > 0 ? (
            <span style={{ color: "#b91c1c", fontWeight: 700 }}>
              ⚠ {activeIncidents.length} Incident(s) paged out. Proceed to War Room for AI Root Cause & Automated Runbooks.
            </span>
          ) : (
            <span>All on-call schedules ready. Review escalation tiers or proceed to remediation tools.</span>
          )}
        </div>

        <button
          onClick={() => navigate("/incidents")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#0f172a",
            color: "#ffffff",
            border: "none",
            borderRadius: "6px",
            padding: "8px 16px",
            fontSize: "12.5px",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <span>Next: Step 3 War Room</span>
          <ArrowForwardIcon style={{ fontSize: "16px" }} />
        </button>
      </div>

      {/* 3 Top Response Readiness Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* On-Call Lead */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              PRIMARY ON-CALL RESPONDER
            </span>
            <PersonIcon style={{ fontSize: "18px", color: "#10b981" }} />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", lineHeight: "1.2" }}>
            Rugved Mhatre
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            Core SRE Lead • Shift ends in 4h 12m
          </div>
        </div>

        {/* Escalation Policy */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ESCALATION SLA TARGETS
            </span>
            <ScheduleIcon style={{ fontSize: "18px", color: "#6366f1" }} />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0f172a", lineHeight: "1.2" }}>
            MTTA &lt; 5m • MTTR &lt; 30m
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            3-Tier Escalation ladder: 0m ➔ 15m ➔ 30m
          </div>
        </div>

        {/* ServiceNow Sync */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ITSM & WEBHOOK INTEGRATION
            </span>
            <SyncAltIcon style={{ fontSize: "18px", color: "#0284c7" }} />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#0284c7", lineHeight: "1.2" }}>
            2-Way Active
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            ServiceNow CMDB + PagerDuty v2 REST Synced
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1.4fr", gap: "20px", alignItems: "start" }}>
        {/* Left Column: On-Call Schedule + ServiceNow Mapping */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* On-Call Details Card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>On-Call Schedule & Escalation</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Live on-call rotation verified by PagerDuty API</div>
              </div>
              <span style={{ fontSize: "10px", background: "#f0fdf4", color: "#16a34a", padding: "3px 8px", borderRadius: "12px", fontWeight: 700, border: "1px solid #bbf7d0" }}>
                ROTATION ACTIVE
              </span>
            </div>

            {/* Dark Responder Box */}
            <div style={{
              background: "#0f172a",
              borderRadius: "8px",
              padding: "16px",
              color: "#f8fafc",
              border: "1px solid #334155",
              marginBottom: "16px"
            }}>
              <div style={{ fontSize: "10px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Tier 1 Primary Responder
              </div>
              <div style={{ fontSize: "18px", fontWeight: 800, color: "#ffffff", marginTop: "4px" }}>
                Rugved Mhatre
              </div>
              <div style={{ fontSize: "11px", color: "#38bdf8", marginTop: "2px" }}>
                Core SRE Lead • Mobile Push, SMS, and Voice Call Dispatched
              </div>
              <div style={{ display: "flex", gap: "12px", marginTop: "10px", fontSize: "10px", color: "#cbd5e1", paddingTop: "8px", borderTop: "1px solid #334155" }}>
                <span>MTTA Target: <strong>&lt; 5m</strong></span>
                <span>•</span>
                <span>Auto-Escalate: <strong>15m timeout</strong></span>
              </div>
            </div>

            {/* Escalation Ladder */}
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginBottom: "10px" }}>
                Escalation Ladder Policy
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {[
                  { level: "Level 1", name: "Rugved Mhatre", role: "Primary On-Call SRE", status: "Notified (0m)", active: true },
                  { level: "Level 2", name: "Samruddhi Kakade", role: "Data Platform Tech Lead", status: "Standby (+15m)", active: false },
                  { level: "Level 3", name: "Aarzoo Sharma", role: "Incident Commander", status: "Standby (+30m)", active: false }
                ].map((tier, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "10px 12px",
                      borderRadius: "6px",
                      background: tier.active ? "#eff6ff" : "#f8fafc",
                      border: `1px solid ${tier.active ? "#bfdbfe" : "#e2e8f0"}`
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: tier.active ? "#1e40af" : "#0f172a" }}>
                        {tier.level}: {tier.name}
                      </div>
                      <div style={{ fontSize: "10px", color: "#64748b", marginTop: "1px" }}>{tier.role}</div>
                    </div>
                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: tier.active ? "#dbeafe" : "#f1f5f9",
                      color: tier.active ? "#1d4ed8" : "#64748b"
                    }}>
                      {tier.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ServiceNow ITSM Mapping */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>ServiceNow CMDB & ITSM Mapping</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Bi-directional incident ticket bridge</div>
              </div>
              <span style={{ fontSize: "10px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "3px 8px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                SYNCED
              </span>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "12px" }}>
                <div style={{ fontSize: "10px", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>
                  ServiceNow Ticket ID
                </div>
                <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>
                  INC0089241 (P1 High Priority Ticket)
                </div>
                <div style={{ fontSize: "11px", color: "#475569", marginTop: "4px" }}>
                  Assignment Group: <strong>Cloud Infrastructure Operations</strong> • Sync State: <strong style={{ color: "#16a34a" }}>2-Way Active</strong>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>WEBHOOK DELIVERY</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#16a34a", marginTop: "2px" }}>200 OK (0 retries)</div>
                </div>
                <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "6px", padding: "10px" }}>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>SECURITY HMAC</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", marginTop: "2px" }}>Verified SHA-256</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: PagerDuty Incident Queue */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>PagerDuty Incident Queue ({incidents.length})</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Live incident alerts synchronized via PagerDuty REST API</div>
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "3px 8px",
              borderRadius: "12px",
              background: activeIncidents.length > 0 ? "#fee2e2" : "#dcfce7",
              color: activeIncidents.length > 0 ? "#dc2626" : "#16a34a"
            }}>
              {activeIncidents.length > 0 ? `${activeIncidents.length} OPEN ALERTS` : "0 OPEN ALERTS"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "720px", overflowY: "auto" }}>
            {sortedIncidents.slice(0, 15).map((inc) => {
              const isResolved = inc.status === "RESOLVED";
              const isAck = inc.status === "ACKNOWLEDGED";

              return (
                <div
                  key={inc.id}
                  style={{
                    background: isResolved ? "#f8fafc" : "#fff1f2",
                    borderLeft: `4px solid ${isResolved ? "#10b981" : isAck ? "#f59e0b" : "#ef4444"}`,
                    borderTop: "1px solid #e2e8f0",
                    borderRight: "1px solid #e2e8f0",
                    borderBottom: "1px solid #e2e8f0",
                    borderRadius: "0 6px 6px 0",
                    padding: "12px 14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "1px 6px",
                        borderRadius: "3px",
                        background: (inc.priority || "P1") === "P1" ? "#ef4444" : "#f59e0b",
                        color: "#ffffff"
                      }}>
                        {inc.priority || "P1"}
                      </span>
                      <strong style={{ color: "#0f172a", fontSize: "13px" }}>#{inc.id}</strong>
                      <span style={{ color: "#64748b", fontSize: "11px" }}>• {inc.primary_service_id}</span>
                    </div>

                    <span style={{
                      fontSize: "10px",
                      fontWeight: 700,
                      padding: "2px 8px",
                      borderRadius: "10px",
                      background: isResolved ? "#dcfce7" : isAck ? "#fef3c7" : "#fee2e2",
                      color: isResolved ? "#15803d" : isAck ? "#b45309" : "#b91c1c"
                    }}>
                      {inc.status}
                    </span>
                  </div>

                  <div style={{ fontSize: "12px", color: "#334155", fontWeight: 600 }}>
                    {inc.summary}
                  </div>

                  <div style={{ fontSize: "10px", color: "#64748b" }}>
                    Dedup Key: <code>{(inc.pagerduty_id || "nexus-claims-database").slice(0, 36)}...</code>
                  </div>

                  {!isResolved && (
                    <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                      {!isAck && (
                        <button
                          disabled={isViewer}
                          onClick={() => onAcknowledgeIncident(inc.id)}
                          className="btn-tactile btn-tactile-warning"
                          style={{ padding: "4px 10px", fontSize: "10px" }}
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        disabled={isViewer}
                        onClick={() => onResolveIncident(inc.id)}
                        className="btn-tactile btn-tactile-success"
                        style={{ padding: "4px 10px", fontSize: "10px" }}
                      >
                        Resolve
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
