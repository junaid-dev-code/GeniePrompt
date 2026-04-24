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

export default function MemoriesPopup({ memories, onToggle, onClose }) {
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

  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(26,36,16,0.4)',
          zIndex: 500,
        }}
      />
      <div
        ref={popupRef}
        style={{
          position: 'fixed', top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 510, width: 340,
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
            <div style={{ marginBottom: 12 }}>
              <div style={{ color: '#1A2410', fontSize: 14, fontWeight: 600 }}>Memories</div>
              <div style={{ color: '#6B7A5A', fontSize: 11 }}>Applied to every prompt</div>
            </div>

            {memories.length === 0 ? (
              <div style={{ textAlign: 'center', color: '#A0956A', fontSize: 12, padding: '12px 0' }}>
                No memories yet
              </div>
            ) : (
              <div style={{ maxHeight: 240, overflowY: 'auto' }}>
                {memories.map((mem) => (
                  <div key={mem.id} style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '6px 0',
                    borderBottom: '1px solid rgba(200,184,138,0.15)',
                  }}>
                    <span style={{
                      fontSize: 12, color: '#1A2410', flex: 1,
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {mem.content}
                    </span>
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
                marginTop: 12, transition: 'color 150ms',
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