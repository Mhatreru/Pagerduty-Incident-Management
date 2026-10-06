import React from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  currentRole: string;
  onRoleChange: (role: string) => void;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, currentRole, onRoleChange }) => {
  const roles = ['OPERATOR', 'MANAGER', 'VIEWER'];
  return (
    <div style={{
      background: '#fff',
      border: '1px solid #e2e8f0',
      borderRadius: '12px',
      padding: '18px 24px',
      marginBottom: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '10px',
          background: 'linear-gradient(135deg, #818cf8 0%, #6366f1 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AutoAwesomeIcon style={{ color: '#fff', fontSize: '20px' }} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f172a', fontFamily: 'Inter, sans-serif' }}>{title}</h1>
            <span style={{
              background: '#eef2ff', color: '#4f46e5', fontSize: '10px', fontWeight: 600,
              padding: '2px 8px', borderRadius: '999px', letterSpacing: '0.05em', fontFamily: 'Inter, sans-serif',
            }}>POC DATASET</span>
          </div>
          {subtitle && (
            <div style={{ color: '#64748b', fontSize: '11px', marginTop: '2px', fontFamily: 'Inter, sans-serif' }}>{subtitle}</div>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Capgemini Brand Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 10px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #bae6fd'
        }}>
          <span style={{
            color: '#0070ad',
            fontWeight: 800,
            fontSize: '12.5px',
            letterSpacing: '-0.2px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Capgemini
          </span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#0070ad">
            <path d="M12 2C9.5 7 4 10.5 4 15a8 8 0 0 0 16 0C20 10.5 14.5 7 12 2zm0 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            <path d="M10 20.5h4v1.5h-4z" />
          </svg>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#f59e0b' }} />
          <span style={{ color: '#475569', fontSize: '12px', fontFamily: 'Inter, sans-serif' }}>Profile:</span>
          <select
          value={currentRole}
          onChange={e => onRoleChange(e.target.value)}
          style={{
            background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px',
            padding: '5px 10px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'Inter, sans-serif',
          }}
        >
          {roles.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
    </div>
  );
};
