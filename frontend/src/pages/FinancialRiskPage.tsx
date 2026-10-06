import React, { useState, useEffect } from "react";
import ShieldIcon from "@mui/icons-material/Shield";
import BoltIcon from "@mui/icons-material/Bolt";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

interface RegisterItem {
  asset: string;
  jurisdiction: string;
  value: string;
  climate_var: string;
  var_pct: string;
  annual_loss: string;
  action: string;
  service_id: string;
}

interface FinancialData {
  header: {
    title: string;
    subtitle: string;
    cluster: string;
    timestamp: string;
  };
  kpis: Array<{
    label: string;
    value: string;
    subtext: string;
    color: string;
    accent_border?: boolean;
  }>;
  register: RegisterItem[];
  decision_brief: {
    insurance_exposure: string;
    transition_risk_cost: string;
    ma_adjustment: string;
    portfolio_posture: string;
  };
}

export const FinancialRiskPage: React.FC = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedAsset, setSelectedAsset] = useState<string>("Northern Virginia Campus");
  const [stressTested, setStressTested] = useState<boolean>(false);
  const [actionStatuses, setActionStatuses] = useState<Record<string, string>>({});

  const fetchFinancialData = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://127.0.0.1:8000/api/v1/financial/decision-register");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load financial decision register", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFinancialData();
  }, []);

  const handleActionClick = (asset: string, action: string) => {
    setActionStatuses((prev) => ({
      ...prev,
      [asset]: action.includes("BUY") ? "CONDITIONS_ACCEPTED" : "RETROFIT_QUEUED"
    }));
  };

  const defaultKpis = [
    { label: "PORTFOLIO VALUE", value: "$7.5B", subtext: "Current market basis", color: "#0f172a" },
    { label: "CLIMATE-ADJUSTED VALUE", value: stressTested ? "$5.9B" : "$6.4B", subtext: stressTested ? "21% stress haircut" : "15% simulated haircut", color: "#dc2626", accent_border: true },
    { label: "CLIMATE VAR", value: stressTested ? "$1.6B" : "$1.1B", subtext: stressTested ? "21%" : "15%", color: "#dc2626" },
    { label: "EXPECTED ANNUAL LOSS", value: stressTested ? "$228.4M" : "$175.7M", subtext: "$471.4M revenue at risk", color: "#d97706" },
    { label: "RESILIENCE CAPEX", value: "$333.8M", subtext: "$246.5M EBITDA at risk", color: "#2563eb" }
  ];

  const defaultRegister: RegisterItem[] = [
    { asset: "Northern Virginia Campus", jurisdiction: "ASHBURN, VIRGINIA", value: "$1.2B", climate_var: "$118.4M", var_pct: "10%", annual_loss: "$18.1M", action: "BUY WITH CONDITIONS", service_id: "claims-database" },
    { asset: "Dallas Metro Campus", jurisdiction: "DALLAS, TEXAS", value: "$860.0M", climate_var: "$127.3M", var_pct: "15%", annual_loss: "$20.2M", action: "RENEGOTIATE / RETROFIT", service_id: "claims-api" },
    { asset: "Phoenix West Campus", jurisdiction: "PHOENIX, ARIZONA", value: "$710.0M", climate_var: "$145.2M", var_pct: "20%", annual_loss: "$22.8M", action: "RENEGOTIATE / RETROFIT", service_id: "billing-service" },
    { asset: "Chicago Central Hub", jurisdiction: "CHICAGO, ILLINOIS", value: "$940.0M", climate_var: "$92.6M", var_pct: "9.8%", annual_loss: "$14.5M", action: "BUY WITH CONDITIONS", service_id: "claims-portal" }
  ];

  const kpis = data?.kpis || defaultKpis;
  const register = data?.register || defaultRegister;
  const brief = data?.decision_brief || {
    insurance_exposure: "$70.5M",
    transition_risk_cost: "$187.1M",
    ma_adjustment: "$742.3M",
    portfolio_posture: "Climate risk removes 15% from the current value basis in this simulation. Fund the highest-return resilience interventions before underwriting new exposure."
  };

  return (
    <div style={{ padding: "20px 24px", maxWidth: "1500px", margin: "0 auto", fontFamily: "Inter, sans-serif", color: "#0f172a" }}>
      {/* Top Breadcrumb & Simulation Pill */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", fontWeight: 700, color: "#64748b", letterSpacing: "0.08em" }}>
          <span>EARTH-2</span>
          <span>/</span>
          <span>DECISION LAYER</span>
          <span>/</span>
          <span style={{ color: "#2563eb" }}>FINANCIAL INTELLIGENCE</span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: "6px",
            background: "#f1f5f9", border: "1px solid #cbd5e1",
            borderRadius: "16px", padding: "4px 12px", fontSize: "11px", fontWeight: 600, color: "#334155"
          }}>
            <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
            <span>SIMULATION RUN 9/15/2026, 2:00:00 PM</span>
          </div>

          <button
            onClick={() => setStressTested(!stressTested)}
            className="btn-tactile btn-tactile-secondary"
            style={{ padding: "4px 10px", fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}
          >
            <BoltIcon style={{ fontSize: "14px", color: stressTested ? "#dc2626" : "#475569" }} />
            <span>{stressTested ? "Reset Baseline" : "RCP8.5 Stress Test"}</span>
          </button>
        </div>
      </div>

      {/* Main Page Title */}
      <div style={{ marginBottom: "20px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: 800, margin: "0 0 6px 0", color: "#0f172a", letterSpacing: "-0.5px" }}>
          Financial risk dashboard
        </h1>
        <p style={{ fontSize: "13px", color: "#475569", margin: 0, maxWidth: "900px", lineHeight: "1.5" }}>
          The portfolio-level decision surface for capital allocation, exposure concentration, and downtime-adjusted value.
        </p>
        <div style={{ fontSize: "11px", color: "#64748b", marginTop: "4px", fontWeight: 600 }}>
          Northern Virginia Campus • Ashburn
        </div>
      </div>

      {/* 5 Top KPI Cards Matching Image 3 */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "14px", marginBottom: "22px" }}>
        {kpis.map((kpi, idx) => (
          <div
            key={idx}
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              padding: "16px 18px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
              position: "relative",
              borderBottom: kpi.accent_border ? "3px solid #dc2626" : "1px solid #e2e8f0"
            }}
          >
            <div style={{ fontSize: "10px", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "8px" }}>
              {kpi.label}
            </div>
            <div style={{ fontSize: "28px", fontWeight: 800, color: kpi.color, lineHeight: "1.1", marginBottom: "4px" }}>
              {kpi.value}
            </div>
            <div style={{ fontSize: "11px", color: "#64748b", fontWeight: 500 }}>
              {kpi.subtext}
            </div>
          </div>
        ))}
      </div>

      {/* Real-Time Cost of Downtime & ROI Banner */}
      <div style={{
        background: "linear-gradient(90deg, #eff6ff 0%, #f8fafc 100%)",
        border: "1px solid #bfdbfe",
        borderRadius: "8px",
        padding: "12px 18px",
        marginBottom: "22px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <AccountBalanceIcon style={{ color: "#2563eb", fontSize: "20px" }} />
          </div>
          <div>
            <div style={{ fontSize: "12px", fontWeight: 800, color: "#1e3a8a", display: "flex", alignItems: "center", gap: "8px" }}>
              <span>DOWNTIME FINANCIAL QUANTIFICATION ENGINE (PRESIDIO & PROMETHEUS BACKED)</span>
              <span style={{ background: "#2563eb", color: "#fff", fontSize: "9px", padding: "1px 6px", borderRadius: "10px" }}>LIVE</span>
            </div>
            <div style={{ fontSize: "11px", color: "#3b82f6", marginTop: "2px" }}>
              Calculated at <strong>$840 / minute</strong> of claims-database degradation • SLA breach risk threshold: 99.95%
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "10px", color: "#64748b", fontWeight: 600 }}>NEXUS ROI AVOIDANCE (THIS WEEK)</div>
            <div style={{ fontSize: "16px", fontWeight: 800, color: "#16a34a" }}>+$14,200 SAVED</div>
          </div>
          <div style={{ background: "#dcfce7", border: "1px solid #bbf7d0", padding: "4px 10px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, color: "#15803d" }}>
            18m faster MTTR
          </div>
        </div>
      </div>

      {/* Main Grid: Exposure Register (Left) & Decision Brief (Right) */}
      <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr", gap: "18px" }}>
        {/* Left Card: PORTFOLIO EXPOSURE REGISTER */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px" }}>
            <div>
              <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em" }}>
                PORTFOLIO EXPOSURE REGISTER
              </div>
              <div style={{ fontSize: "11px", color: "#64748b", marginTop: "2px" }}>
                All metrics are climate-conditioned under RCP8.5 / SSP5-8.5 simulation.
              </div>
            </div>

            <button
              onClick={fetchFinancialData}
              style={{ background: "none", border: "none", cursor: loading ? "wait" : "pointer", color: "#64748b" }}
              title={loading ? "Updating..." : "Refresh Register"}
            >
              <RefreshIcon style={{ fontSize: "18px", opacity: loading ? 0.5 : 1 }} />
            </button>
          </div>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "11px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #e2e8f0", color: "#64748b", fontWeight: 700, fontSize: "10px", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "8px 10px" }}>ASSET / JURISDICTION</th>
                  <th style={{ padding: "8px 10px" }}>VALUE</th>
                  <th style={{ padding: "8px 10px" }}>CLIMATE VAR</th>
                  <th style={{ padding: "8px 10px" }}>ANNUAL LOSS</th>
                  <th style={{ padding: "8px 10px", textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {register.map((row, rIdx) => {
                  const isSelected = selectedAsset === row.asset;
                  const currentStatus = actionStatuses[row.asset];

                  return (
                    <tr
                      key={rIdx}
                      onClick={() => setSelectedAsset(row.asset)}
                      style={{
                        borderBottom: "1px solid #f1f5f9",
                        cursor: "pointer",
                        background: isSelected ? "#f8fafc" : "transparent",
                        transition: "background 0.1s"
                      }}
                    >
                      <td style={{ padding: "12px 10px" }}>
                        <div style={{ fontWeight: 700, color: "#0f172a" }}>{row.asset}</div>
                        <div style={{ fontSize: "9px", color: "#64748b", fontWeight: 600, marginTop: "2px" }}>
                          {row.jurisdiction}
                        </div>
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: 600, color: "#0f172a" }}>
                        {row.value}
                      </td>
                      <td style={{ padding: "12px 10px" }}>
                        <span style={{ fontWeight: 700, color: "#dc2626" }}>{row.climate_var}</span>{" "}
                        <span style={{ fontSize: "10px", color: "#ef4444" }}>({row.var_pct})</span>
                      </td>
                      <td style={{ padding: "12px 10px", fontWeight: 600, color: "#0f172a" }}>
                        {row.annual_loss}
                      </td>
                      <td style={{ padding: "12px 10px", textAlign: "right" }}>
                        {currentStatus ? (
                          <span style={{
                            fontSize: "10px",
                            fontWeight: 700,
                            color: "#16a34a",
                            background: "#dcfce7",
                            padding: "4px 8px",
                            borderRadius: "4px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}>
                            <CheckCircleIcon style={{ fontSize: "12px" }} />
                            {currentStatus}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActionClick(row.asset, row.action);
                            }}
                            className="btn-tactile btn-tactile-secondary"
                            style={{
                              padding: "4px 8px",
                              fontSize: "10px",
                              fontWeight: 700,
                              color: row.action.includes("BUY") ? "#0369a1" : "#b45309",
                              borderColor: row.action.includes("BUY") ? "#bae6fd" : "#fde68a",
                              background: row.action.includes("BUY") ? "#f0f9ff" : "#fffbeb"
                            }}
                          >
                            {row.action}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Card: DECISION BRIEF */}
        <div style={{
          background: "#ffffff",
          border: "1px solid #e2e8f0",
          borderRadius: "8px",
          padding: "18px 20px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a", letterSpacing: "0.04em", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>-&gt; DECISION BRIEF</span>
          </div>

          {/* Metric Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Insurance exposure</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{brief.insurance_exposure}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>Transition risk cost</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{brief.transition_risk_cost}</span>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 10px", background: "#f8fafc", borderRadius: "6px" }}>
              <span style={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>M&A adjustment</span>
              <span style={{ fontSize: "13px", fontWeight: 800, color: "#0f172a" }}>{brief.ma_adjustment}</span>
            </div>
          </div>

          {/* Executive Posture Callout */}
          <div style={{
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "6px",
            padding: "12px 14px",
            fontSize: "11px",
            color: "#1e3a8a",
            lineHeight: "1.5",
            marginBottom: "16px"
          }}>
            <div style={{ fontWeight: 800, marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
              <ShieldIcon style={{ fontSize: "14px", color: "#2563eb" }} />
              Portfolio Posture
            </div>
            {brief.portfolio_posture}
          </div>

          {/* Interactive Footer */}
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "8px" }}>
            <button
              onClick={() => {
                const reportContent = "NEXUS EXECUTIVE RISK DIGEST\nTimestamp: " + new Date().toISOString() + "\nPortfolio Value: $7.5B\nClimate VaR: $1.1B\nAnnual Loss: $175.7M\nInsurance Exposure: $70.5M\nPostured Actions: All 4 data centers validated against SOC2 & SRE SLAs.";
                const blob = new Blob([reportContent], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "nexus-financial-decision-brief.txt";
                a.click();
              }}
              className="btn-tactile btn-tactile-primary"
              style={{ width: "100%", padding: "8px", fontSize: "11px", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}
            >
              <FileDownloadIcon style={{ fontSize: "14px" }} />
              Export Decision Brief
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
