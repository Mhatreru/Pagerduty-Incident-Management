import React from "react";
import { useNavigate } from "react-router-dom";
import { SimulationBar } from "../components/SimulationBar";
import { Analytics, Incident, Service } from "../types";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SpeedIcon from "@mui/icons-material/Speed";
import LayersIcon from "@mui/icons-material/Layers";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SecurityIcon from "@mui/icons-material/Security";

interface OverviewPageProps {
  services?: Service[];
  analytics: Analytics;
  incidents: Incident[];
  currentRole: string;
  onRoleChange: (role: string) => void;
  onTriggerCascade: () => Promise<void>;
  onRunHealing: () => Promise<void>;
  onInjectLatency: () => Promise<void>;
  onInjectDowntime: () => Promise<void>;
  onSimulatePDAck: () => Promise<void>;
  onSimulatePDResolved: () => Promise<void>;
  onAcknowledgeIncident?: (id: number) => Promise<void>;
  onResolveIncident?: (id: number) => Promise<void>;
  onExecuteRunbook?: (runbookId: string, incidentId: number, isDryRun: boolean) => Promise<any>;
  demoStatus?: { database_latency_active: boolean; service_failure_active: boolean; offline?: boolean };
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  services = [],
  analytics,
  incidents,
  currentRole,
  onRoleChange,
  onTriggerCascade,
  onRunHealing,
  onInjectLatency,
  onInjectDowntime,
  onSimulatePDAck,
  onSimulatePDResolved,
  demoStatus
}) => {
  const navigate = useNavigate();
  const activeIncidents = incidents.filter(i => i.status !== "RESOLVED");
  const isOutage = services.some(s => s.status === "CRITICAL" || s.status === "DEGRADED") || activeIncidents.length > 0;

  // Formatted date string
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  }).format(new Date()).replace(",", " •");

  return (
    <div style={{
      padding: "0 4px 10px 4px",
      fontFamily: "Inter, sans-serif",
      height: "calc(100vh - 32px)",
      maxHeight: "calc(100vh - 32px)",
      boxSizing: "border-box",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* -------------------------------------------------------------
          TOP BAR: Title & Status Beacon on Left, User & Role on Right
          ------------------------------------------------------------- */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        borderBottom: "1px solid #e2e8f0",
        padding: "4px 0 6px 0",
        background: "#ffffff"
      }}>
        {/* Title and Live Beacon */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.02em" }}>
              NEXUS SRE Cockpit
            </h1>
            {isOutage ? (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: "11px",
                fontWeight: 700
              }}>
                <span style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#dc2626",
                  animation: "pulse 1.5s infinite"
                }} />
                P1 Degradation Detected
              </span>
            ) : (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "5px",
                padding: "2px 8px",
                borderRadius: "12px",
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "11px",
                fontWeight: 700
              }}>
                <span style={{
                  width: "7px",
                  height: "7px",
                  borderRadius: "50%",
                  background: "#16a34a"
                }} />
                100% Operational • All Stages Green
              </span>
            )}
          </div>
          <div style={{ fontSize: "10.5px", color: "#64748b", marginTop: "2px" }}>
            Autonomous Incident Lifecycle: <strong>1</strong> Dynatrace APM ➔ <strong>2</strong> Incident Management (Gemini AI) ➔ <strong>3</strong> Incident Response (PagerDuty)
          </div>
        </div>

        {/* User Info & Role Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
            {formattedDate}
          </span>

          <div style={{
            width: "26px",
            height: "26px",
            borderRadius: "50%",
            background: "#4f46e5",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "11px",
            fontWeight: 700
          }}>
            {currentRole.charAt(0).toUpperCase()}
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            background: "#ffffff",
            padding: "3px 6px",
            borderRadius: "6px",
            border: "1px solid #cbd5e1"
          }}>
            <span style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b" }}>ROLE:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#1e293b",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="Admin">Admin</option>
              <option value="Operator">Operator</option>
              <option value="Viewer">Viewer</option>
            </select>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          ROW 2: SIMULATION CONTROLS
          ------------------------------------------------------------- */}
      <div style={{ marginTop: "4px", marginBottom: "6px" }}>
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
      </div>

      {/* -------------------------------------------------------------
          ROW 3: 5 HIGH-LEVEL SRE KPI METRICS
          ------------------------------------------------------------- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "8px",
        marginBottom: "8px"
      }}>
        {/* Availability */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{
            background: isOutage ? "#fee2e2" : "#dcfce7",
            color: isOutage ? "#dc2626" : "#16a34a",
            padding: "7px",
            borderRadius: "6px",
            display: "flex"
          }}>
            <SpeedIcon style={{ fontSize: "19px" }} />
          </div>
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Cluster Uptime</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: isOutage ? "#dc2626" : "#0f172a" }}>
              {isOutage ? "98.4%" : "99.98%"}
            </div>
          </div>
        </div>

        {/* Open Incidents */}
        <div style={{
          background: "#ffffff",
          border: `1px solid ${activeIncidents.length > 0 ? "#fecdd3" : "#e2e8f0"}`,
          borderRadius: "8px",
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{
            background: activeIncidents.length > 0 ? "#fee2e2" : "#f1f5f9",
            color: activeIncidents.length > 0 ? "#dc2626" : "#475569",
            padding: "7px",
            borderRadius: "6px",
            display: "flex"
          }}>
            <WarningAmberIcon style={{ fontSize: "19px" }} />
          </div>
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Active Incidents</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: activeIncidents.length > 0 ? "#dc2626" : "#0f172a" }}>
              {activeIncidents.length} P1 Open
            </div>
          </div>
        </div>

        {/* Noise Reduction */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ background: "#eff6ff", color: "#2563eb", padding: "7px", borderRadius: "6px", display: "flex" }}>
            <TrendingDownIcon style={{ fontSize: "19px" }} />
          </div>
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Noise Deduplication</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              {analytics.alert_reduction_rate ? `${analytics.alert_reduction_rate}%` : "96.2%"}
            </div>
          </div>
        </div>

        {/* Avg MTTR */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ background: "#faf5ff", color: "#9333ea", padding: "7px", borderRadius: "6px", display: "flex" }}>
            <LayersIcon style={{ fontSize: "19px" }} />
          </div>
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>Avg MTTR</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              {analytics.mttr_minutes ? `${analytics.mttr_minutes} min` : "14.2 min"}
            </div>
          </div>
        </div>

        {/* SLA Compliance */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "9px 12px",
          display: "flex",
          alignItems: "center",
          gap: "9px",
          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
        }}>
          <div style={{ background: "#f0fdf4", color: "#16a34a", padding: "7px", borderRadius: "6px", display: "flex" }}>
            <SecurityIcon style={{ fontSize: "19px" }} />
          </div>
          <div>
            <div style={{ fontSize: "9.5px", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>SLA Compliance</div>
            <div style={{ fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
              {analytics.sla_compliance_rate ? `${analytics.sla_compliance_rate}%` : "99.8%"}
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          ROW 4: THE 3-STAGE OPERATIONAL PIPELINE FLOW TRACKER
          ------------------------------------------------------------- */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        padding: "10px 14px",
        marginBottom: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              End-to-End Operational Lifecycle Pipeline
            </span>
            <span style={{ fontSize: "10px", color: "#64748b" }}>
              • Click any stage to navigate directly to its dedicated workspace
            </span>
          </div>
          <span style={{
            fontSize: "9.5px",
            fontWeight: 800,
            padding: "2px 7px",
            borderRadius: "4px",
            background: isOutage ? "#fee2e2" : "#dcfce7",
            color: isOutage ? "#dc2626" : "#16a34a"
          }}>
            {isOutage ? "ACTIVE INCIDENT PIPELINE" : "HEALTHY BASELINE PIPELINE"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
          {/* STAGE 1: DYNATRACE APM */}
          <div
            onClick={() => navigate("/monitoring")}
            style={{
              border: `1px solid ${isOutage ? "#fed7aa" : "#e2e8f0"}`,
              background: isOutage ? "#fff7ed" : "#f8fafc",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "102px"
            }}
            className="hover-card"
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <LanguageIcon style={{ color: "#0284c7", fontSize: "17px" }} />
                  <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a" }}>
                    Stage 1: Dynatrace APM
                  </span>
                </div>
                <span style={{
                  fontSize: "8.5px",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: isOutage ? "#ffedd5" : "#f0fdf4",
                  color: isOutage ? "#c2410c" : "#16a34a"
                }}>
                  {isOutage ? "ANOMALY DETECTED" : "ALL SYSTEMS OK"}
                </span>
              </div>
              <div style={{ fontSize: "10.5px", color: "#475569", marginTop: "3px" }}>
                Synthetic probe: <strong>{isOutage ? "HTTP 500 Error (5,240ms)" : "HTTP 200 OK (48ms)"}</strong>
              </div>
              <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "1px" }}>
                OneAgent monitoring {services.length} active microservices & Davis AI root cause feed.
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "6px",
              paddingTop: "5px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              fontSize: "10px",
              fontWeight: 700,
              color: "#0284c7"
            }}>
              <span>Open Dynatrace Telemetry</span>
              <ArrowForwardIcon style={{ fontSize: "13px" }} />
            </div>
          </div>

          {/* STAGE 2: INCIDENT MANAGEMENT */}
          <div
            onClick={() => navigate("/incidents")}
            style={{
              border: `1px solid ${activeIncidents.length > 0 ? "#cbd5e1" : "#e2e8f0"}`,
              background: activeIncidents.length > 0 ? "#faf5ff" : "#f8fafc",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: activeIncidents.length > 0 ? "0 0 0 2px rgba(147, 51, 234, 0.2)" : "none",
              minHeight: "102px"
            }}
            className="hover-card"
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <PsychologyIcon style={{ color: "#9333ea", fontSize: "17px" }} />
                  <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a" }}>
                    Stage 2: Incident Management
                  </span>
                </div>
                <span style={{
                  fontSize: "8.5px",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: activeIncidents.length > 0 ? "#f3e8ff" : "#f1f5f9",
                  color: activeIncidents.length > 0 ? "#7e22ce" : "#64748b"
                }}>
                  {activeIncidents.length > 0 ? "WAR ROOM ACTIVE" : "0 OPEN INCIDENTS"}
                </span>
              </div>
              <div style={{ fontSize: "10.5px", color: "#475569", marginTop: "3px" }}>
                Gemini AI RCA: <strong>{activeIncidents.length > 0 ? "DB pool exhaustion (94% conf.)" : "Diagnostic engine standby"}</strong>
              </div>
              <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "1px" }}>
                Interactive Gemini SRE Copilot & 1-click remediation runbooks.
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "6px",
              paddingTop: "5px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              fontSize: "10px",
              fontWeight: 700,
              color: "#9333ea"
            }}>
              <span>Open Incident War Room</span>
              <ArrowForwardIcon style={{ fontSize: "13px" }} />
            </div>
          </div>

          {/* STAGE 3: INCIDENT RESPONSE (PAGERDUTY) */}
          <div
            onClick={() => navigate("/incident-response")}
            style={{
              border: `1px solid ${isOutage ? "#fed7aa" : "#e2e8f0"}`,
              background: isOutage ? "#fff7ed" : "#f8fafc",
              borderRadius: "8px",
              padding: "10px 12px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "102px"
            }}
            className="hover-card"
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                  <NotificationsActiveIcon style={{ color: "#ea580c", fontSize: "17px" }} />
                  <span style={{ fontSize: "11.5px", fontWeight: 800, color: "#0f172a" }}>
                    Stage 3: Incident Response
                  </span>
                </div>
                <span style={{
                  fontSize: "8.5px",
                  fontWeight: 800,
                  padding: "1px 5px",
                  borderRadius: "3px",
                  background: isOutage ? "#ffedd5" : "#f0fdf4",
                  color: isOutage ? "#c2410c" : "#16a34a"
                }}>
                  {isOutage ? "RESPONDER PAGED" : "ON-CALL STANDBY"}
                </span>
              </div>
              <div style={{ fontSize: "10.5px", color: "#475569", marginTop: "3px" }}>
                Primary: <strong>Rugved Mhatre (Core SRE Lead)</strong>
              </div>
              <div style={{ fontSize: "9.5px", color: isOutage ? "#c2410c" : "#64748b", marginTop: "2px", fontWeight: isOutage ? 600 : 400 }}>
                {activeIncidents.length > 0
                  ? `PagerDuty Alert Dispatched • Dedup: ${(activeIncidents[0].pagerduty_id || "nexus-incident").slice(0, 24)}`
                  : "Escalation ladder synced • On-call rotation ready"}
              </div>
            </div>

            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: "6px",
              paddingTop: "5px",
              borderTop: "1px solid rgba(0,0,0,0.06)",
              fontSize: "10px",
              fontWeight: 700,
              color: "#ea580c"
            }}>
              <span>View On-Call & Escalation</span>
              <ArrowForwardIcon style={{ fontSize: "13px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* -------------------------------------------------------------
          ROW 5: CORE MICROSERVICES MATRIX (LEFT) & RECENT ACTIVITY (RIGHT)
          ------------------------------------------------------------- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.2fr 1fr",
        gap: "10px",
        flex: 1,
        minHeight: "220px",
        marginBottom: "8px"
      }}>
        {/* Left Panel: Core Microservices Matrix */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <LayersIcon style={{ color: "#475569", fontSize: "16px" }} />
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Core Microservices Health Matrix
              </span>
            </div>
            <button
              onClick={() => navigate("/monitoring")}
              className="btn-tactile btn-tactile-secondary"
              style={{ padding: "2px 8px", fontSize: "10px" }}
            >
              Full APM Metrics ➔
            </button>
          </div>

          <div style={{ flex: 1, display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", overflowY: "auto" }}>
            {services.map((s) => {
              const isCrit = s.status === "CRITICAL";
              const isDeg = s.status === "DEGRADED";
              return (
                <div key={s.id} style={{
                  background: isCrit ? "#fff1f2" : isDeg ? "#fffbeb" : "#f8fafc",
                  border: `1px solid ${isCrit ? "#fecdd3" : isDeg ? "#fde68a" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  padding: "10px 12px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", lineHeight: "1.2" }}>{s.name}</div>
                      <div style={{ fontSize: "9.5px", color: "#64748b", marginTop: "2px" }}>Tier: {s.tier} • depends on {s.depends_on || "none"}</div>
                    </div>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      padding: "2px 6px",
                      borderRadius: "4px",
                      background: isCrit ? "#fee2e2" : isDeg ? "#fef3c7" : "#dcfce7",
                      color: isCrit ? "#b91c1c" : isDeg ? "#b45309" : "#15803d"
                    }}>
                      {s.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: "6px", fontSize: "10px", color: "#475569" }}>
                    <span>Latency: <strong>{isCrit ? "5,200ms" : isDeg ? "420ms" : "28ms"}</strong></span>
                    <span>SLA: <strong>99.9% Target</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Incident Log & Operational Activity */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "12px 14px",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <NotificationsActiveIcon style={{ color: "#475569", fontSize: "16px" }} />
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                Incident Lifecycle History
              </span>
            </div>
            <button
              onClick={() => navigate("/incidents")}
              className="btn-tactile btn-tactile-secondary"
              style={{ padding: "2px 8px", fontSize: "10px" }}
            >
              All Incidents ({incidents.length}) ➔
            </button>
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
            {incidents.slice(0, 3).map((inc) => {
              const isResolved = inc.status === "RESOLVED";
              const isAck = inc.status === "ACKNOWLEDGED";
              return (
                <div
                  key={inc.id}
                  onClick={() => navigate("/incidents")}
                  style={{
                    background: isResolved ? "#f8fafc" : "#fff1f2",
                    borderLeft: `4px solid ${isResolved ? "#10b981" : isAck ? "#f59e0b" : "#ef4444"}`,
                    borderTop: "1px solid #e2e8f0",
                    borderRight: "1px solid #e2e8f0",
                    borderBottom: "1px solid #e2e8f0",
                    borderRadius: "0 6px 6px 0",
                    padding: "8px 12px",
                    cursor: "pointer",
                    fontSize: "11px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        fontSize: "8.5px",
                        fontWeight: 800,
                        padding: "1px 5px",
                        borderRadius: "3px",
                        background: (inc.priority || "P1") === "P1" ? "#ef4444" : "#f59e0b",
                        color: "#ffffff"
                      }}>
                        {inc.priority || "P1"}
                      </span>
                      <strong style={{ color: "#0f172a" }}>Incident #{inc.id}</strong>
                      <span style={{ color: "#64748b", fontSize: "10px" }}>• {inc.primary_service_id}</span>
                    </div>
                    <span style={{
                      fontSize: "8.5px",
                      fontWeight: 700,
                      padding: "1px 5px",
                      borderRadius: "3px",
                      background: isResolved ? "#dcfce7" : isAck ? "#fef3c7" : "#fee2e2",
                      color: isResolved ? "#15803d" : isAck ? "#b45309" : "#b91c1c"
                    }}>
                      {inc.status}
                    </span>
                  </div>
                  <div style={{ color: "#334155", marginTop: "3px", fontSize: "10px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {inc.summary}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
