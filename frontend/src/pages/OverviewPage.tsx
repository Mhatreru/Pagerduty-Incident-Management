import React from "react";
import { useNavigate } from "react-router-dom";
import { SimulationBar } from "../components/SimulationBar";
import { PathwayStepper } from "../components/PathwayStepper";
import { Analytics, Incident, Service } from "../types";
import LanguageIcon from "@mui/icons-material/Language";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SpeedIcon from "@mui/icons-material/Speed";
import LayersIcon from "@mui/icons-material/Layers";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import PsychologyIcon from "@mui/icons-material/Psychology";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { RoiMetrics } from "../types";

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

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    hour12: true
  }).format(new Date()).replace(",", " •");

  const [roiMetrics, setRoiMetrics] = React.useState<RoiMetrics | null>(null);

  React.useEffect(() => {
    const fetchV2Data = async () => {
      try {
        const roiRes = await fetch("http://127.0.0.1:8000/api/v2/analytics/roi");
        if (roiRes.ok) setRoiMetrics(await roiRes.json());
      } catch (e) {
        console.error("V2 data fetch error", e);
      }
    };
    fetchV2Data();
    const interval = setInterval(fetchV2Data, 6000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{
      padding: "20px 24px",
      maxWidth: "1500px",
      margin: "0 auto",
      fontFamily: "Inter, sans-serif",
      color: "#0f172a",
      boxSizing: "border-box"
    }}>
      {/* ----------------- TOP HEADER ----------------- */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "20px",
        paddingBottom: "16px",
        borderBottom: "1px solid #e2e8f0"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <h1 style={{ margin: 0, fontSize: "24px", fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>
              NEXUS SRE Cockpit
            </h1>
            {isOutage ? (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "16px",
                background: "#fee2e2",
                color: "#dc2626",
                fontSize: "11px",
                fontWeight: 700
              }}>
                <span style={{
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  background: "#dc2626",
                  animation: "pulse 1.5s infinite"
                }} />
                P1 Degradation Active
              </span>
            ) : (
              <span style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "3px 10px",
                borderRadius: "16px",
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "11px",
                fontWeight: 700
              }}>
                <CheckCircleIcon style={{ fontSize: "14px", color: "#16a34a" }} />
                100% Operational • All Systems Green
              </span>
            )}
          </div>
          <p style={{ fontSize: "13px", color: "#64748b", margin: "4px 0 0 0" }}>
            Real-time telemetry orchestration: <strong>Stage 1</strong> Dynatrace APM ➔ <strong>Stage 2</strong> Gemini AI Triage ➔ <strong>Stage 3</strong> PagerDuty On-Call
          </p>
        </div>

        {/* User Info & Role Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <span style={{ fontSize: "12px", color: "#64748b", fontWeight: 500 }}>
            {formattedDate}
          </span>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            background: "#f8fafc",
            padding: "4px 10px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1"
          }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b" }}>ROLE:</span>
            <select
              value={currentRole}
              onChange={(e) => onRoleChange(e.target.value)}
              style={{
                border: "none",
                background: "transparent",
                fontSize: "12px",
                fontWeight: 700,
                color: "#0f172a",
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

      {/* Guided Pathway Stepper */}
      <PathwayStepper activeIncidentCount={activeIncidents.length} />

      {/* Pathway Quick Start Callout */}
      <div style={{
        background: "linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)",
        border: "1px solid #bfdbfe",
        borderRadius: "8px",
        padding: "12px 18px",
        marginBottom: "20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span style={{
            fontSize: "11px",
            fontWeight: 800,
            color: "#1d4ed8",
            background: "#dbeafe",
            padding: "3px 8px",
            borderRadius: "6px"
          }}>
            GUIDED INCIDENT LIFECYCLE
          </span>
          <span style={{ fontSize: "13px", color: "#334155" }}>
            Follow the 4-step sequence: <strong>1. Detect (Dynatrace)</strong> ➔ <strong>2. Triage (PagerDuty)</strong> ➔ <strong>3. War Room (AIOps)</strong> ➔ <strong>4. Postmortem & ROI</strong>.
          </span>
        </div>
        <button
          onClick={() => navigate(activeIncidents.length > 0 ? "/incidents" : "/monitoring")}
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
            whiteSpace: "nowrap",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
          }}
        >
          <span>{activeIncidents.length > 0 ? "Go to Active War Room" : "Start at Step 1: Detect"}</span>
          <ArrowForwardIcon style={{ fontSize: "16px" }} />
        </button>
      </div>

      {/* ----------------- SIMULATION DRILL BAR ----------------- */}
      <div style={{ marginBottom: "20px" }}>
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

      {/* ----------------- 4 CLEAN, SPACIOUS EXECUTIVE KPIS ----------------- */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Availability */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              CLUSTER AVAILABILITY
            </span>
            <SpeedIcon style={{ fontSize: "18px", color: isOutage ? "#dc2626" : "#16a34a" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: isOutage ? "#dc2626" : "#0f172a", lineHeight: "1.1" }}>
            {isOutage ? "98.4%" : "99.98%"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Target SLA: 99.90%
          </div>
        </div>

        {/* Active Incidents */}
        <div style={{
          background: "#ffffff",
          border: `1px solid ${activeIncidents.length > 0 ? "#fecdd3" : "#e2e8f0"}`,
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          borderBottom: activeIncidents.length > 0 ? "3px solid #dc2626" : "1px solid #e2e8f0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              OPEN INCIDENTS
            </span>
            <WarningAmberIcon style={{ fontSize: "18px", color: activeIncidents.length > 0 ? "#dc2626" : "#64748b" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: activeIncidents.length > 0 ? "#dc2626" : "#0f172a", lineHeight: "1.1" }}>
            {activeIncidents.length} {activeIncidents.length === 1 ? "Active" : "Active"}
          </div>
          <div style={{ fontSize: "11px", color: activeIncidents.length > 0 ? "#dc2626" : "#64748b", marginTop: "4px", fontWeight: 600 }}>
            {activeIncidents.length > 0 ? "P1 Critical — War Room Engaged" : "All 4 Services Healthy"}
          </div>
        </div>

        {/* MTTR */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              MEAN TIME TO RECOVER (MTTR)
            </span>
            <LayersIcon style={{ fontSize: "18px", color: "#8b5cf6" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: "1.1" }}>
            {analytics.mttr_minutes ? `${analytics.mttr_minutes}m` : "3.8m"}
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            ↓ 91.6% faster with AI Runbooks
          </div>
        </div>

        {/* Financial ROI */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              FINANCIAL DOWNTIME SAVED
            </span>
            <AttachMoneyIcon style={{ fontSize: "18px", color: "#16a34a" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#16a34a", lineHeight: "1.1" }}>
            {roiMetrics ? roiMetrics.total_cost_saved_formatted : "$360,500"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Based on $15k/hr outage prevention
          </div>
        </div>
      </div>

      {/* ----------------- 3-STAGE LIFECYCLE PIPELINE ----------------- */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "16px 20px",
        marginBottom: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em" }}>
              END-TO-END OPERATIONAL LIFECYCLE
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Real-time progression from synthetic detection to AI root cause analysis and PagerDuty escalation.
            </div>
          </div>
          <span style={{
            fontSize: "10px",
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: "4px",
            background: isOutage ? "#fee2e2" : "#dcfce7",
            color: isOutage ? "#dc2626" : "#16a34a"
          }}>
            {isOutage ? "ACTIVE OUTAGE WORKFLOW" : "PIPELINE STANDBY"}
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
          {/* Stage 1 */}
          <div
            onClick={() => navigate("/monitoring")}
            style={{
              border: `1px solid ${isOutage ? "#fed7aa" : "#e2e8f0"}`,
              background: isOutage ? "#fff7ed" : "#f8fafc",
              borderRadius: "8px",
              padding: "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "110px"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <LanguageIcon style={{ color: "#0284c7", fontSize: "18px" }} />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>
                    Stage 1: Dynatrace APM
                  </span>
                </div>
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: isOutage ? "#ffedd5" : "#f0fdf4",
                  color: isOutage ? "#c2410c" : "#16a34a"
                }}>
                  {isOutage ? "ANOMALY DETECTED" : "HEALTHY"}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Synthetic Probe: <strong>{isOutage ? "HTTP 500 (5,240ms)" : "HTTP 200 (48ms)"}</strong>
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                OneAgent monitoring 4 microservices.
              </div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#0284c7", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
              <span>View APM Telemetry</span>
              <ArrowForwardIcon style={{ fontSize: "12px" }} />
            </div>
          </div>

          {/* Stage 2 */}
          <div
            onClick={() => navigate("/incidents")}
            style={{
              border: `1px solid ${activeIncidents.length > 0 ? "#d8b4fe" : "#e2e8f0"}`,
              background: activeIncidents.length > 0 ? "#faf5ff" : "#f8fafc",
              borderRadius: "8px",
              padding: "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "110px"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <PsychologyIcon style={{ color: "#9333ea", fontSize: "18px" }} />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>
                    Stage 2: Gemini AI Triage
                  </span>
                </div>
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: activeIncidents.length > 0 ? "#f3e8ff" : "#f1f5f9",
                  color: activeIncidents.length > 0 ? "#7e22ce" : "#64748b"
                }}>
                  {activeIncidents.length > 0 ? "WAR ROOM ENGAGED" : "STANDBY"}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Root Cause: <strong>{activeIncidents.length > 0 ? "DB Pool Saturation (94% conf.)" : "Diagnostic AI Ready"}</strong>
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                Presidio PII sanitized & automated video bridge.
              </div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#9333ea", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
              <span>Open War Room & Runbooks</span>
              <ArrowForwardIcon style={{ fontSize: "12px" }} />
            </div>
          </div>

          {/* Stage 3 */}
          <div
            onClick={() => navigate("/incident-response")}
            style={{
              border: `1px solid ${isOutage ? "#fed7aa" : "#e2e8f0"}`,
              background: isOutage ? "#fff7ed" : "#f8fafc",
              borderRadius: "8px",
              padding: "14px",
              cursor: "pointer",
              transition: "all 0.15s ease",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              minHeight: "110px"
            }}
          >
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <NotificationsActiveIcon style={{ color: "#ea580c", fontSize: "18px" }} />
                  <span style={{ fontSize: "12px", fontWeight: 800, color: "#0f172a" }}>
                    Stage 3: PagerDuty On-Call
                  </span>
                </div>
                <span style={{
                  fontSize: "9px",
                  fontWeight: 700,
                  padding: "2px 6px",
                  borderRadius: "4px",
                  background: isOutage ? "#ffedd5" : "#f0fdf4",
                  color: isOutage ? "#c2410c" : "#16a34a"
                }}>
                  {isOutage ? "RESPONDER PAGED" : "ON-CALL READY"}
                </span>
              </div>
              <div style={{ fontSize: "11px", color: "#475569" }}>
                Primary: <strong>Rugved Mhatre (Core SRE Lead)</strong>
              </div>
              <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                Auto-escalation matrix & incident sync.
              </div>
            </div>
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#ea580c", display: "flex", alignItems: "center", gap: "4px", marginTop: "8px" }}>
              <span>View On-Call Schedule</span>
              <ArrowForwardIcon style={{ fontSize: "12px" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ----------------- LOWER SECTION: MICROSERVICES (LEFT) & RECENT INCIDENTS (RIGHT) ----------------- */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "18px" }}>
        {/* Core Microservices */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em" }}>
                CORE MICROSERVICES TOPOLOGY
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Live response latencies and target SLAs.
              </div>
            </div>
            <button
              onClick={() => navigate("/monitoring")}
              className="btn-tactile btn-tactile-secondary"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              Full APM Metrics ➔
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            {services.map((s) => {
              const isCrit = s.status === "CRITICAL";
              const isDeg = s.status === "DEGRADED";
              return (
                <div key={s.id} style={{
                  background: isCrit ? "#fff1f2" : isDeg ? "#fffbeb" : "#f8fafc",
                  border: `1px solid ${isCrit ? "#fecdd3" : isDeg ? "#fde68a" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  padding: "12px 14px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px" }}>
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{s.name}</div>
                      <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>Tier {s.tier} • {s.depends_on || "standalone"}</div>
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

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#475569" }}>
                    <span>Latency: <strong>{isCrit ? "5,200ms" : isDeg ? "420ms" : "28ms"}</strong></span>
                    <span>SLA: <strong>99.9%</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Incidents Feed */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em" }}>
                RECENT INCIDENT FEED
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                Active triage queue & historical postmortems.
              </div>
            </div>
            <button
              onClick={() => navigate("/incidents")}
              className="btn-tactile btn-tactile-secondary"
              style={{ padding: "4px 10px", fontSize: "11px" }}
            >
              All Incidents ({incidents.length}) ➔
            </button>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {incidents.slice(0, 4).map((inc) => {
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
                    padding: "10px 14px",
                    cursor: "pointer",
                    transition: "all 0.1s"
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
                      <strong style={{ color: "#0f172a", fontSize: "12px" }}>Incident #{inc.id}</strong>
                      <span style={{ color: "#64748b", fontSize: "11px" }}>• {inc.primary_service_id}</span>
                    </div>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: "3px",
                      background: isResolved ? "#dcfce7" : isAck ? "#fef3c7" : "#fee2e2",
                      color: isResolved ? "#15803d" : isAck ? "#b45309" : "#b91c1c"
                    }}>
                      {inc.status}
                    </span>
                  </div>
                  <div style={{ color: "#475569", marginTop: "4px", fontSize: "11px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
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
