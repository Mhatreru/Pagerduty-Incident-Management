import React from 'react';
import { Typography, Grid } from '@mui/material';
import { 
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, Cell 
} from 'recharts';
import ShowChartIcon from '@mui/icons-material/TrendingUp';
import SpeedIcon from '@mui/icons-material/Speed';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import DynamicFeedIcon from '@mui/icons-material/FilterAlt';
import { Analytics } from '../types';

interface MetricsPanelProps {
  analytics: Analytics;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ analytics }) => {
  const kpis = [
    {
      title: 'Raw Alerts Ingested',
      value: analytics.raw_alerts.toLocaleString(),
      icon: <DynamicFeedIcon style={{ color: '#60a5fa' }} />,
      desc: 'Normalized from Dynatrace'
    },
    {
      title: 'Active Incidents',
      value: analytics.open_incidents,
      icon: <SpeedIcon style={{ color: '#ef4444' }} />,
      desc: `${analytics.p1_incidents} critical P1 outages active`,
      valueColor: analytics.open_incidents > 0 ? '#ef4444' : '#f8fafc'
    },
    {
      title: 'Alert Noise Reduction',
      value: `${analytics.alert_reduction_rate}%`,
      icon: <CheckCircleOutlineIcon style={{ color: '#10b981' }} />,
      desc: 'Correlated & deduplicated alerts',
      valueColor: '#10b981'
    },
    {
      title: 'MTTR / SLA Compliance',
      value: `${analytics.mttr_minutes} min`,
      icon: <ShowChartIcon style={{ color: '#818cf8' }} />,
      desc: `SLA Compliance: ${analytics.sla_compliance_rate}%`
    }
  ];

  // Colors for bar chart bars
  const COLORS = ['#818cf8', '#a78bfa', '#f472b6', '#34d399'];

  return (
    <div style={{ width: '100%' }}>
      {/* 1. Grid of KPI Cards */}
      <Grid container spacing={2} style={{ marginBottom: '16px' }}>
        {kpis.map((kpi, idx) => (
          <Grid size={{ xs: 12, sm: 6, md: 3 }} key={idx}>
            <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <Typography variant="caption" style={{ color: '#9ca3af', fontWeight: 500, textTransform: 'uppercase' }}>
                  {kpi.title}
                </Typography>
                <Typography variant="h4" style={{ fontWeight: 700, margin: '4px 0', color: kpi.valueColor || '#f8fafc' }}>
                  {kpi.value}
                </Typography>
                <Typography variant="caption" style={{ color: '#64748b', fontSize: '11px' }}>
                  {kpi.desc}
                </Typography>
              </div>
              <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                {kpi.icon}
              </div>
            </div>
          </Grid>
        ))}
      </Grid>

      {/* 2. Analytical Charts Grid */}
      <Grid container spacing={2}>
        {/* Line Chart: Alert Suppression & Correlation Trend */}
        <Grid size={{ xs: 12, md: 8 }}>
          <div className="glass-panel" style={{ padding: '16px', height: '300px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Alert Ingestion & Incident Correlation Trend (Last 7 Days)
            </Typography>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analytics.timeline}>
                  <defs>
                    <linearGradient id="colorRaw" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="#64748b" style={{ fontSize: '11px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 600, color: '#fff' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="RawAlerts" name="Raw Ingested Alerts" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Incidents" name="Correlated Incidents" stroke="#ef4444" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Grid>

        {/* Bar Chart: Incidents by Service */}
        <Grid size={{ xs: 12, md: 4 }}>
          <div className="glass-panel" style={{ padding: '16px', height: '300px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc', marginBottom: '12px' }}>
              Outage Incidents by Service Node
            </Typography>
            <div style={{ width: '100%', height: '240px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.service_distribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '9px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '11px' }} />
                  <Tooltip 
                    contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                    labelStyle={{ fontWeight: 600 }}
                  />
                  <Bar dataKey="incidents" name="Incident Count" radius={[4, 4, 0, 0]}>
                    {analytics.service_distribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Grid>
      </Grid>
    </div>
  );
};
