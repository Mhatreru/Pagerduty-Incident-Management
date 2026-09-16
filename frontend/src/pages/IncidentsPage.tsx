import React, { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { IncidentDetailModal } from "../components/IncidentDetailModal";
import { Incident } from "../types";
import PsychologyIcon from "@mui/icons-material/Psychology";

interface IncidentsPageProps {
  incidents: Incident[];
  currentRole: string;
  onRoleChange: (role: string) => void;
  onAcknowledgeIncident: (id: number) => Promise<void>;
  onResolveIncident: (id: number) => Promise<void>;
  onExecuteRunbook: (runbookId: string, incidentId: number, isDryRun: boolean) => Promise<any>;
}

export const IncidentsPage: React.FC<IncidentsPageProps> = ({
  incidents,
  currentRole,
  onRoleChange,
  onAcknowledgeIncident,
  onResolveIncident,
  onExecuteRunbook
}) => {
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null;
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");

  const filtered = incidents.filter((inc) => {
    const matchStatus = statusFilter === "ALL" || (statusFilter === "OPEN" ? inc.status !== "RESOLVED" : inc.status === statusFilter);
    const matchPriority = priorityFilter === "ALL" || (inc.priority || "P2") === priorityFilter;
    return matchStatus && matchPriority;
  });

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif", maxHeight: "100vh", overflow: "hidden" }}>
      <PageHeader
        title="Incident Intelligence & Major Incident War Room"
        subtitle="DYNAMIC PRIORITIZATION (P1–P4) • ROOT CAUSE ANALYSIS • PAGERDUTY & SERVICENOW SYNCHRONIZATION"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      {/* Filter Toolbar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
        padding: "8px 12px", marginBottom: "10px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 700 }}>STATUS:</span>
          {["ALL", "OPEN", "TRIGGERED", "ACKNOWLEDGED", "RESOLVED"].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              style={{
                background: statusFilter === st ? "#4f46e5" : "#f1f5f9",
                color: statusFilter === st ? "#fff" : "#475569",
                border: "none", borderRadius: "4px", padding: "2px 7px", fontSize: "10px",
                fontWeight: 700, cursor: "pointer"
              }}
            >
              {st}
            </button>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "10px", color: "#64748b", fontWeight: 700 }}>PRIORITY:</span>
          {["ALL", "P1", "P2", "P3", "P4"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                background: priorityFilter === p ? "#0f172a" : "#f1f5f9",
                color: priorityFilter === p ? "#fff" : "#475569",
                border: "none", borderRadius: "4px", padding: "2px 7px", fontSize: "10px",
                fontWeight: 700, cursor: "pointer"
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main High-Density Table - Viewport Fit */}
      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
        height: "calc(100vh - 200px)", overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        <div style={{
          padding: "8px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
            Correlated Incidents Queue ({filtered.length})
          </span>
          <span style={{ fontSize: "10px", color: "#64748b" }}>
            Click an incident row to launch Gemini AI Copilot & Runbook Execution
          </span>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px" }}>
          {filtered.length === 0 ? (
            <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", padding: "60px 0" }}>
              No incidents match the active filters.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#475569", textAlign: "left" }}>
                  <th style={{ padding: "8px", fontWeight: 600 }}>Priority</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>ID</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>Primary Service</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>Root Cause Candidate</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>Summary</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>AI Confidence</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>External Sync</th>
                  <th style={{ padding: "8px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "8px", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((inc) => {
                  const priorityColor = {
                    P1: "#ef4444", P2: "#f59e0b", P3: "#3b82f6", P4: "#10b981"
                  }[inc.priority || "P2"];

                  return (
                    <tr
                      key={inc.id}
                      onClick={() => setSelectedIncidentId(inc.id)}
                      style={{
                        borderBottom: "1px solid #f1f5f9", cursor: "pointer", transition: "background 0.1s"
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                    >
                      <td style={{ padding: "8px" }}>
                        <span style={{
                          background: priorityColor, color: "#fff", fontSize: "9px", fontWeight: 700,
                          padding: "2px 6px", borderRadius: "3px"
                        }}>
                          {inc.priority || "P2"}
                        </span>
                      </td>
                      <td style={{ padding: "8px", fontWeight: 700, color: "#0f172a" }}>
                        #{inc.id}
                      </td>
                      <td style={{ padding: "8px", fontWeight: 600, color: "#334155" }}>
                        {inc.primary_service_id}
                      </td>
                      <td style={{ padding: "8px", color: "#64748b" }}>
                        <code>{inc.root_cause_service_id || inc.primary_service_id}</code>
                      </td>
                      <td style={{ padding: "8px", color: "#334155", maxWidth: "240px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {inc.summary}
                      </td>
                      <td style={{ padding: "8px" }}>
                        <span style={{ color: "#16a34a", fontWeight: 700 }}>
                          {inc.ai_confidence || 94}%
                        </span>
                      </td>
                      <td style={{ padding: "8px", color: "#64748b", fontSize: "10px" }}>
                        PD: {inc.pagerduty_id ? "Synced" : "—"} | SNOW: {inc.servicenow_id ? "Synced" : "—"}
                      </td>
                      <td style={{ padding: "8px" }}>
                        <span style={{
                          background: inc.status === "RESOLVED" ? "#ecfdf5" : inc.status === "ACKNOWLEDGED" ? "#fef3c7" : "#fee2e2",
                          color: inc.status === "RESOLVED" ? "#059669" : inc.status === "ACKNOWLEDGED" ? "#d97706" : "#dc2626",
                          fontSize: "9px", fontWeight: 700, padding: "2px 6px", borderRadius: "3px"
                        }}>
                          {inc.status}
                        </span>
                      </td>
                      <td style={{ padding: "8px", textAlign: "right" }}>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedIncidentId(inc.id);
                          }}
                          className="btn-tactile btn-tactile-primary"
                          style={{
                            padding: "4px 10px", fontSize: "10px"
                          }}
                        >
                          <PsychologyIcon style={{ fontSize: "13px" }} />
                          War Room
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* War Room & Copilot Modal */}
      <IncidentDetailModal
        incident={selectedIncident}
        onClose={() => setSelectedIncidentId(null)}
        currentRole={currentRole}
        onAcknowledge={onAcknowledgeIncident}
        onResolve={onResolveIncident}
        onExecuteRunbook={onExecuteRunbook}
      />
    </div>
  );
};
