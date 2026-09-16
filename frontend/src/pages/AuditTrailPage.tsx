import React, { useState } from "react";
import { PageHeader } from "../components/PageHeader";
import { AuditLog } from "../types";
import HistoryIcon from "@mui/icons-material/History";
import SearchIcon from "@mui/icons-material/Search";

interface AuditTrailPageProps {
  auditLogs: AuditLog[];
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const AuditTrailPage: React.FC<AuditTrailPageProps> = ({
  auditLogs,
  currentRole,
  onRoleChange
}) => {
  const [filter, setFilter] = useState("");

  const filtered = auditLogs.filter((log) => {
    return (
      log.action.toLowerCase().includes(filter.toLowerCase()) ||
      log.actor.toLowerCase().includes(filter.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(filter.toLowerCase()))
    );
  });

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif", maxHeight: "100vh", overflow: "hidden" }}>
      <PageHeader
        title="Immutable Audit Trail & Compliance Log"
        subtitle="END-TO-END MUTATION TIMELINE • SRE RUNBOOK AUDITING • EXTERNAL SYNC TRACKING"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{
        background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
        height: "calc(100vh - 145px)", overflow: "hidden", display: "flex", flexDirection: "column"
      }}>
        <div style={{
          padding: "10px 14px", borderBottom: "1px solid #e2e8f0", background: "#f8fafc",
          display: "flex", justifyContent: "space-between", alignItems: "center"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <HistoryIcon style={{ color: "#4f46e5", fontSize: "18px" }} />
            <span style={{ fontSize: "12px", fontWeight: 700, color: "#1e293b" }}>
              Audit Events ({filtered.length})
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "6px", width: "260px" }}>
            <SearchIcon style={{ color: "#94a3b8", fontSize: "16px" }} />
            <input
              type="text"
              placeholder="Search audit actions, actors..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                width: "100%", border: "1px solid #cbd5e1", borderRadius: "4px",
                padding: "3px 8px", fontSize: "11px", outline: "none"
              }}
            />
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "4px" }}>
          {filtered.length === 0 ? (
            <div style={{ fontSize: "11px", color: "#94a3b8", textAlign: "center", padding: "40px 0" }}>
              No audit logs recorded yet.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px" }}>
              <thead>
                <tr style={{ background: "#f1f5f9", color: "#475569", textAlign: "left" }}>
                  <th style={{ padding: "6px 10px", fontWeight: 600 }}>Timestamp</th>
                  <th style={{ padding: "6px 10px", fontWeight: 600 }}>Action</th>
                  <th style={{ padding: "6px 10px", fontWeight: 600 }}>Actor</th>
                  <th style={{ padding: "6px 10px", fontWeight: 600 }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "6px 10px", color: "#64748b", whiteSpace: "nowrap" }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </td>
                    <td style={{ padding: "6px 10px", fontWeight: 700, color: "#0f172a" }}>
                      {log.action}
                    </td>
                    <td style={{ padding: "6px 10px", color: "#4f46e5", fontWeight: 600 }}>
                      {log.actor}
                    </td>
                    <td style={{ padding: "6px 10px", color: "#334155" }}>
                      {log.details || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
