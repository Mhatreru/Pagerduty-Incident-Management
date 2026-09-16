import React, { useState } from "react";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import BugReportIcon from "@mui/icons-material/BugReport";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";

interface SimulationBarProps {
  currentRole: string;
  onTriggerCascade: () => Promise<void>;
  onRunHealing: () => Promise<void>;
  onInjectLatency: () => Promise<void>;
  onInjectDowntime: () => Promise<void>;
  onSimulatePDAck: () => Promise<void>;
  onSimulatePDResolved: () => Promise<void>;
  demoStatus?: { database_latency_active: boolean; service_failure_active: boolean; offline?: boolean };
}

export const SimulationBar: React.FC<SimulationBarProps> = ({
  currentRole,
  onTriggerCascade,
  onRunHealing,
  onInjectLatency,
  onInjectDowntime,
  onSimulatePDAck,
  onSimulatePDResolved,
  demoStatus
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isViewer = currentRole === "VIEWER";

  return (
    <div style={{
      background: "#0f172a",
      borderRadius: "8px",
      border: "1px solid #334155",
      marginBottom: "12px",
      padding: "6px 12px",
      display: "flex",
      flexDirection: "column",
      gap: "6px"
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{
            background: "#4f46e5", color: "#fff", fontSize: "10px", fontWeight: 700,
            padding: "2px 6px", borderRadius: "4px", letterSpacing: "0.05em"
          }}>
            POC SIMULATOR
          </span>
          <span style={{ color: "#94a3b8", fontSize: "11px", fontWeight: 500 }}>
            Fault Injection & Webhook Pipeline Control
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <button
            onClick={onTriggerCascade}
            disabled={isViewer}
            style={{
              background: "#ef4444", color: "#fff", border: "none", borderRadius: "4px",
              padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: isViewer ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "4px", opacity: isViewer ? 0.6 : 1
            }}
            title="Injects DB connection pool exhaustion causing 5 cascading alerts that correlate into 1 incident"
          >
            <PlayArrowIcon style={{ fontSize: "13px" }} />
            Trigger Cascade (5 Alerts)
          </button>

          <button
            onClick={onRunHealing}
            disabled={isViewer}
            style={{
              background: "#10b981", color: "#fff", border: "none", borderRadius: "4px",
              padding: "4px 8px", fontSize: "11px", fontWeight: 600, cursor: isViewer ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "4px", opacity: isViewer ? 0.6 : 1
            }}
          >
            <RestartAltIcon style={{ fontSize: "13px" }} />
            Auto-Recover All
          </button>

          <button
            onClick={() => setIsOpen(!isOpen)}
            style={{
              background: "#1e293b", color: "#94a3b8", border: "1px solid #334155", borderRadius: "4px",
              padding: "3px 6px", fontSize: "11px", cursor: "pointer", display: "flex", alignItems: "center"
            }}
          >
            {isOpen ? <ExpandLessIcon style={{ fontSize: "14px" }} /> : <ExpandMoreIcon style={{ fontSize: "14px" }} />}
          </button>
        </div>
      </div>

      {isOpen && (
        <div style={{
          display: "flex", alignItems: "center", gap: "8px", paddingTop: "6px",
          borderTop: "1px solid #1e293b", flexWrap: "wrap"
        }}>
          <span style={{ color: "#64748b", fontSize: "10px", fontWeight: 600 }}>DEMO APP (PORT 9090):</span>
          <button
            onClick={onInjectLatency}
            disabled={isViewer}
            style={{
              background: demoStatus?.database_latency_active ? "#f59e0b" : "#334155",
              color: "#fff", border: "none", borderRadius: "4px", padding: "3px 8px",
              fontSize: "10px", fontWeight: 600, cursor: isViewer ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "3px"
            }}
          >
            <FlashOnIcon style={{ fontSize: "12px" }} />
            {demoStatus?.database_latency_active ? "Latency: ACTIVE" : "Inject DB Latency"}
          </button>

          <button
            onClick={onInjectDowntime}
            disabled={isViewer}
            style={{
              background: demoStatus?.service_failure_active ? "#ef4444" : "#334155",
              color: "#fff", border: "none", borderRadius: "4px", padding: "3px 8px",
              fontSize: "10px", fontWeight: 600, cursor: isViewer ? "not-allowed" : "pointer",
              display: "flex", alignItems: "center", gap: "3px"
            }}
          >
            <BugReportIcon style={{ fontSize: "12px" }} />
            {demoStatus?.service_failure_active ? "Outage: ACTIVE" : "Inject Service Outage"}
          </button>

          <span style={{ color: "#64748b", fontSize: "10px", fontWeight: 600, marginLeft: "8px" }}>WEBHOOK EMULATOR:</span>
          <button
            onClick={onSimulatePDAck}
            style={{
              background: "#334155", color: "#38bdf8", border: "none", borderRadius: "4px",
              padding: "3px 8px", fontSize: "10px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "3px"
            }}
          >
            <DoneAllIcon style={{ fontSize: "12px" }} />
            Simulate PD Ack
          </button>

          <button
            onClick={onSimulatePDResolved}
            style={{
              background: "#334155", color: "#4ade80", border: "none", borderRadius: "4px",
              padding: "3px 8px", fontSize: "10px", fontWeight: 600, cursor: "pointer",
              display: "flex", alignItems: "center", gap: "3px"
            }}
          >
            <DoneAllIcon style={{ fontSize: "12px" }} />
            Simulate PD Resolve
          </button>
        </div>
      )}
    </div>
  );
};
