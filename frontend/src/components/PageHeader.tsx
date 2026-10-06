import React from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  currentRole: string;
  onRoleChange: (role: string) => void;
  badge?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ title, subtitle, currentRole, onRoleChange, badge = "POC DATASET" }) => {
  const roles = ['OPERATOR', 'MANAGER', 'VIEWER'];
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '20px',
      paddingBottom: '14px',
      borderBottom: '1px solid #e2e8f0',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.4px' }}>
            {title}
          </h1>
          <span style={{
            background: '#eef2ff',
            color: '#4f46e5',
            fontSize: '10px',
            fontWeight: 700,
            padding: '2px 8px',
            borderRadius: '12px',
            letterSpacing: '0.04em'
          }}>
            {badge}
          </span>
        </div>
        {subtitle && (
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
            {subtitle}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#ffffff',
          padding: '4px 10px',
          borderRadius: '8px',
          border: '1px solid #cbd5e1',
          boxShadow: '0 1px 2px rgba(0,0,0,0.03)'
        }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#64748b' }}>ROLE:</span>
          <select
            value={currentRole}
            onChange={e => onRoleChange(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '12px',
              fontWeight: 700,
              color: '#0f172a',
              cursor: 'pointer',
              outline: 'none'
            }}
          >
            {roles.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};
