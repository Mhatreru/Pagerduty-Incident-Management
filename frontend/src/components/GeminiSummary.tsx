import React, { useState } from 'react';
import { Typography, Checkbox, FormControlLabel, Box } from '@mui/material';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ConstructionIcon from '@mui/icons-material/Construction';
import { Incident } from '../types';

interface GeminiSummaryProps {
  selectedIncident: Incident | null;
}

export const GeminiSummary: React.FC<GeminiSummaryProps> = ({ selectedIncident }) => {
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({});

  const handleStepToggle = (stepKey: string) => {
    setCompletedSteps(prev => ({
      ...prev,
      [stepKey]: !prev[stepKey]
    }));
  };

  if (!selectedIncident) {
    return (
      <div className="glass-panel" style={{ height: '350px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: '#64748b', textAlign: 'center' }}>
        <AutoAwesomeIcon style={{ fontSize: '48px', marginBottom: '16px', color: '#334155' }} />
        <Typography variant="body1" style={{ fontWeight: 500 }}>
          Select an incident in the Command Center to analyze AI root-cause details and recommended recovery playbooks.
        </Typography>
      </div>
    );
  }

  // Parse Markdown sections from the Gemini details
  const detailsText = selectedIncident.gemini_action_details || "";

  // Extract recommended actions from Markdown format
  const extractRecommendations = (text: string): string[] => {
    const lines = text.split('\n');
    const recommendations: string[] = [];
    let capture = false;

    for (const line of lines) {
      if (line.includes('Recommended Actions') || line.includes('Recommendation:')) {
        capture = true;
        continue;
      }
      // If we meet another header, stop capturing
      if (capture && (line.startsWith('###') || line.startsWith('**') || line.trim() === '') && recommendations.length > 0) {
        if (!line.match(/^\s*\d+\.\s/)) {
          capture = false;
        }
      }
      if (capture && line.trim()) {
        // Match numbers e.g. "1. step" or "- step"
        const cleanLine = line.replace(/^\s*\d+\.\s*/, '').replace(/^\s*[-*]\s*/, '').trim();
        if (cleanLine) {
          recommendations.push(cleanLine);
        }
      }
    }

    if (recommendations.length === 0) {
      // Fallback defaults
      return [
        "Check system resources and trace logs for database connection limits.",
        "Acknowledge the incident in PagerDuty and assign L2 SRE resources.",
        "Initiate restart sequence for database connection pools."
      ];
    }

    return recommendations;
  };

  const recommendationsList = extractRecommendations(detailsText);

  // Formatter for Gemini Markdown summary
  const renderFormattedMarkdown = (text: string) => {
    const sections = text.split('\n\n');
    return sections.map((sec, index) => {
      if (sec.startsWith('###')) {
        return (
          <Typography key={index} variant="h6" style={{ fontWeight: 700, color: '#c084fc', marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AutoAwesomeIcon fontSize="small" />
            {sec.replace('###', '').trim()}
          </Typography>
        );
      }
      if (sec.startsWith('**Incident Summary**')) {
        return (
          <div key={index} style={{ marginTop: '12px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc' }}>INCIDENT SUMMARY</Typography>
            <Typography variant="body2" style={{ color: '#9ca3af', marginTop: '4px', lineHeight: 1.6 }}>
              {sec.replace('**Incident Summary**', '').trim()}
            </Typography>
          </div>
        );
      }
      if (sec.startsWith('**Root Cause Explanation**')) {
        return (
          <div key={index} style={{ marginTop: '16px' }}>
            <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#f8fafc' }}>ROOT CAUSE ANALYSIS</Typography>
            <Typography variant="body2" style={{ color: '#9ca3af', marginTop: '4px', lineHeight: 1.6 }}>
              {sec.replace('**Root Cause Explanation**', '').trim()}
            </Typography>
          </div>
        );
      }
      return null;
    });
  };

  return (
    <div className="glass-panel" style={{ height: '350px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)', fontWeight: 600, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <AutoAwesomeIcon style={{ color: '#c084fc' }} fontSize="small" />
          Generative AI Analysis (Gemini 1.5 Flash)
        </span>
        <span style={{ fontSize: '10px', background: 'rgba(192, 132, 252, 0.15)', color: '#c084fc', padding: '2px 8px', borderRadius: '12px', fontWeight: 600 }}>
          ACTIVE
        </span>
      </div>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.2fr 1fr', overflow: 'hidden' }}>
        {/* Left Side: Summary text */}
        <div style={{ padding: '16px', overflowY: 'auto', borderRight: '1px solid rgba(255,255,255,0.08)' }}>
          {renderFormattedMarkdown(detailsText)}
        </div>

        {/* Right Side: Interactive SRE playbook checklists */}
        <div style={{ padding: '16px', overflowY: 'auto', background: 'rgba(0, 0, 0, 0.1)' }}>
          <Typography variant="subtitle2" style={{ fontWeight: 700, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <ConstructionIcon fontSize="small" />
            Remediation Runbook Checklist
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {recommendationsList.map((rec, idx) => {
              const stepKey = `step-${selectedIncident.id}-${idx}`;
              const isChecked = !!completedSteps[stepKey];
              return (
                <Box 
                  key={idx}
                  sx={{ 
                    padding: '8px 12px', 
                    borderRadius: '8px', 
                    background: isChecked ? 'rgba(16, 185, 129, 0.05)' : 'rgba(255,255,255,0.02)',
                    border: isChecked ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(255,255,255,0.04)',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={isChecked}
                        onChange={() => handleStepToggle(stepKey)}
                        color="success"
                        size="small"
                      />
                    }
                    label={
                      <Typography variant="body2" style={{ 
                        color: isChecked ? '#64748b' : '#d1d5db',
                        textDecoration: isChecked ? 'line-through' : 'none',
                        fontSize: '12.5px',
                        lineHeight: 1.4
                      }}>
                        {rec}
                      </Typography>
                    }
                    style={{ margin: 0, alignItems: 'flex-start' }}
                  />
                </Box>
              );
            })}
          </Box>
        </div>
      </div>
    </div>
  );
};
