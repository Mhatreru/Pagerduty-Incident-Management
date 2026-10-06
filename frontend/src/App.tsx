import { useState, useEffect } from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { TopNavbar } from "./components/TopNavbar";
import { Sidebar } from "./components/Sidebar";
import { OverviewPage } from "./pages/OverviewPage";
import { IncidentsPage } from "./pages/IncidentsPage";
import { DynatraceMonitoringPage } from "./pages/DynatraceMonitoringPage";
import { PagerDutyResponsePage } from "./pages/PagerDutyResponsePage";
import { ProblemManagementPage } from "./pages/ProblemManagementPage";
import { ExecutiveReportsPage } from "./pages/ExecutiveReportsPage";
import { FinancialRiskPage } from "./pages/FinancialRiskPage";
import { Service, Incident, Analytics, RawEvent } from "./types";

function App() {
  const [services, setServices] = useState<Service[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [currentRole, setCurrentRole] = useState<string>("OPERATOR");
  const [refreshSignal, setRefreshSignal] = useState<number>(0);
  const [rawAlerts, setRawAlerts] = useState<RawEvent[]>([]);
  const [demoStatus, setDemoStatus] = useState<{ database_latency_active: boolean; service_failure_active: boolean; offline?: boolean }>({
    database_latency_active: false,
    service_failure_active: false,
    offline: true
  });

  const [analytics, setAnalytics] = useState<Analytics>({
    raw_alerts: 0,
    open_incidents: 0,
    p1_incidents: 0,
    alert_reduction_rate: 0,
    mttd_minutes: 2.4,
    mttr_minutes: 0,
    sla_compliance_rate: 100,
    timeline: [
      { day: "Mon", RawAlerts: 30, Incidents: 1 },
      { day: "Tue", RawAlerts: 42, Incidents: 2 },
      { day: "Wed", RawAlerts: 28, Incidents: 1 },
      { day: "Thu", RawAlerts: 35, Incidents: 1 },
      { day: "Fri", RawAlerts: 50, Incidents: 3 },
      { day: "Sat", RawAlerts: 18, Incidents: 0 },
      { day: "Sun", RawAlerts: 12, Incidents: 0 }
    ],
    service_distribution: [
      { name: "claims-database", incidents: 0 },
      { name: "claims-api", incidents: 0 },
      { name: "claims-portal", incidents: 0 },
      { name: "billing-service", incidents: 0 }
    ]
  });

  const fetchData = async () => {
    try {
      const [svcRes, incRes, analyticRes, alertsRes, demoRes] = await Promise.all([
        fetch("http://localhost:8000/api/services"),
        fetch("http://localhost:8000/api/incidents"),
        fetch("http://localhost:8000/api/analytics"),
        fetch("http://localhost:8000/api/alerts/raw"),
        fetch("http://localhost:8000/api/simulator/demo-status")
      ]);

      const svcData = await svcRes.json();
      const incData: Incident[] = await incRes.json();
      const analyticData = await analyticRes.json();
      const alertsData = await alertsRes.json();
      const demoData = await demoRes.json();

      setServices(svcData);
      setIncidents(incData);
      setAnalytics(analyticData);
      setRawAlerts(alertsData);
      setDemoStatus(demoData);
    } catch (err) {
      console.warn("Backend API polling waiting...", err);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, [refreshSignal]);

  const handleRoleChange = (role: string) => {
    setCurrentRole(role);
  };

  const handleTriggerOutage = async () => {
    try {
      await fetch("http://localhost:8000/api/simulator/trigger-latency", { method: "POST" });
      await fetchData();
      setRefreshSignal((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerRecovery = async () => {
    try {
      await fetch("http://localhost:8000/api/simulator/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole })
      });
      await fetchData();
      setRefreshSignal((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectLatency = async () => {
    try {
      await fetch("http://localhost:8000/api/simulator/demo-latency/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole })
      });
      await fetchData();
      setRefreshSignal((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleInjectDowntime = async () => {
    try {
      await fetch("http://localhost:8000/api/simulator/demo-failure/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole })
      });
      await fetchData();
      setRefreshSignal((prev) => prev + 1);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAckIncident = async (incidentId: number) => {
    try {
      await fetch(`http://localhost:8000/api/incidents/${incidentId}/ack`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleResolveIncident = async (incidentId: number) => {
    try {
      await fetch(`http://localhost:8000/api/incidents/${incidentId}/resolve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentRole })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleExecuteRunbook = async (runbookId: string, incidentId: number, isDryRun: boolean) => {
    try {
      const res = await fetch("http://localhost:8000/api/v1/runbooks/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          runbook_id: runbookId,
          incident_id: incidentId,
          is_dry_run: isDryRun,
          role: currentRole
        })
      });
      const data = await res.json();
      await fetchData();
      return data;
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  const handleSimulateWebhook = async (action: "incident.acknowledged" | "incident.resolved") => {
    const activeInc = incidents.find((i) => i.status !== "RESOLVED");
    if (!activeInc) {
      alert("No active incident to simulate PagerDuty webhook for!");
      return;
    }
    try {
      await fetch("http://localhost:8000/api/webhooks/pagerduty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: {
            event_type: action,
            data: {
              id: activeInc.pagerduty_id,
              first_trigger_log_entry: {
                event_details: {
                  dedup_key: activeInc.pagerduty_id
                }
              }
            }
          }
        })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <HashRouter>
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden", background: "#f8fafc" }}>
        <TopNavbar
          onTriggerChaos={handleTriggerOutage}
          demoActive={!demoStatus.offline}
        />
        <div style={{ display: "flex", flex: 1, marginTop: "52px", height: "calc(100vh - 52px)", overflow: "hidden" }}>
          <Sidebar openIncidentCount={incidents.filter(i => i.status !== "RESOLVED").length} />
          <div style={{ flex: 1, marginLeft: "210px", padding: "16px 24px", overflowY: "auto", height: "100%", boxSizing: "border-box" }}>
            <Routes>
            {/* Core 4-Stage Operational Lifecycle */}
            <Route path="/" element={
              <OverviewPage
                services={services}
                analytics={analytics}
                incidents={incidents}
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
                onTriggerCascade={handleTriggerOutage}
                onRunHealing={handleTriggerRecovery}
                onInjectLatency={handleInjectLatency}
                onInjectDowntime={handleInjectDowntime}
                onSimulatePDAck={() => handleSimulateWebhook("incident.acknowledged")}
                onSimulatePDResolved={() => handleSimulateWebhook("incident.resolved")}
                onAcknowledgeIncident={handleAckIncident}
                onResolveIncident={handleResolveIncident}
                onExecuteRunbook={handleExecuteRunbook}
                demoStatus={demoStatus}
              />
            } />
            <Route path="/monitoring" element={
              <DynatraceMonitoringPage
                services={services}
                rawAlerts={rawAlerts}
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
              />
            } />
            <Route path="/incidents" element={
              <IncidentsPage
                incidents={incidents}
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
                onAcknowledgeIncident={handleAckIncident}
                onResolveIncident={handleResolveIncident}
                onExecuteRunbook={handleExecuteRunbook}
              />
            } />
            <Route path="/incident-response" element={
              <PagerDutyResponsePage
                incidents={incidents}
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
                onAcknowledgeIncident={handleAckIncident}
                onResolveIncident={handleResolveIncident}
              />
            } />
            <Route path="/problems" element={
              <ProblemManagementPage
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
              />
            } />
            <Route path="/reports" element={
              <ExecutiveReportsPage
                currentRole={currentRole}
                onRoleChange={handleRoleChange}
              />
            } />
            <Route path="/financial-risk" element={<FinancialRiskPage />} />
            <Route path="/decision-layer" element={<FinancialRiskPage />} />

            {/* Seamless redirects from legacy sub-pages to their respective parent stages */}
            <Route path="/war-room" element={<Navigate to="/incidents" replace />} />
            <Route path="/live-operations" element={<Navigate to="/monitoring" replace />} />
            <Route path="/topology" element={<Navigate to="/monitoring" replace />} />
            <Route path="/runbooks" element={<Navigate to="/incidents" replace />} />
            <Route path="/integrations" element={<Navigate to="/incident-response" replace />} />
            <Route path="/analytics" element={<Navigate to="/" replace />} />
            <Route path="/audit-trail" element={<Navigate to="/incident-response" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
      </div>
    </HashRouter>
  );
}

export default App;
