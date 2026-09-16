import React from "react";
import { Incident } from "../types";
import { PageHeader } from "../components/PageHeader";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import PersonIcon from "@mui/icons-material/Person";
import SyncAltIcon from "@mui/icons-material/SyncAlt";

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
  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED");
  const isViewer = currentRole === "VIEWER";
  const sortedIncidents = [...incidents].sort((a, b) => (a.status === "RESOLVED" ? 1 : 0) - (b.status === "RESOLVED" ? 1 : 0));

  return (
    <div style={{
      padding: "0 4px 14px 4px",
      fontFamily: "Inter, sans-serif",
      maxHeight: "calc(100vh - 32px)",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      <PageHeader
        title="PagerDuty Incident Response & On-Call Dispatch"
        subtitle="AUTOMATED ON-CALL ESCALATIONS • BI-DIRECTIONAL PAGERDUTY SYNC • SERVICENOW TICKET MANAGEMENT"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      {/* Main 3-Column Layout - Viewport Fit */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1.35fr 1fr",
        gap: "12px",
        height: "calc(100vh - 120px)",
        marginTop: "8px",
        boxSizing: "border-box"
      }}>
        {/* COLUMN 1: ON-CALL ROSTER & ESCALATION POLICIES */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <PersonIcon style={{ color: "#059669", fontSize: "18px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>On-Call Schedule & Escalation</span>
            </div>
            <span style={{ fontSize: "9px", background: "#f0fdf4", color: "#16a34a", padding: "2px 6px", borderRadius: "8px", fontWeight: 700 }}>
              ACTIVE
            </span>
          </div>

          {/* Primary Responder Card */}
          <div style={{ background: "#0f172a", borderRadius: "8px", padding: "12px", color: "#f8fafc" }}>
            <div style={{ fontSize: "9.5px", color: "#94a3b8", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              Tier 1 Primary Responder
            </div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#f8fafc", marginTop: "3px" }}>
              Rugved Mhatre (Core SRE Lead)
            </div>
            <div style={{ fontSize: "10.5px", color: "#38bdf8", marginTop: "2px" }}>
              PagerDuty App & SMS Active • Shift ends in 4h 12m
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "8px", fontSize: "9.5px", color: "#cbd5e1" }}>
              <span>MTTA Target: <strong>&lt; 5m</strong></span>
              <span>•</span>
              <span>Escalation Rule: <strong>15m timeout</strong></span>
            </div>
          </div>

          {/* Escalation Ladder */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#334155" }}>
              Escalation Policy Path
            </div>

            {[
              { level: "Level 1", name: "Rugved Mhatre", role: "Primary On-Call SRE", status: "Notified (0m)", color: "#10b981" },
              { level: "Level 2", name: "Samruddhi Kakade", role: "Data Platform Tech Lead", status: "Standby (+15m)", color: "#64748b" },
              { level: "Level 3", name: "Aarzoo Sharma", role: "Incident Commander", status: "Standby (+30m)", color: "#64748b" }
            ].map((esc, idx) => (
              <div key={idx} style={{
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "6px",
                padding: "7px 10px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                    <span style={{ color: "#6366f1" }}>{esc.level}:</span> {esc.name}
                  </div>
                  <div style={{ fontSize: "9.5px", color: "#64748b" }}>{esc.role}</div>
                </div>
                <span style={{ fontSize: "9.5px", fontWeight: 600, color: esc.color }}>{esc.status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COLUMN 2: ACTIVE PAGERDUTY INCIDENTS */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflow: "hidden"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <NotificationsActiveIcon style={{ color: "#ef4444", fontSize: "18px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>PagerDuty Incident Queue</span>
            </div>
            <span style={{
              fontSize: "9.5px",
              fontWeight: 700,
              padding: "2px 7px",
              borderRadius: "8px",
              background: activeIncidents.length > 0 ? "#fee2e2" : "#dcfce7",
              color: activeIncidents.length > 0 ? "#b91c1c" : "#15803d"
            }}>
              {activeIncidents.length} OPEN
            </span>
          </div>

          <div style={{
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            flex: 1,
            overflowY: "auto",
            padding: "2px 4px 20px 2px",
            boxSizing: "border-box"
          }}>
            {sortedIncidents.length === 0 ? (
              <div style={{ textAlign: "center", padding: "40px 10px", color: "#94a3b8", fontSize: "12px" }}>
                No PagerDuty incidents found.
              </div>
            ) : (
              sortedIncidents.map((inc) => {
                const isTriggered = inc.status === "TRIGGERED";
                const isAck = inc.status === "ACKNOWLEDGED";
                const isResolved = inc.status === "RESOLVED";

                return (
                  <div key={inc.id} style={{
                    background: isResolved ? "#f8fafc" : isAck ? "#fffbeb" : "#fff1f2",
                    border: `1px solid ${isResolved ? "#e2e8f0" : isAck ? "#fde68a" : "#fecdd3"}`,
                    borderRadius: "8px",
                    padding: "10px 12px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    boxShadow: "0 1px 2px rgba(0,0,0,0.03)",
                    flexShrink: 0
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{
                          background: "#0f172a", color: "#fff", fontSize: "8.5px", fontWeight: 700,
                          padding: "1px 5px", borderRadius: "3px"
                        }}>
                          {inc.priority || "P1"}
                        </span>
                        <strong style={{ fontSize: "11.5px", color: "#0f172a" }}>#{inc.id}</strong>
                        <span style={{ fontSize: "10px", color: "#475569" }}>• {inc.primary_service_id}</span>
                      </div>
                      <span style={{
                        fontSize: "8.5px",
                        fontWeight: 700,
                        padding: "1px 5px",
                        borderRadius: "3px",
                        background: isResolved ? "#dcfce7" : isAck ? "#fef3c7" : "#fee2e2",
                        color: isResolved ? "#15803d" : isAck ? "#b45309" : "#dc2626"
                      }}>
                        {inc.status}
                      </span>
                    </div>

                    <div style={{ fontSize: "10.5px", color: "#334155", lineHeight: "1.3" }}>
                      {inc.summary}
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(0,0,0,0.06)", paddingTop: "5px" }}>
                      <div style={{ fontSize: "9px", color: "#64748b" }}>
                        Dedup Key: <code style={{ fontSize: "9px" }}>{(inc.pagerduty_id || "pd-dedup-default").slice(0, 24)}...</code>
                      </div>

                      {/* Quick PagerDuty Response Buttons */}
                      <div style={{ display: "flex", gap: "6px" }}>
                        {isTriggered && (
                          <button
                            disabled={isViewer}
                            onClick={() => onAcknowledgeIncident(inc.id)}
                            className="btn-tactile btn-tactile-warning"
                            style={{ padding: "3px 8px", fontSize: "9.5px" }}
                          >
                            Acknowledge
                          </button>
                        )}
                        {!isResolved && (
                          <button
                            disabled={isViewer}
                            onClick={() => onResolveIncident(inc.id)}
                            className="btn-tactile btn-tactile-success"
                            style={{ padding: "3px 8px", fontSize: "9.5px" }}
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* COLUMN 3: SERVICENOW & WEBHOOK INTEGRATION SYNC */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <SyncAltIcon style={{ color: "#3b82f6", fontSize: "18px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Bi-Directional Sync & ServiceNow</span>
            </div>
            <span style={{ fontSize: "9px", background: "#eff6ff", color: "#1d4ed8", padding: "2px 6px", borderRadius: "8px", fontWeight: 700 }}>
              SYNCED
            </span>
          </div>

          {/* ServiceNow ITSM Linkage */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "9.5px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ServiceNow CMDB & ITSM Mapping
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", marginTop: "3px" }}>
              INC0089241 (P1 High Priority Ticket)
            </div>
            <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>
              Assignment Group: Cloud Infrastructure Operations
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "9.5px" }}>
              <span>Sync State: <strong style={{ color: "#16a34a" }}>2-Way Active</strong></span>
              <span>Last Heartbeat: <strong>4s ago</strong></span>
            </div>
          </div>

          {/* Webhook Delivery Health */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "10px" }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#334155", marginBottom: "4px" }}>
              PagerDuty Webhook Delivery Status
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569" }}>
              <span>Endpoint:</span>
              <code>/api/webhooks/pagerduty</code>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569", marginTop: "3px" }}>
              <span>Delivery Status:</span>
              <strong style={{ color: "#16a34a" }}>200 OK (0 retries)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569", marginTop: "3px" }}>
              <span>HMAC-SHA256:</span>
              <strong style={{ color: "#16a34a" }}>Verified Signature</strong>
            </div>
          </div>

          {/* Operational Response Automation & SLA */}
          <div style={{
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "10px",
            display: "flex",
            flexDirection: "column",
            gap: "5px"
          }}>
            <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#334155" }}>
              Incident Response SLA & Automation
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569" }}>
              <span>Target MTTA (Ack):</span>
              <strong style={{ color: "#0f172a" }}>&lt; 5.0 min</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569" }}>
              <span>Target MTTR (Resolve):</span>
              <strong style={{ color: "#0f172a" }}>&lt; 30.0 min</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569" }}>
              <span>Bi-Directional Sync:</span>
              <strong style={{ color: "#16a34a" }}>Healthy (Every 15s)</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "9.5px", color: "#475569" }}>
              <span>Active Responder Mode:</span>
              <strong style={{ color: "#6366f1" }}>Rugved Mhatre (Push / SMS)</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

