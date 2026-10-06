import React, { useState } from "react";
import { Service, RawEvent } from "../types";
import { PageHeader } from "../components/PageHeader";
import LanguageIcon from "@mui/icons-material/Language";
import SpeedIcon from "@mui/icons-material/Speed";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import MemoryIcon from "@mui/icons-material/Memory";
import HubIcon from "@mui/icons-material/Hub";

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
  const syntheticLatency = isOutage ? 5240 : 357;
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [executingProbe, setExecutingProbe] = useState(false);
  const [probeSuccessMessage, setProbeSuccessMessage] = useState<string | null>(null);

  const handleRunProbe = () => {
    setExecutingProbe(true);
    setProbeSuccessMessage(null);
    setTimeout(() => {
      setExecutingProbe(false);
      setProbeSuccessMessage("Probe executed successfully: HTTP 200 OK (342ms) from AWS us-east-1");
      setTimeout(() => setProbeSuccessMessage(null), 4000);
    }, 1200);
  };

  const filteredAlerts = rawAlerts.filter(a => {
    if (filterSeverity === "ALL") return true;
    return a.severity === filterSeverity;
  });

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
        title="Dynatrace APM & Synthetic Monitoring"
        subtitle="Continuous end-user synthetic availability, OneAgent distributed tracing, and Davis AI anomaly detection."
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        badge="ONEAGENT LIVE"
      />

      {/* 4 Top APM Metric KPI Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        {/* Synthetic Health */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              SYNTHETIC MONITORING
            </span>
            <LanguageIcon style={{ fontSize: "18px", color: isOutage ? "#dc2626" : "#0284c7" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: isOutage ? "#dc2626" : "#0f172a", lineHeight: "1.1" }}>
            {isOutage ? "0% (Failing)" : "100% Online"}
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Latency: <strong>{syntheticLatency}ms</strong> • AWS us-east-1
          </div>
        </div>

        {/* APM OneAgent Coverage */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ONEAGENT APM COVERAGE
            </span>
            <MemoryIcon style={{ fontSize: "18px", color: "#16a34a" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: "1.1" }}>
            {services.length}/{services.length} Active
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            100% Microservices Instrumented
          </div>
        </div>

        {/* Ingestion & Error Rate */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              TRANSACTION FLOW
            </span>
            <SpeedIcon style={{ fontSize: "18px", color: "#8b5cf6" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: "1.1" }}>
            1,240 req/min
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Error Rate: <strong>{isOutage ? "14.2%" : "0.01%"}</strong>
          </div>
        </div>

        {/* Davis AI Anomaly Engine */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              DAVIS AI PROBLEM ENGINE
            </span>
            <HubIcon style={{ fontSize: "18px", color: isOutage ? "#dc2626" : "#10b981" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: isOutage ? "#dc2626" : "#16a34a", lineHeight: "1.1" }}>
            {isOutage ? "1 Problem" : "0 Problems"}
          </div>
          <div style={{ fontSize: "11px", color: isOutage ? "#dc2626" : "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            {isOutage ? "Root Cause: claims-database" : "Topological Baseline Clean"}
          </div>
        </div>
      </div>

      {/* Main 2-Column Responsive Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1.3fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Left Column: Synthetic End-User Journey + OneAgent Services */}
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* Synthetic Monitor Card */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <LanguageIcon style={{ color: "#0284c7", fontSize: "20px" }} />
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Dynatrace Synthetic Monitor</div>
                  <div style={{ fontSize: "11px", color: "#64748b" }}>Automated browser-click probe executed every 60s</div>
                </div>
              </div>
              <span style={{
                fontSize: "11px",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "16px",
                background: isOutage ? "#fee2e2" : "#dcfce7",
                color: isOutage ? "#b91c1c" : "#15803d",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}>
                <span className={isOutage ? "beacon-critical" : "beacon-live"} />
                {isOutage ? "PROBE FAILING (HTTP 500)" : "ONLINE (100% HEALTHY)"}
              </span>
            </div>

            {/* Dark Terminal / Identity Preview */}
            <div style={{
              background: "#0f172a",
              borderRadius: "8px",
              padding: "16px",
              color: "#f8fafc",
              border: "1px solid #334155",
              marginBottom: "16px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  Synthetic Monitor Target: <strong style={{ color: "#38bdf8" }}>NEXUS POC - Claims Portal</strong>
                </span>
                <span style={{ fontSize: "10px", color: "#64748b" }}>ID: HTTP_MONITOR-06513F5EB8018508</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <span style={{ fontSize: "16px", fontWeight: 800, color: "#ffffff" }}>Farmers Intelligent Quoting Hub</span>
                <a
                  href="https://intelligent-quote-engine.replit.app/"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: "#38bdf8", display: "inline-flex", alignItems: "center", gap: "2px", fontSize: "11px", textDecoration: "none" }}
                >
                  <OpenInNewIcon style={{ fontSize: "14px" }} />
                </a>
              </div>

              {/* Probe Stages Bar */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>DNS LOOKUP</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>12ms</div>
                </div>
                <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>TCP CONNECT</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>28ms</div>
                </div>
                <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>SSL / TLS</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>44ms</div>
                </div>
                <div style={{ background: "#1e293b", padding: "8px 10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "9px", color: "#94a3b8" }}>TOTAL TIME</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: isOutage ? "#f87171" : "#4ade80" }}>
                    {syntheticLatency}ms
                  </div>
                </div>
              </div>
            </div>

            {probeSuccessMessage && (
              <div style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534",
                borderRadius: "6px", padding: "8px 12px", fontSize: "11px", fontWeight: 600,
                marginBottom: "14px"
              }}>
                ✓ {probeSuccessMessage}
              </div>
            )}

            {/* Actions Toolbar */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button
                onClick={handleRunProbe}
                disabled={executingProbe}
                className="btn-tactile btn-tactile-primary"
                style={{ padding: "8px 14px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <PlayArrowIcon style={{ fontSize: "15px" }} />
                <span>{executingProbe ? "Executing Synthetic Probe..." : "Run On-Demand Synthetic Execution"}</span>
              </button>

              <a
                href="https://intelligent-quote-engine.replit.app/"
                target="_blank"
                rel="noreferrer"
                className="btn-tactile btn-tactile-secondary"
                style={{ padding: "8px 14px", fontSize: "11px", display: "flex", alignItems: "center", gap: "6px", textDecoration: "none" }}
              >
                <OpenInNewIcon style={{ fontSize: "14px" }} />
                <span>Open Quoting Engine</span>
              </a>
            </div>
          </div>

          {/* OneAgent Microservices Grid */}
          <div style={{
            background: "#ffffff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Dynatrace OneAgent APM Services</div>
                <div style={{ fontSize: "11px", color: "#64748b" }}>Real-time process response times, thread pools, and health metrics</div>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", background: "#f0fdf4", padding: "3px 8px", borderRadius: "6px", border: "1px solid #bbf7d0" }}>
                4/4 Healthy Topology
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
              {services.map((s) => {
                const isCrit = s.status === "CRITICAL";
                const isDeg = s.status === "DEGRADED";
                return (
                  <div
                    key={s.id}
                    style={{
                      background: isCrit ? "#fff1f2" : isDeg ? "#fffbeb" : "#f8fafc",
                      border: `1px solid ${isCrit ? "#fecdd3" : isDeg ? "#fde68a" : "#e2e8f0"}`,
                      borderRadius: "8px",
                      padding: "14px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>{s.name}</div>
                        <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>
                          Tier {s.tier} • depends on: <code>{s.depends_on || "None"}</code>
                        </div>
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

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#475569", paddingTop: "8px", borderTop: "1px solid rgba(0,0,0,0.05)" }}>
                      <span>Latency: <strong>{isCrit ? "5,200ms" : isDeg ? "420ms" : "28ms"}</strong></span>
                      <span>Host: <strong>AWS us-east-1</strong></span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Davis AI Ingestion Feed */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>Davis AI Problem & Alert Stream</div>
              <div style={{ fontSize: "11px", color: "#64748b" }}>Live ingestion telemetry stream ({rawAlerts.length} events)</div>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              {["ALL", "CRITICAL", "ERROR", "WARNING"].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setFilterSeverity(sev)}
                  style={{
                    border: "none",
                    borderRadius: "4px",
                    padding: "3px 8px",
                    fontSize: "10px",
                    fontWeight: 700,
                    cursor: "pointer",
                    background: filterSeverity === sev ? "#0f172a" : "#f1f5f9",
                    color: filterSeverity === sev ? "#ffffff" : "#475569"
                  }}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>

          {/* Clean Scrollable Feed */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxHeight: "680px", overflowY: "auto" }}>
            {filteredAlerts.slice(0, 15).map((a, idx) => {
              const isCrit = a.severity === "CRITICAL";
              const isErr = a.severity === "ERROR";
              return (
                <div
                  key={idx}
                  style={{
                    background: isCrit ? "#fff1f2" : isErr ? "#fffbeb" : "#f8fafc",
                    borderLeft: `4px solid ${isCrit ? "#ef4444" : isErr ? "#f59e0b" : "#3b82f6"}`,
                    borderTop: "1px solid #e2e8f0",
                    borderRight: "1px solid #e2e8f0",
                    borderBottom: "1px solid #e2e8f0",
                    borderRadius: "0 6px 6px 0",
                    padding: "10px 12px",
                    fontSize: "11px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{
                        fontSize: "9px",
                        fontWeight: 800,
                        padding: "1px 5px",
                        borderRadius: "3px",
                        background: isCrit ? "#fee2e2" : isErr ? "#fef3c7" : "#dbeafe",
                        color: isCrit ? "#991b1b" : isErr ? "#92400e" : "#1e40af"
                      }}>
                        {a.severity}
                      </span>
                      <strong style={{ color: "#0f172a" }}>{a.service_id}</strong>
                    </div>
                    <span style={{ fontSize: "10px", color: "#64748b" }}>
                      {new Date(a.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div style={{ color: "#334155", lineHeight: 1.4 }}>
                    {a.message}
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
