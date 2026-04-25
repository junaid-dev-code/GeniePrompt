import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';

function MemoryToggle({ enabled, onToggle }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 32, height: 18, borderRadius: 9,
        background: enabled ? '#2C3A1E' : 'rgba(200,184,138,0.3)',
        position: 'relative', cursor: 'pointer',
        transition: 'background 150ms', flexShrink: 0,
      }}
    >
      <div style={{
        width: 14, height: 14, borderRadius: '50%',
        background: 'white', position: 'absolute',
        top: 2, left: enabled ? 16 : 2,
        transition: 'left 150ms',
      }} />
    </div>
  );
}

export default function MemoriesPopup({
  memories,
  onToggle,
  onToggleScope,
  onClose,
  anchorRef,
  activeWorkspaceId = 'default-workspace',
  activeMemoryScope = 'global',
}) {
  const navigate = useNavigate();
  const popupRef = useRef(null);
  const [position, setPosition] = React.useState({ top: 0, left: 0, ready: false, openAbove: true });

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        if (anchorRef?.current && anchorRef.current.contains(e.target)) return;
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose, anchorRef]);

  useEffect(() => {
    const POPUP_WIDTH = 320;
    const H_MARGIN = 12;
    const V_GAP = 8;
    const V_MARGIN = 8;

    const updatePosition = () => {
      const anchor = anchorRef?.current;
      if (!anchor) return;

      const rect = anchor.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let left = rect.right - POPUP_WIDTH;
      left = Math.max(H_MARGIN, Math.min(left, viewportWidth - POPUP_WIDTH - H_MARGIN));

      const estimatedHeight = 300;
      const canOpenAbove = rect.top - estimatedHeight - V_GAP > V_MARGIN;
      const top = canOpenAbove ? rect.top - V_GAP : rect.bottom + V_GAP;
      setPosition({ top, left, ready: true, openAbove: canOpenAbove });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [anchorRef, memories.length, activeMemoryScope]);

  const formatWorkspaceLabel = (workspaceId) => {
    const raw = (workspaceId || 'default-workspace').trim();
    if (raw === 'default-workspace') return 'Default workspace';
    return raw.replace(/[-_]/g, ' ');
  };

  const globalMemories = memories.filter((m) => m.scope === 'global');
  const workspaceMemories = memories.filter((m) => m.scope === 'workspace' && (m.workspace_id || 'default-workspace') === activeWorkspaceId);
  const isGlobalEnabled = globalMemories.length > 0 && globalMemories.every((m) => !!m.enabled);
  const isWorkspaceEnabled = workspaceMemories.length > 0 && workspaceMemories.every((m) => !!m.enabled);
  const visibleMemories = activeMemoryScope === 'workspace' ? workspaceMemories : globalMemories;
  const visibleEnabledCount = visibleMemories.filter((m) => !!m.enabled).length;

  if (!position.ready) return null;

  return createPortal(
      <div
        ref={popupRef}
        style={{
          position: 'fixed',
          left: position.left,
          top: position.top,
          transform: position.openAbove ? 'translateY(-100%)' : 'translateY(0)',
          zIndex: 2000, width: 320, maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(44,58,30,0.3), rgba(200,184,138,0.5), rgba(44,58,30,0.3))',
          padding: 1, borderRadius: 12,
          boxShadow: '0 8px 24px rgba(44,58,30,0.18)',
        }}>
          <div style={{
            background: '#FDFAF4', borderRadius: 11, padding: 12,
          }}>
            <div style={{ marginBottom: 10 }}>
              <div style={{ color: '#1A2410', fontSize: 14, fontWeight: 700 }}>Memories</div>
              <div style={{ color: '#8A7A5A', fontSize: 11, marginTop: 2 }}>
                {visibleEnabledCount} {activeMemoryScope} memory{visibleEnabledCount === 1 ? '' : 'ies'} enabled
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 8 }}>
              <button
                onClick={() => onToggleScope?.('global', !isGlobalEnabled)}
                style={{
                  border: '1px solid rgba(200,184,138,0.35)', borderRadius: 9999,
                  background: isGlobalEnabled ? '#2C3A1E' : '#FDFAF4',
                  color: isGlobalEnabled ? '#F5F0E8' : '#6B7A5A',
                  padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                }}
              >
                Global {isGlobalEnabled ? 'On' : 'Off'}
              </button>
              <button
                onClick={() => onToggleScope?.('workspace', !isWorkspaceEnabled)}
                style={{
                  border: '1px solid rgba(200,184,138,0.35)', borderRadius: 9999,
                  background: isWorkspaceEnabled ? '#2C3A1E' : '#FDFAF4',
                  color: isWorkspaceEnabled ? '#F5F0E8' : '#6B7A5A',
                  padding: '4px 10px', fontSize: 11, cursor: 'pointer',
                }}
              >
                Workspace {isWorkspaceEnabled ? 'On' : 'Off'}
              </button>
            </div>
            <div style={{ color: '#6B7A5A', fontSize: 11, marginBottom: 8 }}>
              {formatWorkspaceLabel(activeWorkspaceId)}
            </div>

            {visibleMemories.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#A0956A', fontSize: 12, padding: '10px 0' }}>
                No {activeMemoryScope} memories yet
              </div>
            ) : (
              <div style={{ maxHeight: 130, overflowY: 'auto' }}>
                {visibleMemories.map((mem) => (
                  <div key={mem.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '8px 0',
                    borderBottom: '1px solid rgba(200,184,138,0.15)',
                  }}>
                    <div style={{
                      fontSize: 12, color: '#1A2410', flex: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {mem.content}
                    </div>
                    <MemoryToggle
                      enabled={mem.enabled}
                      onToggle={() => onToggle(mem.id, !mem.enabled)}
                    />
                  </div>
                ))}
              </div>
            )}

            <div
              onClick={() => { navigate('/memories'); onClose(); }}
              style={{
                color: '#8A7A5A', fontSize: 11, cursor: 'pointer',
                marginTop: 10, transition: 'color 150ms', fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#2C3A1E'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8A7A5A'; }}
            >
              Manage all memories →
            </div>
          </div>
        </div>
      </div>,
    document.body
  );
}