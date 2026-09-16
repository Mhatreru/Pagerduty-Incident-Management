import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap, 
  MarkerType,
  Node,
  Edge
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Service } from '../types';

interface TopologyGraphProps {
  services: Service[];
}

export const TopologyGraph: React.FC<TopologyGraphProps> = ({ services }) => {
  
  // Convert services array into React Flow nodes and edges
  const { nodes, edges } = useMemo(() => {
    const serviceMap = new Map(services.map(s => [s.id, s]));
    
    // Position mappings for the topology layout
    const positions: Record<string, { x: number; y: number }> = {
      'claims-portal': { x: 250, y: 30 },
      'claims-api': { x: 250, y: 140 },
      'billing-service': { x: 100, y: 250 },
      'claims-database': { x: 400, y: 250 }
    };

    const flowNodes: Node[] = services.map(service => {
      const pos = positions[service.id] || { x: Math.random() * 300, y: Math.random() * 300 };
      
      // Determine node status styling
      let borderColor = '#10b981'; // Green
      let bgColor = '#064e3b';
      let shadow = '0 0 10px rgba(16, 185, 129, 0.2)';
      let borderClass = '';

      if (service.status === 'CRITICAL') {
        borderColor = '#ef4444'; // Red
        bgColor = '#7f1d1d';
        shadow = '0 0 20px rgba(239, 68, 68, 0.8)';
        borderClass = 'pulse-border-red';
      } else if (service.status === 'DEGRADED') {
        borderColor = '#f59e0b'; // Amber
        bgColor = '#78350f';
        shadow = '0 0 15px rgba(245, 158, 11, 0.5)';
      }

      return {
        id: service.id,
        position: pos,
        data: { 
          label: (
            <div style={{ padding: '8px 12px', borderRadius: '8px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', opacity: 0.7, fontWeight: 500 }}>
                {service.tier}
              </div>
              <div style={{ fontWeight: 600, fontSize: '13px', margin: '4px 0' }}>
                {service.name}
              </div>
              <div style={{
                display: 'inline-block',
                fontSize: '10px',
                padding: '2px 6px',
                borderRadius: '12px',
                background: service.status === 'HEALTHY' ? '#10b981' : (service.status === 'CRITICAL' ? '#ef4444' : '#f59e0b'),
                color: '#fff',
                fontWeight: 600
              }}>
                {service.status}
              </div>
            </div>
          ) 
        },
        style: {
          background: bgColor,
          color: '#f8fafc',
          border: `2px solid ${borderColor}`,
          borderRadius: '12px',
          boxShadow: shadow,
          width: 180,
          fontFamily: 'inherit',
          transition: 'all 0.5s ease'
        },
        className: borderClass
      };
    });

    const flowEdges: Edge[] = [];
    services.forEach(service => {
      if (service.depends_on) {
        const deps = service.depends_on.split(',');
        deps.forEach(depId => {
          const cleanDepId = depId.trim();
          if (serviceMap.has(cleanDepId)) {
            const depService = serviceMap.get(cleanDepId);
            const isFailing = service.status !== 'HEALTHY' || depService?.status !== 'HEALTHY';
            
            flowEdges.push({
              id: `edge-${cleanDepId}-${service.id}`,
              source: cleanDepId,
              target: service.id,
              animated: isFailing,
              style: { 
                stroke: isFailing ? '#ef4444' : '#64748b', 
                strokeWidth: isFailing ? 3 : 1.5 
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: isFailing ? '#ef4444' : '#64748b'
              }
            });
          }
        });
      }
    });

    return { nodes: flowNodes, edges: flowEdges };
  }, [services]);

  return (
    <div style={{ width: '100%', height: '350px' }} className="glass-panel">
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span>System Topology & Dependencies</span>
        <span style={{ fontSize: '11px', opacity: 0.6 }}>Topological Smartscape Engine</span>
      </div>
      <div style={{ width: '100%', height: '298px' }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          attributionPosition="bottom-right"
        >
          <Background color="#334155" gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap 
            nodeColor={(node) => {
              const svc = services.find(s => s.id === node.id);
              if (svc?.status === 'CRITICAL') return '#ef4444';
              if (svc?.status === 'DEGRADED') return '#f59e0b';
              return '#10b981';
            }}
            maskColor="rgba(15, 23, 42, 0.6)"
            style={{ background: '#0b0f19' }}
          />
        </ReactFlow>
      </div>
    </div>
  );
};
