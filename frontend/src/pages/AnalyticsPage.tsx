import React, { useState } from "react";
import { Analytics } from "../types";
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import TimerIcon from "@mui/icons-material/Timer";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

interface AnalyticsPageProps {
  analytics: Analytics;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  analytics,
  currentRole,
  onRoleChange
}) => {
  const [timeFilter, setTimeFilter] = useState<string>("30d");

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif", maxHeight: "100vh", overflow: "hidden" }}>
      {/* Header */}
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: "6px 4px 8px", borderBottom: "1px solid #e2e8f0", marginBottom: "8px"
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#0f172a" }}>
            Analytics Dashboard
          </h1>
          <p style={{ margin: "2px 0 0", fontSize: "11px", color: "#64748b" }}>
            Track operational metrics, noise reduction efficiency, and SLA compliance.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {/* 30-Day Filter Dropdown (Mockup #5) */}
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            style={{
              background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px",
              padding: "4px 10px", fontSize: "11px", fontWeight: 600, color: "#1e293b", cursor: "pointer"
            }}
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>

          <select
            value={currentRole}
            onChange={(e) => onRoleChange(e.target.value)}
            style={{
              background: "#fff", border: "1px solid #cbd5e1", borderRadius: "6px",
              padding: "4px 8px", fontSize: "11px", fontWeight: 600, color: "#1e293b", cursor: "pointer"
            }}
          >
            <option value="Admin">Admin</option>
            <option value="Operator">Operator</option>
            <option value="Viewer">Viewer</option>
          </select>
        </div>
      </div>

      {/* Top 4 KPI Metric Cards (Mockup #5) */}
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px", marginBottom: "12px"
      }}>
        {/* Card 1: Alert Noise Reduction */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Alert Noise Reduction</span>
            <FilterAltIcon style={{ color: "#38bdf8", fontSize: "16px" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#f8fafc", marginTop: "4px" }}>
            {analytics.alert_reduction_rate || 88.2}%
          </div>
          <div style={{ fontSize: "10px", color: "#34d399", fontWeight: 700, marginTop: "4px" }}>
            +12% vs last month
          </div>
        </div>

        {/* Card 2: MTTR */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>MTTR</span>
            <TimerIcon style={{ color: "#f59e0b", fontSize: "16px" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#f8fafc", marginTop: "4px" }}>
            {analytics.mttr_minutes || 18} min
          </div>
          <div style={{ fontSize: "10px", color: "#34d399", fontWeight: 700, marginTop: "4px" }}>
            -35% faster resolution
          </div>
        </div>

        {/* Card 3: SLA Compliance */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>SLA Compliance</span>
            <VerifiedUserIcon style={{ color: "#10b981", fontSize: "16px" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#f8fafc", marginTop: "4px" }}>
            {analytics.sla_compliance_rate || 96.4}%
          </div>
          <div style={{ fontSize: "10px", color: "#34d399", fontWeight: 700, marginTop: "4px" }}>
            +2% target achievement
          </div>
        </div>

        {/* Card 4: Auto Remediation */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px", padding: "14px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: "11px", color: "#94a3b8", fontWeight: 600 }}>Auto Remediation</span>
            <SmartToyIcon style={{ color: "#a855f7", fontSize: "16px" }} />
          </div>
          <div style={{ fontSize: "22px", fontWeight: 900, color: "#f8fafc", marginTop: "4px" }}>
            38%
          </div>
          <div style={{ fontSize: "10px", color: "#34d399", fontWeight: 700, marginTop: "4px" }}>
            +18% runbook automated
          </div>
        </div>
      </div>

      {/* Dual Charts Split (Mockup #5) */}
      <div style={{
        display: "grid", gridTemplateColumns: "1.35fr 1fr", gap: "10px",
        height: "calc(100vh - 230px)"
      }}>
        {/* Left: Incident Trend Chart */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px",
          padding: "16px", display: "flex", flexDirection: "column"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
            <span style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc" }}>
              Incident Trend
            </span>
            <div style={{ display: "flex", gap: "12px", fontSize: "10px" }}>
              <span style={{ color: "#38bdf8", fontWeight: 600 }}>— Alerts</span>
              <span style={{ color: "#ef4444", fontWeight: 600 }}>— Incidents</span>
            </div>
          </div>

          <div style={{ flex: 1, minHeight: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics.timeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" tick={{ fontSize: 9 }} stroke="#64748b" />
                <YAxis tick={{ fontSize: 9 }} stroke="#64748b" width={28} />
                <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #334155", fontSize: "11px", color: "#f8fafc" }} />
                <Line type="monotone" dataKey="RawAlerts" stroke="#38bdf8" strokeWidth={2.5} dot={{ r: 3, fill: "#38bdf8" }} />
                <Line type="monotone" dataKey="Incidents" stroke="#ef4444" strokeWidth={2.5} dot={{ r: 3, fill: "#ef4444" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Top Services by Incidents (Mockup #5) */}
        <div style={{
          background: "#0f172a", border: "1px solid #1e293b", borderRadius: "8px",
          padding: "16px", display: "flex", flexDirection: "column"
        }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#f8fafc", marginBottom: "14px" }}>
            Top Services by Incidents
          </div>

          <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-around" }}>
            {[
              { name: "claims-api", pct: 23 },
              { name: "claims-database", pct: 19 },
              { name: "billing-service", pct: 12 },
              { name: "claims-portal", pct: 8 }
            ].map((svc) => (
              <div key={svc.name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", marginBottom: "4px" }}>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>{svc.name}</span>
                  <span style={{ color: "#38bdf8", fontWeight: 700 }}>{svc.pct}%</span>
                </div>
                <div style={{ height: "6px", background: "#1e293b", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${svc.pct * 3.5}%`, background: "#3b82f6", borderRadius: "3px" }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
