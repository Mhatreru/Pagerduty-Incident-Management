import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "../components/PageHeader";
import { PathwayStepper } from "../components/PathwayStepper";
import { IncidentDetailModal } from "../components/IncidentDetailModal";
import { Incident } from "../types";
import PsychologyIcon from "@mui/icons-material/Psychology";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import VideocamIcon from "@mui/icons-material/Videocam";
import SyncAltIcon from "@mui/icons-material/SyncAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

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
  const navigate = useNavigate();
  const [selectedIncidentId, setSelectedIncidentId] = useState<number | null>(null);
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null;
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activeCount = incidents.filter(i => i.status !== "RESOLVED").length;
  const resolvedCount = incidents.filter(i => i.status === "RESOLVED").length;
  const p1Count = incidents.filter(i => (i.priority || "P1") === "P1").length;

  const filtered = incidents.filter((inc) => {
    const matchStatus = statusFilter === "ALL" || (statusFilter === "OPEN" ? inc.status !== "RESOLVED" : inc.status === statusFilter);
    const matchPriority = priorityFilter === "ALL" || (inc.priority || "P2") === priorityFilter;
    const matchSearch = searchQuery === "" ||
      inc.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inc.primary_service_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(inc.id).includes(searchQuery);
    return matchStatus && matchPriority && matchSearch;
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
        title="Step 3: War Room & Automated Remediation"
        subtitle="Gemini AI root-cause diagnostics, automated runbooks execution, and bi-directional incident recovery."
        currentRole={currentRole}
        onRoleChange={onRoleChange}
        badge="WAR ROOM ACTIVE"
      />

      {/* Guided Pathway Stepper */}
      <PathwayStepper activeIncidentCount={activeCount} />

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
          onClick={() => navigate("/incident-response")}
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
          <span>Back: Step 2 On-Call Triage</span>
        </button>

        <div style={{ fontSize: "13px", color: "#64748b", textAlign: "center" }}>
          {activeCount > 0 ? (
            <span>
              Click <strong>"View Diagnostic"</strong> on any incident to launch the Gemini Root-Cause Copilot and trigger Runbook fixes.
            </span>
          ) : (
            <span style={{ color: "#16a34a", fontWeight: 700 }}>
              ✔ All incidents resolved. Proceed to Step 4 to review postmortems and executive ROI.
            </span>
          )}
        </div>

        <button
          onClick={() => navigate("/reports")}
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
          <span>Next: Step 4 Postmortem & ROI</span>
          <ArrowForwardIcon style={{ fontSize: "16px" }} />
        </button>
      </div>

      {/* 4 Incident Intelligence Metric Cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
      }}>
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              CORRELATED INCIDENTS
            </span>
            <NotificationsActiveIcon style={{ fontSize: "18px", color: "#6366f1" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: "1.1" }}>
            {incidents.length} Records
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            Alert noise reduced by 96.2%
          </div>
        </div>

        <div style={{
          background: "#ffffff",
          border: `1px solid ${activeCount > 0 ? "#fecdd3" : "#e2e8f0"}`,
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          borderBottom: activeCount > 0 ? "3px solid #dc2626" : "1px solid #e2e8f0"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              ACTIVE P1 OPEN
            </span>
            <WarningAmberIcon style={{ fontSize: "18px", color: activeCount > 0 ? "#dc2626" : "#64748b" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: activeCount > 0 ? "#dc2626" : "#0f172a", lineHeight: "1.1" }}>
            {activeCount} Active
          </div>
          <div style={{ fontSize: "11px", color: activeCount > 0 ? "#dc2626" : "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            {activeCount > 0 ? "Major War Room Active" : `${p1Count} Historical P1s Contained`}
          </div>
        </div>

        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              GEMINI AI CONFIDENCE
            </span>
            <PsychologyIcon style={{ fontSize: "18px", color: "#9333ea" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#9333ea", lineHeight: "1.1" }}>
            94% Avg
          </div>
          <div style={{ fontSize: "11px", color: "#16a34a", marginTop: "4px", fontWeight: 600 }}>
            Verified Root Cause Diagnostics
          </div>
        </div>

        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "16px 18px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              BI-DIRECTIONAL SYNC
            </span>
            <SyncAltIcon style={{ fontSize: "18px", color: "#0284c7" }} />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 800, color: "#0f172a", lineHeight: "1.1" }}>
            100% Synced
          </div>
          <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px" }}>
            PagerDuty & ServiceNow CMDB
          </div>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        padding: "14px 18px",
        marginBottom: "16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "12px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
      }}>
        {/* Search Input */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          background: "#f8fafc",
          border: "1px solid #cbd5e1",
          borderRadius: "6px",
          padding: "6px 12px",
          width: "360px"
        }}>
          <SearchIcon style={{ fontSize: "16px", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Search by ID, service, or summary..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              background: "transparent",
              fontSize: "12px",
              color: "#0f172a",
              outline: "none",
              width: "100%"
            }}
          />
        </div>

        {/* Status Pill Filters */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginRight: "4px" }}>STATUS:</span>
          {[
            { id: "ALL", label: `All (${incidents.length})` },
            { id: "OPEN", label: `Open (${activeCount})` },
            { id: "RESOLVED", label: `Resolved (${resolvedCount})` }
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "6px 12px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: statusFilter === st.id ? "#4f46e5" : "#f1f5f9",
                color: statusFilter === st.id ? "#ffffff" : "#475569",
                transition: "all 0.15s"
              }}
            >
              {st.label}
            </button>
          ))}
        </div>

        {/* Priority Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <span style={{ fontSize: "11px", fontWeight: 700, color: "#64748b", marginRight: "4px" }}>PRIORITY:</span>
          {["ALL", "P1", "P2", "P3"].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              style={{
                border: "none",
                borderRadius: "6px",
                padding: "5px 10px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: "pointer",
                background: priorityFilter === p ? "#0f172a" : "#f1f5f9",
                color: priorityFilter === p ? "#ffffff" : "#475569",
                transition: "all 0.15s"
              }}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Main Elevated Incident Queue Table */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        overflow: "hidden"
      }}>
        <div style={{ padding: "14px 20px", borderBottom: "1px solid #e2e8f0", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
              Correlated Incidents Queue ({filtered.length})
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
              Click any incident to open the Gemini AI Diagnostic War Room, automated Google Meet bridge, and remediation runbooks.
            </div>
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 700, fontSize: "11px", background: "#f8fafc" }}>
                <th style={{ padding: "12px 18px" }}>PRIORITY</th>
                <th style={{ padding: "12px 14px" }}>ID</th>
                <th style={{ padding: "12px 14px" }}>PRIMARY SERVICE</th>
                <th style={{ padding: "12px 14px" }}>INCIDENT SUMMARY</th>
                <th style={{ padding: "12px 14px" }}>AI ROOT CAUSE</th>
                <th style={{ padding: "12px 14px" }}>STATUS</th>
                <th style={{ padding: "12px 18px", textAlign: "right" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((inc) => {
                const isResolved = inc.status === "RESOLVED";
                const isAck = inc.status === "ACKNOWLEDGED";
                const isP1 = (inc.priority || "P1") === "P1";

                return (
                  <tr
                    key={inc.id}
                    onClick={() => setSelectedIncidentId(inc.id)}
                    style={{
                      borderBottom: "1px solid #f1f5f9",
                      cursor: "pointer",
                      transition: "background 0.12s"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#f8fafc")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "14px 18px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 800,
                        padding: "3px 8px",
                        borderRadius: "12px",
                        background: isP1 ? "#fee2e2" : "#fef3c7",
                        color: isP1 ? "#dc2626" : "#b45309"
                      }}>
                        {inc.priority || "P1"} Critical
                      </span>
                    </td>
                    <td style={{ padding: "14px 14px", fontWeight: 700, color: "#0f172a" }}>
                      #{inc.id}
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      <code style={{ background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px", fontSize: "11px", color: "#334155" }}>
                        {inc.primary_service_id}
                      </code>
                    </td>
                    <td style={{ padding: "14px 14px", fontWeight: 600, color: "#1e293b", maxWidth: "340px" }}>
                      {inc.summary}
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11px", color: "#6b21a8", fontWeight: 600 }}>Connection Pool Saturation</span>
                        <span style={{ fontSize: "9px", background: "#f3e8ff", color: "#7e22ce", padding: "1px 5px", borderRadius: "4px", fontWeight: 700 }}>
                          94% Conf.
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px 14px" }}>
                      <span style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: "12px",
                        background: isResolved ? "#dcfce7" : isAck ? "#fef3c7" : "#fee2e2",
                        color: isResolved ? "#15803d" : isAck ? "#b45309" : "#b91c1c"
                      }}>
                        {isResolved ? "Resolved" : isAck ? "Acknowledged" : "In Progress"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 18px", textAlign: "right" }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIncidentId(inc.id);
                        }}
                        className="btn-tactile btn-tactile-primary"
                        style={{ padding: "5px 12px", fontSize: "11px", display: "inline-flex", alignItems: "center", gap: "5px" }}
                      >
                        <VideocamIcon style={{ fontSize: "14px" }} />
                        <span>War Room</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Incident Detail Modal */}
      {selectedIncident && (
        <IncidentDetailModal
          incident={selectedIncident}
          onClose={() => setSelectedIncidentId(null)}
          currentRole={currentRole}
          onAcknowledge={onAcknowledgeIncident}
          onResolve={onResolveIncident}
          onExecuteRunbook={onExecuteRunbook}
        />
      )}
    </div>
  );
};
