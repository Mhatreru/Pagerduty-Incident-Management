import React, { useState, useMemo } from "react";
import { SimulationBar } from "../components/SimulationBar";
import { RawEvent, SuppressionRule } from "../types";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

interface LiveOperationsPageProps {
  alerts: RawEvent[];
  suppressionRules: SuppressionRule[];
  currentRole: string;
  onRoleChange: (role: string) => void;
  onTriggerCascade: () => Promise<void>;
  onRunHealing: () => Promise<void>;
  onInjectLatency: () => Promise<void>;
  onInjectDowntime: () => Promise<void>;
  onSimulatePDAck: () => Promise<void>;
  onSimulatePDResolved: () => Promise<void>;
  onAddSuppressionRule: (field: string, pattern: string, reason: string) => Promise<void>;
  onRemoveSuppressionRule: (id: number) => Promise<void>;
  demoStatus?: { database_latency_active: boolean; service_failure_active: boolean; offline?: boolean };
}

export const LiveOperationsPage: React.FC<LiveOperationsPageProps> = ({
  alerts,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("ALL");
  const [selectedService, setSelectedService] = useState<string>("ALL");
  const [selectedSource, setSelectedSource] = useState<string>("ALL");
  const [timeRange, setTimeRange] = useState<string>("1h");

  // Distinct services and sources
  const services = useMemo(() => Array.from(new Set(alerts.map(a => a.service_id))), [alerts]);
  const sources = useMemo(() => Array.from(new Set(alerts.map(a => a.source))), [alerts]);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSearch =
      a.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.service_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.source.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = selectedSeverity === "ALL" || a.severity.toUpperCase() === selectedSeverity;
    const matchesService = selectedService === "ALL" || a.service_id === selectedService;
    const matchesSource = selectedSource === "ALL" || a.source === selectedSource;
    return matchesSearch && matchesSeverity && matchesService && matchesSource;
  });

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif", maxHeight: "100vh", overflow: "hidden" }}>
      {/* Header matching Mockup #2 */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 4px 8px", borderBottom: "1px solid #e2e8f0", marginBottom: "8px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
            Live Operations
          </h1>
          <span style={{
            background: "#dcfce7", color: "#15803d", fontSize: "10px", fontWeight: 700,
            padding: "2px 8px", borderRadius: "12px", display: "flex", alignItems: "center", gap: "4px"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e" }}></span>
            Live
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

      {/* Compact Simulation Bar */}
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

      {/* Filter Toolbar (Mockup #2) */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap",
        background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px",
        padding: "8px 12px", marginBottom: "8px", gap: "8px"
      }}>
        {/* Severity Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {[
            { label: "All", value: "ALL", color: "#64748b" },
            { label: "Critical", value: "CRITICAL", color: "#ef4444" },
            { label: "Error", value: "ERROR", color: "#f97316" },
            { label: "Warning", value: "WARNING", color: "#eab308" },
            { label: "Info", value: "INFO", color: "#3b82f6" }
          ].map((sev) => {
            const isSelected = selectedSeverity === sev.value;
            return (
              <button
                key={sev.value}
                onClick={() => setSelectedSeverity(sev.value)}
                style={{
                  background: isSelected ? (sev.value === "ALL" ? "#334155" : sev.color) : "#1e293b",
                  color: "#fff", border: "1px solid",
                  borderColor: isSelected ? "transparent" : "#334155",
                  borderRadius: "14px", padding: "3px 10px", fontSize: "10px", fontWeight: 700,
                  cursor: "pointer", display: "flex", alignItems: "center", gap: "5px"
                }}
              >
                {sev.value !== "ALL" && (
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: isSelected ? "#fff" : sev.color }}></span>
                )}
                {sev.label}
              </button>
            );
          })}
        </div>

        {/* Dropdowns & Search Input */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          {/* Services dropdown */}
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            style={{
              background: "#1e293b", color: "#cbd5e1", border: "1px solid #334155",
              borderRadius: "6px", padding: "4px 8px", fontSize: "10px", fontWeight: 600, outline: "none"
            }}
          >
            <option value="ALL">All Services</option>
            {services.map(s => <option key={s} value={s}>{s}</option>)}
          </select>

          {/* Sources dropdown */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            style={{
              background: "#1e293b", color: "#cbd5e1", border: "1px solid #334155",
              borderRadius: "6px", padding: "4px 8px", fontSize: "10px", fontWeight: 600, outline: "none"
            }}
          >
            <option value="ALL">All Sources</option>
            {sources.map(src => <option key={src} value={src}>{src}</option>)}
            <option value="Dynatrace">Dynatrace</option>
            <option value="CloudWatch">CloudWatch</option>
            <option value="Kubernetes">Kubernetes</option>
          </select>

          {/* Time range dropdown */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              background: "#1e293b", color: "#cbd5e1", border: "1px solid #334155",
              borderRadius: "6px", padding: "4px 8px", fontSize: "10px", fontWeight: 600, outline: "none"
            }}
          >
            <option value="15m">Last 15 mins</option>
            <option value="1h">Last 1 hour</option>
            <option value="24h">Last 24 hours</option>
          </select>

          {/* Search box */}
          <div style={{
            display: "flex", alignItems: "center", gap: "4px", background: "#1e293b",
            border: "1px solid #334155", borderRadius: "6px", padding: "2px 8px", width: "160px"
          }}>
            <SearchIcon style={{ color: "#94a3b8", fontSize: "14px" }} />
            <input
              type="text"
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: "100%", background: "transparent", border: "none", outline: "none",
                fontSize: "10px", color: "#f8fafc", fontFamily: "Inter, sans-serif"
              }}
            />
          </div>
        </div>
      </div>

      {/* Sleek Dark Event Feed Table (Mockup #2) */}
      <div style={{
        background: "#0b1329", border: "1px solid #1e293b", borderRadius: "8px",
        height: "calc(100vh - 225px)", display: "flex", flexDirection: "column", overflow: "hidden"
      }}>
        <div style={{ flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", color: "#e2e8f0" }}>
            <thead>
              <tr style={{ background: "#0f172a", borderBottom: "1px solid #1e293b", color: "#94a3b8", textAlign: "left" }}>
                <th style={{ padding: "8px 12px", fontWeight: 600, width: "90px" }}>Time</th>
                <th style={{ padding: "8px 12px", fontWeight: 600 }}>Event</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, width: "160px" }}>Service</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, width: "110px" }}>Source</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, width: "90px" }}>Severity</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, width: "100px" }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: "center", padding: "50px 0", color: "#64748b" }}>
                    No alerts found. Systems are operating within baseline.
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alert, idx) => {
                  const dateObj = new Date(alert.timestamp);
                  const timeString = isNaN(dateObj.getTime())
                    ? `10:${32 - idx}:${(15 + idx * 7) % 60}`
                    : dateObj.toLocaleTimeString("en-US", { hour12: false });

                  // Source tag color
                  const sourceConfig: Record<string, { bg: string; color: string }> = {
                    dynatrace: { bg: "#1e3a8a", color: "#60a5fa" },
                    cloudwatch: { bg: "#7c2d12", color: "#fb923c" },
                    kubernetes: { bg: "#134e4a", color: "#2dd4bf" },
                    prometheus: { bg: "#831843", color: "#f472b6" }
                  };
                  const srcStyle = sourceConfig[alert.source.toLowerCase()] || { bg: "#1e293b", color: "#94a3b8" };

                  // Severity badge style
                  const sev = alert.severity.toUpperCase();
                  const sevStyle = {
                    CRITICAL: { bg: "#7f1d1d", color: "#f87171", border: "#ef4444" },
                    ERROR: { bg: "#7c2d12", color: "#fb923c", border: "#f97316" },
                    WARNING: { bg: "#713f12", color: "#fde047", border: "#eab308" },
                    INFO: { bg: "#1e3a8a", color: "#93c5fd", border: "#3b82f6" }
                  }[sev] || { bg: "#1e293b", color: "#94a3b8", border: "#64748b" };

                  // Status badge style
                  const isResolved = alert.is_suppressed || alert.message.toLowerCase().includes("resolved");
                  const statusStyle = isResolved
                    ? { bg: "#064e3b", color: "#34d399", border: "#059669", label: "Resolved" }
                    : { bg: "#312e81", color: "#a5b4fc", border: "#6366f1", label: "Correlated" };

                  return (
                    <tr
                      key={alert.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                        transition: "background 0.1s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = idx % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent")}
                    >
                      {/* Time */}
                      <td style={{ padding: "8px 12px", color: "#94a3b8", fontSize: "10px", whiteSpace: "nowrap" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <AccessTimeIcon style={{ fontSize: "11px", color: "#64748b" }} />
                          <span>{timeString}</span>
                        </div>
                      </td>

                      {/* Event */}
                      <td style={{ padding: "8px 12px", fontWeight: 500, color: "#f1f5f9" }}>
                        {alert.message}
                      </td>

                      {/* Service */}
                      <td style={{ padding: "8px 12px", color: "#38bdf8", fontWeight: 600, fontSize: "10px" }}>
                        <code>{alert.service_id}</code>
                      </td>

                      {/* Source */}
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          background: srcStyle.bg, color: srcStyle.color,
                          fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "4px"
                        }}>
                          {alert.source}
                        </span>
                      </td>

                      {/* Severity */}
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          background: sevStyle.bg, color: sevStyle.color, border: `1px solid ${sevStyle.border}`,
                          fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px"
                        }}>
                          {alert.severity}
                        </span>
                      </td>

                      {/* Status */}
                      <td style={{ padding: "8px 12px" }}>
                        <span style={{
                          background: statusStyle.bg, color: statusStyle.color, border: `1px solid ${statusStyle.border}`,
                          fontSize: "9px", fontWeight: 700, padding: "2px 8px", borderRadius: "10px"
                        }}>
                          {statusStyle.label}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
