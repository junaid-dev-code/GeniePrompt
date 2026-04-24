import React, { useRef, useState, useEffect } from 'react';
import { FileText, LayoutTemplate, Bot } from 'lucide-react';

const TABS = [
  { id: 'prompt', label: 'Prompt', icon: FileText },
  { id: 'template', label: 'Template', icon: LayoutTemplate, badge: 'New', badgeColor: '#22C55E' },
  { id: 'agent', label: 'Agent', icon: Bot, badge: 'Soon', badgeColor: 'rgba(200,184,138,0.25)', badgeText: '#8A7A5A', disabled: true },
];

export default function ModeSwitcher({ activeMode, onModeChange }) {
  const tabRefs = useRef({});
  const [indicator, setIndicator] = useState({ left: 0, width: 0 });
  const [tooltip, setTooltip] = useState(false);
  const tooltipTimer = useRef(null);

  useEffect(() => {
    const el = tabRefs.current[activeMode];
    if (el) {
      setIndicator({ left: el.offsetLeft, width: el.offsetWidth });
    }
  }, [activeMode]);

  const handleAgentHover = (entering) => {
    if (entering) {
      tooltipTimer.current = setTimeout(() => setTooltip(true), 300);
    } else {
      clearTimeout(tooltipTimer.current);
      setTooltip(false);
    }
  };

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center',
      position: 'relative', padding: 4,
      background: 'rgba(26,36,16,0.06)',
      borderRadius: 9999,
      border: '1px solid rgba(200,184,138,0.3)',
      marginTop: 16,
    }}>
      {/* Sliding indicator */}
      <div style={{
        position: 'absolute', top: 4, bottom: 4,
        borderRadius: 9999,
        background: '#FDFAF4',
        boxShadow: '0 1px 4px rgba(44,58,30,0.12)',
        transition: 'left 300ms ease-out, width 300ms ease-out',
        left: indicator.left, width: indicator.width,
      }} />

      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeMode === tab.id;

        return (
          <button
            key={tab.id}
            ref={el => { tabRefs.current[tab.id] = el; }}
            onClick={() => {
              if (!tab.disabled) onModeChange(tab.id);
            }}
            onMouseEnter={tab.disabled ? () => handleAgentHover(true) : undefined}
            onMouseLeave={tab.disabled ? () => handleAgentHover(false) : undefined}
            style={{
              position: 'relative', display: 'flex', alignItems: 'center',
              gap: 6, padding: '6px 16px', fontSize: 13, fontWeight: 500,
              borderRadius: 9999, border: 'none', background: 'transparent',
              cursor: tab.disabled ? 'not-allowed' : 'pointer',
              color: isActive ? '#1A2410' : '#6B7A5A',
              transition: 'color 200ms', zIndex: 1, whiteSpace: 'nowrap',
              opacity: tab.disabled ? 0.7 : 1,
            }}
          >
            <Icon size={14} />
            {tab.label}
            {tab.badge && (
              <span style={{
                position: 'absolute', top: -8, right: -6,
                background: tab.badgeColor,
                color: tab.badgeText || 'white',
                fontSize: 11, fontWeight: tab.disabled ? 500 : 600,
                padding: '1px 6px', borderRadius: 9999,
              }}>
                {tab.badge}
              </span>
            )}

            {/* Tooltip for agent */}
            {tab.disabled && tooltip && (
              <div style={{
                position: 'absolute', bottom: 'calc(100% + 8px)',
                left: '50%', transform: 'translateX(-50%)',
                background: '#2C3A1E', color: '#D4C49A',
                fontSize: 11, borderRadius: 6, padding: '4px 10px',
                whiteSpace: 'nowrap', zIndex: 100,
              }}>
                Coming Soon
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}