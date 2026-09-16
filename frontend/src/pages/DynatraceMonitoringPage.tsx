import React from "react";
import { Service, RawEvent } from "../types";
import { PageHeader } from "../components/PageHeader";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LanguageIcon from "@mui/icons-material/Language";
import StorageIcon from "@mui/icons-material/Storage";
import SpeedIcon from "@mui/icons-material/Speed";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

interface DynatraceMonitoringPageProps {
  services: Service[];
  rawAlerts: RawEvent[];
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const DynatraceMonitoringPage: React.FC<DynatraceMonitoringPageProps> = ({
  services,
  rawAlerts,
  currentRole,
  onRoleChange
}) => {
  const isOutage = services.some(s => s.status === "CRITICAL" || s.status === "DEGRADED");
  const criticalService = services.find(s => s.status === "CRITICAL");
  const syntheticLatency = isOutage ? 5240 : 357;

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif", maxHeight: "100vh", overflow: "hidden" }}>
      <PageHeader
        title="Dynatrace APM & Synthetic Website Monitoring"
        subtitle="CONTINUOUS END-USER SYNTHETIC HEALTH • APM TRANSACTION FLOW • DAVIS AI ANOMALY DETECTION"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      {/* Main 3-Column Layout - Viewport Fit (No Scroll) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1.05fr 1.25fr 1.1fr",
        gap: "14px",
        height: "calc(100vh - 130px)",
        marginTop: "10px"
      }}>
        {/* COLUMN 1: DYNATRACE SYNTHETIC MONITOR */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "14px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          overflowY: "auto"
        }}>
          {/* Section Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <LanguageIcon style={{ color: "#0284c7", fontSize: "18px" }} />
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>Dynatrace Synthetic Monitor</span>
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: "9999px",
              background: isOutage ? "#fee2e2" : "#dcfce7",
              color: isOutage ? "#b91c1c" : "#15803d",
              display: "flex",
              alignItems: "center",
              gap: "4px"
            }}>
              <span className={isOutage ? "beacon-critical" : "beacon-live"} />
              {isOutage ? "PROBE FAILING" : "ONLINE (100%)"}
            </span>
          </div>

          {/* Dynatrace Monitor Identity Card (From Live Dynatrace Console) */}
          <div style={{
            background: "#0f172a", borderRadius: "8px", padding: "12px", color: "#f8fafc",
            border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "6px"
          }}>
            <div style={{ fontSize: "9px", color: "#94a3b8", display: "flex", alignItems: "center", gap: "4px" }}>
              <span>Synthetic monitors</span>
              <span>&gt;</span>
              <strong style={{ color: "#38bdf8" }}>NEXUS POC - Claims Portal</strong>
            </div>

            <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff", letterSpacing: "-0.01em" }}>
              NEXUS POC - Claims Portal
            </div>

            <div style={{ fontSize: "11px", marginTop: "1px", marginBottom: "2px" }}>
              <span style={{ color: "#94a3b8" }}>(</span>
              <a
                href="https://intelligent-quote-engine.replit.app/"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#38bdf8",
                  textDecoration: "underline",
                  fontWeight: 600,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "3px"
                }}
              >
                Farmers Intelligent Quoting Hub <OpenInNewIcon style={{ fontSize: "11px" }} />
              </a>
              <span style={{ color: "#94a3b8" }}>)</span>
            </div>

            <div style={{ fontSize: "10px", color: "#94a3b8", lineHeight: "1.4" }}>
              HTTP monitor configured to run every 1 minute from N. Virginia
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "4px", paddingTop: "6px", borderTop: "1px solid #1e293b", fontSize: "10px" }}>
              <span style={{ color: "#64748b", fontFamily: "monospace" }}>ID: HTTP_MONITOR-06513F5EBB018508</span>
              <a
                href="https://mgd16706.apps.dynatrace.com/ui/apps/dynatrace.synthetic/monitor/HTTP_MONITOR-06513F5EBB018508?tf=now-2h%3Bnow"
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#38bdf8", textDecoration: "none", display: "flex", alignItems: "center", gap: "3px",
                  fontWeight: 600, fontSize: "10px"
                }}
              >
                Open in Dynatrace <OpenInNewIcon style={{ fontSize: "11px" }} />
              </a>
            </div>
          </div>

          {/* Dynatrace 4 Core Metric Tiles (Exact Layout as Dynatrace Console) */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
            {/* Tile 1: Last status */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <CheckCircleIcon style={{ fontSize: "15px", color: isOutage ? "#ef4444" : "#10b981" }} />
                <span style={{ fontSize: "10px", color: "#64748b" }}>Last status:</span>
                <strong style={{ fontSize: "11px", color: isOutage ? "#dc2626" : "#0f172a" }}>
                  {isOutage ? "Failure" : "Success"}
                </strong>
              </div>
              <div style={{ fontSize: "9px", color: isOutage ? "#b91c1c" : "#16a34a", marginTop: "4px" }}>
                {isOutage ? "HTTP 500 Threshold Trip" : "HTTP 200 Validated"}
              </div>
            </div>

            {/* Tile 2: Availability */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: isOutage ? "#ef4444" : "#10b981" }} />
                <span style={{ fontSize: "10px", color: "#64748b" }}>Availability:</span>
                <strong style={{ fontSize: "12px", color: isOutage ? "#dc2626" : "#0f172a" }}>
                  {isOutage ? "0%" : "100%"}
                </strong>
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "4px" }}>
                Last 2 hours window
              </div>
            </div>

            {/* Tile 3: Locations */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#3b82f6" }} />
                <span style={{ fontSize: "10px", color: "#64748b" }}>Locations:</span>
                <strong style={{ fontSize: "12px", color: "#0f172a" }}>1</strong>
              </div>
              <div style={{ fontSize: "9px", color: "#64748b", marginTop: "4px" }}>
                N. Virginia (AWS us-east-1)
              </div>
            </div>

            {/* Tile 4: Performance */}
            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "8px 10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <SpeedIcon style={{ fontSize: "14px", color: isOutage ? "#ef4444" : "#0284c7" }} />
                <span style={{ fontSize: "10px", color: "#64748b" }}>Performance:</span>
                <strong style={{ fontSize: "12px", color: isOutage ? "#dc2626" : "#0f172a" }}>
                  {syntheticLatency} ms
                </strong>
              </div>
              <div style={{ fontSize: "9px", color: isOutage ? "#b91c1c" : "#16a34a", marginTop: "4px" }}>
                {isOutage ? "▲ Degraded Response" : "● Nominal Baseline"}
              </div>
            </div>
          </div>

          {/* Dynatrace Action Chips */}
          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "9px", padding: "3px 8px", background: "#f1f5f9", borderRadius: "4px", color: "#334155", fontWeight: 600 }}>
              📊 Analyze executions
            </span>
            <span style={{ fontSize: "9px", padding: "3px 8px", background: "#f1f5f9", borderRadius: "4px", color: "#334155", fontWeight: 600 }}>
              ⚡ On-demand execution
            </span>
            <span style={{ fontSize: "9px", padding: "3px 8px", background: "#f1f5f9", borderRadius: "4px", color: "#334155", fontWeight: 600 }}>
              🔍 View traces
            </span>
          </div>

          {/* Execution Telemetry Breakdown */}
          <div style={{
            flex: 1, background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px",
            padding: "10px", display: "flex", flexDirection: "column", gap: "6px"
          }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155", display: "flex", justifyContent: "space-between" }}>
              <span>Synthetic Execution Telemetry</span>
              <span style={{ fontSize: "9px", color: "#64748b", fontWeight: 500 }}>Probe: 1 min cadence</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", padding: "4px 6px", background: "#ffffff", borderRadius: "4px", border: "1px solid #edf2f7" }}>
              <span style={{ color: "#64748b" }}>Vantage Location</span>
              <strong style={{ color: "#0f172a" }}>N. Virginia (AWS us-east-1)</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", padding: "4px 6px", background: "#ffffff", borderRadius: "4px", border: "1px solid #edf2f7" }}>
              <span style={{ color: "#64748b" }}>Target Application</span>
              <code style={{ fontSize: "9px", color: "#0284c7" }}>claims-portal (http://localhost:5173)</code>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", padding: "4px 6px", background: "#ffffff", borderRadius: "4px", border: "1px solid #edf2f7" }}>
              <span style={{ color: "#64748b" }}>DNS Lookup + TCP Handshake</span>
              <strong style={{ color: "#16a34a" }}>38 ms</strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", padding: "4px 6px", background: "#ffffff", borderRadius: "4px", border: "1px solid #edf2f7" }}>
              <span style={{ color: "#64748b" }}>Server Response Time (TTFB)</span>
              <strong style={{ color: isOutage ? "#dc2626" : "#16a34a" }}>
                {isOutage ? "5,172 ms" : "319 ms"}
              </strong>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", padding: "4px 6px", background: "#ffffff", borderRadius: "4px", border: "1px solid #edf2f7" }}>
              <span style={{ color: "#64748b" }}>SSL / TLS Security</span>
              <span style={{ color: "#16a34a", fontWeight: 600 }}>TLS 1.3 Active (Valid)</span>
            </div>
          </div>
        </div>

        {/* COLUMN 2: APM MICROSERVICES HEALTH */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <StorageIcon style={{ color: "#6366f1", fontSize: "20px" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Dynatrace OneAgent APM Services</span>
            </div>
            <span style={{ fontSize: "11px", color: "#64748b" }}>
              {services.filter(s => s.status === "HEALTHY").length}/{services.length} Healthy
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1, overflowY: "auto" }}>
            {services.map((svc) => {
              const isCrit = svc.status === "CRITICAL";
              const isDeg = svc.status === "DEGRADED";
              const statusColor = isCrit ? "#ef4444" : isDeg ? "#f59e0b" : "#10b981";
              const statusBg = isCrit ? "#fee2e2" : isDeg ? "#fef3c7" : "#dcfce7";

              return (
                <div key={svc.id} style={{
                  background: isCrit ? "#fff1f2" : isDeg ? "#fffbeb" : "#f8fafc",
                  border: `1px solid ${isCrit ? "#fecdd3" : isDeg ? "#fde68a" : "#e2e8f0"}`,
                  borderRadius: "8px",
                  padding: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <code style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a" }}>{svc.name}</code>
                      <span style={{ fontSize: "9px", background: "#e2e8f0", color: "#475569", padding: "1px 5px", borderRadius: "4px" }}>
                        {svc.tier}
                      </span>
                    </div>
                    <span style={{
                      fontSize: "9px",
                      fontWeight: 800,
                      padding: "2px 8px",
                      borderRadius: "6px",
                      background: statusBg,
                      color: statusColor
                    }}>
                      {svc.status}
                    </span>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "10px", color: "#64748b" }}>
                    <span>Service ID: <strong>{svc.id}</strong></span>
                    <span>Depends on: <strong>{svc.depends_on || "None (Root DB)"}</strong></span>
                  </div>

                  <div style={{ display: "flex", gap: "14px", fontSize: "10px", color: "#475569", marginTop: "2px", borderTop: "1px dashed #e2e8f0", paddingTop: "4px" }}>
                    <span>Response: <strong style={{ color: isCrit ? "#dc2626" : "#0f172a" }}>{isCrit ? "4,820ms" : isDeg ? "1,240ms" : "42ms"}</strong></span>
                    <span>Error Rate: <strong style={{ color: isCrit ? "#dc2626" : "#0f172a" }}>{isCrit ? "22.4%" : isDeg ? "8.1%" : "0.01%"}</strong></span>
                    <span>Host: <strong>AWS us-east-1</strong></span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMN 3: DAVIS AI ANOMALIES & INCIDENT ALERTS */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "10px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <AutoAwesomeIcon style={{ color: "#a855f7", fontSize: "20px" }} />
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>Davis AI Problem Stream</span>
            </div>
            <span style={{
              fontSize: "10px",
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: "4px",
              background: isOutage ? "#fee2e2" : "#f1f5f9",
              color: isOutage ? "#b91c1c" : "#64748b"
            }}>
              {isOutage ? "1 ACTIVE PROBLEM" : "0 PROBLEMS"}
            </span>
          </div>

          {/* Davis Problem Card */}
          {isOutage ? (
            <div style={{
              background: "#faf5ff",
              border: "1px solid #e9d5ff",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "6px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontWeight: 700, color: "#6b21a8" }}>
                <span>Problem P-24091</span>
                <span style={{ color: "#ef4444" }}>CRITICAL</span>
              </div>
              <div style={{ fontSize: "11px", color: "#3b0764", fontWeight: 600 }}>
                Response time degradation & connection pool exhaustion on {criticalService?.id || "claims-database"}
              </div>
              <div style={{ fontSize: "10px", color: "#6b21a8", marginTop: "4px" }}>
                Root cause verified by Dynatrace Smartscape dependency graph. Correlated into NEXUS incident management.
              </div>
            </div>
          ) : (
            <div style={{
              background: "#f0fdf4",
              border: "1px solid #bbf7d0",
              borderRadius: "8px",
              padding: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <CheckCircleIcon style={{ color: "#16a34a", fontSize: "18px" }} />
              <span style={{ fontSize: "11px", color: "#15803d", fontWeight: 600 }}>
                Davis AI has verified all topological components are healthy.
              </span>
            </div>
          )}

          {/* Raw Dynatrace Ingest Events */}
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px", overflowY: "auto" }}>
            <div style={{ fontSize: "11px", fontWeight: 700, color: "#334155", marginBottom: "2px" }}>
              Recent Ingestion Telemetry Stream ({rawAlerts.length})
            </div>
            {rawAlerts.slice(0, 6).map((al, idx) => (
              <div key={idx} style={{
                background: "#f8fafc",
                borderLeft: al.severity === "CRITICAL" ? "3px solid #ef4444" : "3px solid #f59e0b",
                padding: "6px 8px",
                borderRadius: "0 4px 4px 0",
                fontSize: "10px"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", color: "#0f172a", fontWeight: 600 }}>
                  <span>{al.source || "Dynatrace"} • {al.service_id}</span>
                  <span style={{ color: al.severity === "CRITICAL" ? "#ef4444" : "#d97706", fontSize: "9px" }}>{al.severity}</span>
                </div>
                <div style={{ color: "#64748b", marginTop: "2px" }}>{al.message}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
