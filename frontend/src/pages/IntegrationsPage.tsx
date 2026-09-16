import React, { useState, useEffect } from "react";
import { PageHeader } from "../components/PageHeader";
import { PlatformHealth, SuppressionRule } from "../types";
import CableIcon from "@mui/icons-material/Cable";
import SendIcon from "@mui/icons-material/Send";
import FilterAltIcon from "@mui/icons-material/FilterAlt";

interface IntegrationsPageProps {
  currentRole: string;
  onRoleChange: (role: string) => void;
  suppressionRules: SuppressionRule[];
  onAddSuppressionRule: (field: string, pattern: string, reason: string) => Promise<void>;
  onRemoveSuppressionRule: (id: number) => Promise<void>;
}

export const IntegrationsPage: React.FC<IntegrationsPageProps> = ({
  currentRole,
  onRoleChange,
  suppressionRules,
  onAddSuppressionRule,
  onRemoveSuppressionRule
}) => {
  const [mode, setMode] = useState<string>("event_driven");
  const [platformHealth, setPlatformHealth] = useState<PlatformHealth | null>(null);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [sendingTest, setSendingTest] = useState(false);

  // New rule form state
  const [newRuleField, setNewRuleField] = useState("message");
  const [newRulePattern, setNewRulePattern] = useState("");
  const [newRuleReason, setNewRuleReason] = useState("");

  const fetchStatus = async () => {
    try {
      const [mRes, hRes] = await Promise.all([
        fetch("http://localhost:8000/api/v1/config/integration-mode"),
        fetch("http://localhost:8000/api/v1/health/nexus")
      ]);
      const mData = await mRes.json();
      const hData = await hRes.json();
      setMode(mData.mode);
      setPlatformHealth(hData);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleModeChange = async (newMode: string) => {
    try {
      await fetch("http://localhost:8000/api/v1/config/integration-mode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: newMode })
      });
      setMode(newMode);
      fetchStatus();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSendTestWebhook = async () => {
    setSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch("http://localhost:8000/api/v1/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source: "prometheus",
          service_id: "claims-database",
          severity: "CRITICAL",
          message: "High Connection Latency: active_connections exceeded 140",
          entity: "claims-db-primary"
        })
      });
      const data = await res.json();
      setTestResult(JSON.stringify(data, null, 2));
    } catch (e: any) {
      setTestResult("Test Error: " + e.message);
    } finally {
      setSendingTest(false);
    }
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRulePattern || !newRuleReason) return;
    onAddSuppressionRule(newRuleField, newRulePattern, newRuleReason);
    setNewRulePattern("");
    setNewRuleReason("");
  };

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif" }}>
      <PageHeader
        title="Enterprise Connectors & System Settings"
        subtitle="INTEGRATION MODES • HEALTH OBSERVABILITY • EVENT GATEWAY TESTER • SUPPRESSION RULES"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{
        display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: "14px",
        height: "calc(100vh - 140px)", overflow: "hidden"
      }}>
        {/* Left Column: Mode Switcher & Connector Cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", paddingRight: "4px" }}>
          {/* Integration Mode Switcher */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px"
          }}>
            <div style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", marginBottom: "4px" }}>
              NEXUS Integration Architecture Mode
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", marginBottom: "12px" }}>
              Toggle between Event-Driven Webhooks (Production Standard) and Polling fallback.
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {[
                { id: "event_driven", title: "⚡ Event Driven", desc: "Real-time webhooks (Production Default)" },
                { id: "polling", title: "🔁 Polling", desc: "60s API poll fallback" },
                { id: "hybrid", title: "🔀 Hybrid", desc: "Webhooks + Polling validation" }
              ].map((m) => {
                const isActive = mode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => handleModeChange(m.id)}
                    style={{
                      background: isActive ? "#4f46e5" : "#f8fafc",
                      color: isActive ? "#fff" : "#334155",
                      border: `1px solid ${isActive ? "#4f46e5" : "#cbd5e1"}`,
                      borderRadius: "6px", padding: "10px 8px", textAlign: "left", cursor: "pointer"
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700 }}>{m.title}</div>
                    <div style={{ fontSize: "9px", opacity: 0.85, marginTop: "2px" }}>{m.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Connectors Health Grid */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b", display: "flex", alignItems: "center", gap: "6px" }}>
                <CableIcon style={{ color: "#4f46e5", fontSize: "18px" }} />
                External Connectors Health
              </span>
              <span style={{
                background: platformHealth?.status === "HEALTHY" ? "#ecfdf5" : "#fee2e2",
                color: platformHealth?.status === "HEALTHY" ? "#059669" : "#dc2626",
                fontSize: "10px", fontWeight: 700, padding: "2px 8px", borderRadius: "4px"
              }}>
                SYSTEM: {platformHealth?.status || "HEALTHY"}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
              {[
                { name: "Dynatrace Davis® AI", status: platformHealth?.connectors.dynatrace || "CONNECTED", desc: "Problems API v2 & Webhook Ingestion" },
                { name: "PagerDuty Cloud", status: platformHealth?.connectors.pagerduty || "CONNECTED", desc: "Events API v2 & Bi-directional REST sync" },
                { name: "ServiceNow ITSM", status: platformHealth?.connectors.servicenow || "MOCK_ACTIVE", desc: "Incident CMDB item mapping" },
                { name: "Google Gemini 1.5 Flash", status: platformHealth?.connectors.gemini_ai || "CONNECTED", desc: "Structured Incident Intelligence & RCA" },
                { name: "Notifications (Slack/Teams)", status: "CONNECTED", desc: "High-priority P1/P2 operational alert cards" },
                { name: "Event Bus & In-Memory Queue", status: "ONLINE", desc: `Queue depth: ${platformHealth?.event_bus.queue_depth || 0} / 1000` }
              ].map((c, i) => (
                <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 10px", background: "#f8fafc" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>{c.name}</span>
                    <span style={{
                      color: c.status.includes("CONNECTED") || c.status === "ONLINE" ? "#16a34a" : "#4f46e5",
                      fontSize: "9px", fontWeight: 700
                    }}>
                      {c.status}
                    </span>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b", marginTop: "2px" }}>{c.desc}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Gateway Simulator */}
          <div style={{
            background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px", padding: "16px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#1e293b" }}>
                Test Event Gateway (`POST /api/v1/events`)
              </span>
              <button
                disabled={sendingTest}
                onClick={handleSendTestWebhook}
                style={{
                  background: "#4f46e5", color: "#fff", border: "none", borderRadius: "4px",
                  padding: "4px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer",
                  display: "flex", alignItems: "center", gap: "4px"
                }}
              >
                <SendIcon style={{ fontSize: "12px" }} />
                {sendingTest ? "Sending..." : "Send Test Alert"}
              </button>
            </div>
            {testResult && (
              <pre style={{
                background: "#0f172a", color: "#4ade80", borderRadius: "6px", padding: "8px",
                margin: "6px 0 0", fontSize: "10px", overflowX: "auto", maxHeight: "120px"
              }}>
                {testResult}
              </pre>
            )}
          </div>
        </div>

        {/* Right Column: Suppression Rules Manager */}
        <div style={{
          background: "#fff", border: "1px solid #e2e8f0", borderRadius: "10px",
          padding: "16px", display: "flex", flexDirection: "column", overflow: "hidden"
        }}>
          <h3 style={{
            margin: "0 0 10px", fontSize: "13px", fontWeight: 700, color: "#1e293b",
            display: "flex", alignItems: "center", gap: "6px"
          }}>
            <FilterAltIcon style={{ color: "#4f46e5", fontSize: "18px" }} />
            Suppression Rules Management ({suppressionRules.length})
          </h3>

          {/* New Rule Inline Form */}
          <form onSubmit={handleCreateRule} style={{
            display: "flex", gap: "6px", marginBottom: "12px", background: "#f8fafc",
            padding: "8px", borderRadius: "6px", border: "1px solid #e2e8f0"
          }}>
            <select
              value={newRuleField}
              onChange={(e) => setNewRuleField(e.target.value)}
              style={{ fontSize: "11px", padding: "4px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            >
              <option value="message">Message Regex</option>
              <option value="service_id">Service ID</option>
              <option value="severity">Severity</option>
            </select>
            <input
              type="text"
              placeholder="Match pattern..."
              value={newRulePattern}
              onChange={(e) => setNewRulePattern(e.target.value)}
              style={{ flex: 1, fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            />
            <input
              type="text"
              placeholder="Reason..."
              value={newRuleReason}
              onChange={(e) => setNewRuleReason(e.target.value)}
              style={{ flex: 1, fontSize: "11px", padding: "4px 8px", borderRadius: "4px", border: "1px solid #cbd5e1" }}
            />
            <button
              type="submit"
              disabled={currentRole === "VIEWER"}
              style={{
                background: "#16a34a", color: "#fff", border: "none", borderRadius: "4px",
                padding: "4px 10px", fontSize: "11px", fontWeight: 700, cursor: "pointer"
              }}
            >
              Add
            </button>
          </form>

          {/* Rules List */}
          <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            {suppressionRules.map((rule) => (
              <div key={rule.id} style={{
                border: "1px solid #e2e8f0", borderRadius: "6px", padding: "8px 10px", background: "#f8fafc",
                display: "flex", justifyContent: "space-between", alignItems: "center"
              }}>
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#0f172a" }}>
                    {rule.target_field} = <code>{rule.match_pattern}</code>
                  </div>
                  <div style={{ fontSize: "10px", color: "#64748b" }}>{rule.reason}</div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{
                    color: rule.enabled ? "#16a34a" : "#94a3b8", fontSize: "10px", fontWeight: 700
                  }}>
                    {rule.enabled ? "ACTIVE" : "MUTED"}
                  </span>
                  <button
                    disabled={currentRole === "VIEWER"}
                    onClick={() => onRemoveSuppressionRule(rule.id)}
                    style={{
                      background: "#f1f5f9", color: "#64748b", border: "1px solid #cbd5e1",
                      borderRadius: "4px", padding: "2px 6px", fontSize: "10px", cursor: "pointer"
                    }}
                  >
                    Toggle
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
