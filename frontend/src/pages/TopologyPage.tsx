import React, { useMemo, useState } from "react";
import ReactFlow, { MiniMap, Controls, Background, MarkerType, Node } from "reactflow";
import "reactflow/dist/style.css";
import { PageHeader } from "../components/PageHeader";
import { Service } from "../types";
import CloseIcon from "@mui/icons-material/Close";

interface TopologyPageProps {
  services: Service[];
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const TopologyPage: React.FC<TopologyPageProps> = ({
  services,
  currentRole,
  onRoleChange
}) => {
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const getServiceStatus = (id: string): "HEALTHY" | "DEGRADED" | "CRITICAL" => {
    const service = services.find(s => s.id === id);
    return service ? service.status : "HEALTHY";
  };

  const getStatusColor = (status: "HEALTHY" | "DEGRADED" | "CRITICAL") => {
    if (status === "CRITICAL") return "#ef4444";
    if (status === "DEGRADED") return "#f59e0b";
    return "#10b981";
  };

  const getStatusBg = (status: "HEALTHY" | "DEGRADED" | "CRITICAL") => {
    if (status === "CRITICAL") return "#fee2e2";
    if (status === "DEGRADED") return "#fffbeb";
    return "#ecfdf5";
  };

  const nodes = useMemo(() => {
    const rawNodes = [
      { id: "claims-portal", label: "Quoting Hub Web Portal", tier: "TIER 3", desc: "(Customer Facing)", x: 260, y: 30 },
      { id: "claims-api", label: "Quoting API Gateway", tier: "TIER 2", desc: "(Core Routing)", x: 260, y: 150 },
      { id: "billing-service", label: "Billing & Policy Engine", tier: "TIER 2", desc: "(Batch Processor)", x: 100, y: 270 },
      { id: "claims-database", label: "Quoting PostgreSQL DB", tier: "TIER 1", desc: "(Primary Store)", x: 420, y: 270 },
    ];

    return rawNodes.map((n) => {
      const status = getServiceStatus(n.id);
      const color = getStatusColor(status);
      const bg = getStatusBg(status);

      return {
        id: n.id,
        position: { x: n.x, y: n.y },
        data: {
          label: (
            <div style={{
              fontFamily: "Inter, sans-serif", textAlign: "center", padding: "6px"
            }}>
              <div style={{ fontSize: "9px", fontWeight: 700, color: "#94a3b8", letterSpacing: "0.05em" }}>{n.tier}</div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "#0f172a", margin: "2px 0" }}>{n.label}</div>
              <div style={{ fontSize: "9px", color: "#64748b", fontStyle: "italic", marginBottom: "6px" }}>{n.desc}</div>
              <span style={{
                background: color, color: "#fff", fontSize: "9px", fontWeight: 700,
                padding: "2px 8px", borderRadius: "999px", textTransform: "uppercase"
              }}>
                {status}
              </span>
            </div>
          )
        },
        style: {
          background: bg,
          border: `2px solid ${color}`,
          borderRadius: "8px",
          width: 190,
          boxShadow: status === "CRITICAL" ? "0 0 12px rgba(239, 68, 68, 0.45)" : "none",
          cursor: "pointer"
        }
      };
    });
  }, [services]);

  const edges = useMemo(() => {
    return [
      {
        id: "e-portal-gateway",
        source: "claims-portal",
        target: "claims-api",
        animated: getServiceStatus("claims-portal") !== "HEALTHY" || getServiceStatus("claims-api") !== "HEALTHY",
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" }
      },
      {
        id: "e-gateway-billing",
        source: "claims-api",
        target: "billing-service",
        animated: getServiceStatus("claims-api") !== "HEALTHY" || getServiceStatus("billing-service") !== "HEALTHY",
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" }
      },
      {
        id: "e-gateway-db",
        source: "claims-api",
        target: "claims-database",
        animated: getServiceStatus("claims-api") !== "HEALTHY" || getServiceStatus("claims-database") !== "HEALTHY",
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" }
      },
      {
        id: "e-billing-db",
        source: "billing-service",
        target: "claims-database",
        animated: getServiceStatus("billing-service") !== "HEALTHY" || getServiceStatus("claims-database") !== "HEALTHY",
        style: { stroke: "#94a3b8", strokeWidth: 1.5 },
        markerEnd: { type: MarkerType.ArrowClosed, color: "#94a3b8" }
      },
    ];
  }, [services]);

  const onNodeClick = (_: any, node: Node) => {
    const svc = services.find(s => s.id === node.id);
    if (svc) setSelectedService(svc);
  };

  return (
    <div style={{ padding: "0 4px", fontFamily: "Inter, sans-serif", maxHeight: "100vh", overflow: "hidden" }}>
      <PageHeader
        title="Service Topology & Smartscape Graph"
        subtitle="DEPENDENCY TRAVERSAL • BLAST RADIUS DISCOVERY • BUSINESS CRITICALITY METRICS"
        currentRole={currentRole}
        onRoleChange={onRoleChange}
      />

      <div style={{
        display: "flex", gap: "10px", height: "calc(100vh - 135px)", overflow: "hidden"
      }}>
        {/* ReactFlow Topology Canvas */}
        <div style={{
          flex: 1, background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
          position: "relative", overflow: "hidden"
        }}>
          {/* Top Status Header */}
          <div style={{
            position: "absolute", top: 12, left: 14, zIndex: 10,
            background: "rgba(255, 255, 255, 0.9)", backdropFilter: "blur(4px)",
            padding: "6px 12px", borderRadius: "6px", border: "1px solid #e2e8f0",
            display: "flex", alignItems: "center", gap: "12px", fontSize: "11px", fontWeight: 600
          }}>
            <span style={{ color: "#475569" }}>Click any node for Blast Radius details</span>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#10b981" }} />
              <span style={{ color: "#475569" }}>Healthy</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#f59e0b" }} />
              <span style={{ color: "#475569" }}>Degraded</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ef4444" }} />
              <span style={{ color: "#475569" }}>Critical</span>
            </div>
          </div>

          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodeClick={onNodeClick}
            fitView
          >
            <Controls />
            <MiniMap style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: "4px" }} />
            <Background color="#cbd5e1" gap={16} />
          </ReactFlow>
        </div>

        {/* Right Side Inspector if Node Selected */}
        {selectedService && (
          <div style={{
            width: "300px", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "8px",
            padding: "16px", display: "flex", flexDirection: "column", gap: "10px"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                {selectedService.name}
              </div>
              <button
                onClick={() => setSelectedService(null)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b" }}
              >
                <CloseIcon style={{ fontSize: "16px" }} />
              </button>
            </div>

            <div style={{ fontSize: "11px", color: "#64748b" }}>
              Service ID: <code>{selectedService.id}</code>
            </div>

            <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "11px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Tier:</span>
                <strong>{selectedService.tier}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Health:</span>
                <strong style={{ color: getStatusColor(selectedService.status) }}>{selectedService.status}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Criticality:</span>
                <strong style={{ color: "#dc2626" }}>{selectedService.business_criticality || "CRITICAL"}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <span>Revenue Impact:</span>
                <strong>${(selectedService.revenue_impact_per_hr || 15000).toLocaleString()}/hr</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>SLA Target:</span>
                <strong>{selectedService.sla_target_min || 30} mins</strong>
              </div>
            </div>

            <div style={{ fontSize: "11px" }}>
              <strong>Upstream Dependencies:</strong>
              <div style={{ color: "#475569", marginTop: "2px" }}>
                {selectedService.depends_on || "None (Root Infrastructure Tier)"}
              </div>
            </div>

            <div style={{ fontSize: "11px" }}>
              <strong>Ownership:</strong>
              <div style={{ color: "#475569", marginTop: "2px" }}>
                Business: {selectedService.business_owner || "Claims Ops"}<br />
                Technical: {selectedService.technical_owner || "SRE Core"}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
