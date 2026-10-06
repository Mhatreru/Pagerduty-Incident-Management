import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

interface TopNavbarProps {
  onTriggerChaos?: () => void;
  onRunRecovery?: () => void;
  demoActive?: boolean;
}

export const TopNavbar: React.FC<TopNavbarProps> = ({
  onTriggerChaos,
  demoActive = true,
}) => {
  const [themeMode, setThemeMode] = useState<'dark' | 'light' | 'color'>('light');

  return (
    <header style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '52px',
      background: '#ffffff',
      borderBottom: '1px solid #e2e8f0',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      zIndex: 1000,
      fontFamily: 'Inter, sans-serif'
    }}>
      {/* Left: Brand + Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '22px' }}>
        {/* Circular Logo Badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '30px',
            height: '30px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #701a31 0%, #4c0519 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 800,
            fontSize: '12px',
            letterSpacing: '0.05em',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            FI
          </div>
          <span style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.3px' }}>
            NEXUS SRE Studio
          </span>
        </div>

        {/* Workspace nav links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '8px' }}>
          <NavLink
            to="/"
            style={({ isActive }) => ({
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0f172a' : '#64748b',
              textDecoration: 'none'
            })}
          >
            Overview
          </NavLink>
          <NavLink
            to="/monitoring"
            style={({ isActive }) => ({
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0f172a' : '#64748b',
              textDecoration: 'none'
            })}
          >
            1. Detect
          </NavLink>
          <NavLink
            to="/incident-response"
            style={({ isActive }) => ({
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0f172a' : '#64748b',
              textDecoration: 'none'
            })}
          >
            2. Triage
          </NavLink>
          <NavLink
            to="/incidents"
            style={({ isActive }) => ({
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0f172a' : '#64748b',
              textDecoration: 'none'
            })}
          >
            3. War Room
          </NavLink>
          <NavLink
            to="/reports"
            style={({ isActive }) => ({
              fontSize: '12.5px',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#0f172a' : '#64748b',
              textDecoration: 'none'
            })}
          >
            4. Postmortem
          </NavLink>
        </nav>
      </div>

      {/* Right Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* + NEW DRILL / WORKSPACE CTA */}
        {onTriggerChaos && (
          <button
            onClick={onTriggerChaos}
            style={{
              background: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 2px rgba(0,0,0,0.08)'
            }}
          >
            <span>+ NEW DRILL</span>
          </button>
        )}

        {/* Theme Toggles */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: '#f8fafc', padding: '2px 4px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setThemeMode('dark')}
            title="Dark Mode"
            style={{
              background: themeMode === 'dark' ? '#ffffff' : 'transparent',
              border: themeMode === 'dark' ? '1px solid #cbd5e1' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '2px 5px',
              fontSize: '11.5px'
            }}
          >
            🌙
          </button>
          <button
            onClick={() => setThemeMode('light')}
            title="Light Mode"
            style={{
              background: themeMode === 'light' ? '#ffffff' : 'transparent',
              border: themeMode === 'light' ? '1px solid #3b82f6' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '2px 5px',
              fontSize: '11.5px'
            }}
          >
            ☀️
          </button>
          <button
            onClick={() => setThemeMode('color')}
            title="Palette Mode"
            style={{
              background: themeMode === 'color' ? '#ffffff' : 'transparent',
              border: themeMode === 'color' ? '1px solid #cbd5e1' : 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              padding: '2px 5px',
              fontSize: '11.5px'
            }}
          >
            🎨
          </button>
        </div>

        {/* DEMO Switch Pill */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: '#fffbeb',
          border: '1px solid #fde68a',
          padding: '4px 10px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#b45309'
        }}>
          <span>🔔 DEMO</span>
          <div style={{
            width: '24px',
            height: '14px',
            background: demoActive ? '#f59e0b' : '#cbd5e1',
            borderRadius: '10px',
            position: 'relative',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '10px',
              height: '10px',
              background: '#ffffff',
              borderRadius: '50%',
              position: 'absolute',
              top: '2px',
              left: demoActive ? '12px' : '2px',
              transition: 'left 0.15s ease'
            }} />
          </div>
        </div>

        {/* CAPGEMINI BRANDING (exact styling from user image) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 12px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #bae6fd'
        }}>
          <span style={{
            color: '#0070ad',
            fontWeight: 800,
            fontSize: '13.5px',
            letterSpacing: '-0.2px',
            fontFamily: 'Inter, sans-serif'
          }}>
            Capgemini
          </span>
          {/* Capgemini Spade Icon in brand blue */}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#0070ad">
            <path d="M12 2C9.5 7 4 10.5 4 15a8 8 0 0 0 16 0C20 10.5 14.5 7 12 2zm0 15a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
            <path d="M10 20.5h4v1.5h-4z" />
          </svg>
        </div>
      </div>
    </header>
  );
};
