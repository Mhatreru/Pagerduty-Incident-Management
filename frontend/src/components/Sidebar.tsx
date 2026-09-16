import React from 'react';
import { NavLink } from 'react-router-dom';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import DashboardIcon from '@mui/icons-material/Dashboard';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import CableIcon from '@mui/icons-material/Cable';
import SearchIcon from '@mui/icons-material/Search';

interface SidebarProps {
  openIncidentCount?: number;
}

const navItems = [
  { path: '/', label: 'Overview', icon: DashboardIcon, exact: true },
  { path: '/monitoring', label: 'Dynatrace APM', icon: SearchIcon },
  { path: '/incidents', label: 'Incident Management', icon: NotificationsActiveIcon },
  { path: '/incident-response', label: 'Incident Response', icon: CableIcon },
];

export const Sidebar: React.FC<SidebarProps> = ({ openIncidentCount }) => {

  return (
    <div style={{
      width: '210px',
      minWidth: '210px',
      background: '#0f172a',
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      left: 0,
      top: 0,
      zIndex: 100,
      borderRight: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AutoAwesomeIcon style={{ color: '#818cf8', fontSize: '22px' }} />
          <div>
            <div style={{ color: '#f8fafc', fontWeight: 700, fontSize: '16px', letterSpacing: '-0.3px', fontFamily: 'Inter, sans-serif' }}>NEXUS</div>
            <div style={{ color: '#475569', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.15em', fontFamily: 'Inter, sans-serif' }}>PagerDuty POC</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        <div style={{ color: '#334155', fontSize: '10px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', padding: '8px 18px 6px', fontFamily: 'Inter, sans-serif' }}>
          Operational Workflow
        </div>
        {navItems.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            end={path === '/'}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 18px',
              color: isActive ? '#f8fafc' : '#94a3b8',
              background: isActive ? 'linear-gradient(90deg, rgba(99, 102, 241, 0.16) 0%, rgba(99, 102, 241, 0.04) 100%)' : 'transparent',
              borderLeft: isActive ? '3px solid #818cf8' : '3px solid transparent',
              textDecoration: 'none',
              fontSize: '13px',
              fontWeight: isActive ? 600 : 500,
              fontFamily: 'Inter, sans-serif',
              transition: 'all 0.15s',
            })}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Icon style={{ fontSize: '16px', color: '#818cf8' }} />
              <span>{label}</span>
            </div>
            {label.includes('Dynatrace') && (
              <span className="beacon-live" title="APM & Synthetic Monitoring Active" />
            )}
            {label.includes('Incident Management') && openIncidentCount && openIncidentCount > 0 ? (
              <span style={{
                background: '#ef4444',
                color: '#fff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '10px',
                minWidth: '16px',
                textAlign: 'center',
                boxShadow: '0 0 8px rgba(239, 68, 68, 0.5)'
              }}>
                {openIncidentCount}
              </span>
            ) : null}
          </NavLink>
        ))}
      </div>

      {/* Bottom: Primary App Info */}
      <div style={{ padding: '14px 18px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ color: '#334155', fontSize: '9px', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '4px', fontFamily: 'Inter, sans-serif' }}>Primary Application</div>
        <div style={{ color: '#818cf8', fontSize: '12px', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Quoting Hub Engine</div>
        <div style={{ color: '#475569', fontSize: '10px', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>(Claims Portal fallback)</div>
      </div>
    </div>
  );
};
