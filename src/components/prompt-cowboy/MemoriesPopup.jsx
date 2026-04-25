import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

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
  activeWorkspaceId = 'default-workspace',
  activeMemoryScope = 'global',
}) {
  const navigate = useNavigate();
  const popupRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

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

  return (
    <>
      <div
        ref={popupRef}
        style={{
          position: 'absolute',
          right: 0,
          bottom: 'calc(100% + 8px)',
          zIndex: 510, width: 360, maxWidth: 'calc(100vw - 24px)',
        }}
      >
        <div style={{
          background: 'linear-gradient(135deg, rgba(44,58,30,0.3), rgba(200,184,138,0.5), rgba(44,58,30,0.3))',
          padding: 1, borderRadius: 13,
          boxShadow: '0 8px 32px rgba(44,58,30,0.2)',
        }}>
          <div style={{
            background: '#FDFAF4', borderRadius: 12, padding: 16,
          }}>
            <div style={{ marginBottom: 14 }}>
              <div style={{ color: '#1A2410', fontSize: 15, fontWeight: 700 }}>Memories</div>
              <div style={{ color: '#6B7A5A', fontSize: 12, marginTop: 4 }}>
                Workspace: {formatWorkspaceLabel(activeWorkspaceId)}
              </div>
              <div style={{ color: '#8A7A5A', fontSize: 11, marginTop: 2 }}>
                {visibleEnabledCount} {activeMemoryScope} memory{visibleEnabledCount === 1 ? '' : 'ies'} enabled
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <button
                onClick={() => onToggleScope?.('global', !isGlobalEnabled)}
                style={{
                  border: '1px solid rgba(200,184,138,0.35)', borderRadius: 9999,
                  background: isGlobalEnabled ? '#2C3A1E' : '#FDFAF4',
                  color: isGlobalEnabled ? '#F5F0E8' : '#6B7A5A',
                  padding: '5px 10px', fontSize: 11, cursor: 'pointer',
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
                  padding: '5px 10px', fontSize: 11, cursor: 'pointer',
                }}
              >
                Workspace {isWorkspaceEnabled ? 'On' : 'Off'}
              </button>
            </div>

            {visibleMemories.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#A0956A', fontSize: 12, padding: '16px 0' }}>
                No {activeMemoryScope} memories yet
              </div>
            ) : (
              <div style={{ maxHeight: 150, overflowY: 'auto' }}>
                {visibleMemories.map((mem) => (
                  <div key={mem.id} style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    padding: '10px 0',
                    borderBottom: '1px solid rgba(200,184,138,0.15)',
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, color: '#1A2410', lineHeight: 1.45 }}>
                        {mem.content}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, flexWrap: 'wrap' }}>
                        <span style={{
                          fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                          textTransform: 'uppercase', borderRadius: 9999, padding: '3px 8px',
                          color: mem.scope === 'workspace' ? '#8A7A5A' : '#4A6030',
                          background: mem.scope === 'workspace' ? 'rgba(200,184,138,0.15)' : 'rgba(44,58,30,0.08)',
                        }}>
                          {mem.scope === 'workspace' ? 'Workspace' : 'Global'}
                        </span>
                        {mem.scope === 'workspace' && (
                          <span style={{
                            fontSize: 10.5, color: '#8A7A5A',
                            background: 'rgba(200,184,138,0.10)', borderRadius: 9999, padding: '2px 8px',
                          }}>
                            {formatWorkspaceLabel(mem.workspace_id)}
                          </span>
                        )}
                        <span style={{
                          fontSize: 10, color: '#2C3A1E', background: 'rgba(44,58,30,0.10)',
                          borderRadius: 9999, padding: '2px 8px', fontWeight: 600,
                        }}>
                          Applies now
                        </span>
                      </div>
                    </div>
                    <div style={{ paddingTop: 2 }}>
                      <MemoryToggle
                        enabled={mem.enabled}
                        onToggle={() => onToggle(mem.id, !mem.enabled)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div
              onClick={() => { navigate('/memories'); onClose(); }}
              style={{
                color: '#8A7A5A', fontSize: 12, cursor: 'pointer',
                marginTop: 14, transition: 'color 150ms', fontWeight: 500,
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#2C3A1E'; }}
              onMouseLeave={e => { e.currentTarget.style.color = '#8A7A5A'; }}
            >
              Manage all memories →
            </div>
          </div>
        </div>
      </div>
    </>
  );
}