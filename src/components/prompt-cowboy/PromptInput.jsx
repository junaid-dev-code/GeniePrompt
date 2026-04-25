import React, { useRef, useState, useEffect } from 'react';
import { ArrowUp, Brain, Loader2, Shuffle, ChevronDown } from 'lucide-react';
import MemoriesPopup from './MemoriesPopup';

const PROMPT_TYPES = ['Auto', 'General', 'Marketing', 'Sales'];

export default function PromptInput({ 
  value, 
  onChange, 
  onSend, 
  isLoading, 
  memories = [],
  onToggleMemory,
  onToggleScope,
  activeWorkspaceId = 'default-workspace',
  activeMemoryScope = 'global',
  onMemoryScopeChange,
}) {
  const textareaRef = useRef(null);
  const brainRef = useRef(null);
  const [showMemories, setShowMemories] = useState(false);
  const [promptType, setPromptType] = useState('Auto');
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const typeRef = useRef(null);

  const activeMemoryCount = memories.filter(m => m.enabled).length;
  const hasText = value.trim().length > 0;

  const handleInput = (e) => {
    onChange(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (hasText && !isLoading) onSend();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (typeRef.current && !typeRef.current.contains(e.target)) {
        setShowTypeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div style={{
      width: '100%', maxWidth: 800, position: 'relative',
    }}>
      {/* Gradient border wrapper */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(44,58,30,0.4), rgba(200,184,138,0.6), rgba(44,58,30,0.4))',
        padding: '1.5px', borderRadius: 15,
        boxShadow: '0px 20px 100px 0px rgba(44,58,30,0.14)',
      }}>
        <div style={{
          background: 'rgba(253,250,244,0.92)',
          backdropFilter: 'blur(15px)',
          borderRadius: 14, overflow: 'hidden',
        }}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="What would you like to improve?"
            style={{
              width: '100%', background: 'transparent',
              border: 'none', outline: 'none',
              padding: '20px 24px', fontSize: 16,
              color: '#1A2410', minHeight: 80, maxHeight: 300,
              resize: 'none', overflowY: 'auto',
              lineHeight: 1.4, letterSpacing: '0.02em',
              fontFamily: 'inherit',
              opacity: isLoading ? 0.6 : 1,
            }}
          />

          {/* Toolbar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '10px 16px',
            borderTop: '1px solid rgba(200,184,138,0.15)',
          }}>
            {/* Left - Prompt type */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div ref={typeRef} style={{ position: 'relative' }}>
                <button
                  onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    color: '#6B7A5A', fontSize: 12, cursor: 'pointer',
                    background: 'none', border: 'none', padding: '4px 8px',
                    borderRadius: 6, transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.1)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <Shuffle size={12} style={{ color: '#DADAC6' }} />
                  <span>Prompt type: {promptType}</span>
                  <ChevronDown size={12} style={{ color: '#DADAC6' }} />
                </button>
                {showTypeDropdown && (
                  <div style={{
                    position: 'absolute', bottom: 'calc(100% + 4px)', left: 0,
                    background: '#FDFAF4', borderRadius: 8,
                    border: '1px solid rgba(200,184,138,0.35)',
                    boxShadow: '0 4px 16px rgba(44,58,30,0.12)',
                    padding: 4, zIndex: 100, minWidth: 140,
                  }}>
                    {PROMPT_TYPES.map(type => (
                      <button
                        key={type}
                        onClick={() => { setPromptType(type); setShowTypeDropdown(false); }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left',
                          padding: '6px 12px', fontSize: 12, color: promptType === type ? '#1A2410' : '#6B7A5A',
                          background: promptType === type ? 'rgba(200,184,138,0.12)' : 'transparent',
                          border: 'none', borderRadius: 6, cursor: 'pointer',
                          fontWeight: promptType === type ? 600 : 400,
                          transition: 'all 150ms',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.12)'; }}
                        onMouseLeave={e => { if (promptType !== type) e.currentTarget.style.background = 'transparent'; }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', borderRadius: 9999, overflow: 'hidden', border: '1px solid rgba(200,184,138,0.35)' }}>
                <button
                  type="button"
                  onClick={() => onMemoryScopeChange?.('global')}
                  style={{
                    border: 'none', cursor: 'pointer', fontSize: 11, padding: '5px 10px',
                    background: activeMemoryScope === 'global' ? '#2C3A1E' : '#FDFAF4',
                    color: activeMemoryScope === 'global' ? '#F5F0E8' : '#6B7A5A',
                  }}
                >
                  Global
                </button>
                <button
                  type="button"
                  onClick={() => onMemoryScopeChange?.('workspace')}
                  style={{
                    border: 'none', cursor: 'pointer', fontSize: 11, padding: '5px 10px',
                    background: activeMemoryScope === 'workspace' ? '#2C3A1E' : '#FDFAF4',
                    color: activeMemoryScope === 'workspace' ? '#F5F0E8' : '#6B7A5A',
                  }}
                >
                  Workspace
                </button>
              </div>
            </div>

            {/* Right - buttons */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              {/* AI Powered label */}
              <span style={{
                fontSize: 12, color: '#8A7A5A', padding: '4px 10px',
                borderRadius: 6, background: 'rgba(200,184,138,0.12)',
                border: '1px solid rgba(200,184,138,0.25)',
                marginRight: 4,
              }}>
                AI Powered
              </span>

              {/* Brain button */}
              <div ref={brainRef} style={{ position: 'relative' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)',
                  padding: 1, borderRadius: 8, position: 'relative',
                }}>
                  <button
                    onClick={() => setShowMemories(!showMemories)}
                    style={{
                      background: '#FDFAF4', border: 'none', borderRadius: 7,
                      width: 34, height: 34, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', color: '#6B7A5A', transition: 'all 150ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(200,184,138,0.15)';
                      e.currentTarget.style.color = '#2C3A1E';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#FDFAF4';
                      e.currentTarget.style.color = '#6B7A5A';
                    }}
                  >
                    <Brain size={16} />
                  </button>
                  {activeMemoryCount > 0 && (
                    <span style={{
                      position: 'absolute', top: -4, right: -4,
                      width: 16, height: 16, borderRadius: 9999,
                      background: '#C8B88A', color: '#2C3A1E',
                      fontSize: 10, fontWeight: 700,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {activeMemoryCount}
                    </span>
                  )}
                </div>

                {showMemories && (
                  <MemoriesPopup
                    memories={memories}
                    onToggle={onToggleMemory}
                    onToggleScope={onToggleScope}
                    onClose={() => setShowMemories(false)}
                    activeWorkspaceId={activeWorkspaceId}
                    activeMemoryScope={activeMemoryScope}
                  />
                )}
              </div>

              {/* Send button */}
              {hasText ? (
                <div style={{
                  background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)',
                  padding: 1, borderRadius: 9999,
                }}>
                  <button
                    onClick={onSend}
                    disabled={isLoading}
                    style={{
                      width: 34, height: 34, borderRadius: 9999,
                      background: '#2C3A1E', border: 'none',
                      color: '#F5F0E8', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      cursor: isLoading ? 'wait' : 'pointer',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={e => { if (!isLoading) e.currentTarget.style.background = '#3A4D28'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#2C3A1E'; }}
                    onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.96)'; }}
                    onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                  >
                    {isLoading ? (
                      <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <ArrowUp size={16} />
                    )}
                  </button>
                </div>
              ) : (
                <button
                  disabled
                  style={{
                    width: 34, height: 34, borderRadius: 9999,
                    background: 'rgba(200,184,138,0.2)',
                    border: '1px solid rgba(200,184,138,0.3)',
                    color: '#A0956A', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    cursor: 'not-allowed',
                  }}
                >
                  <ArrowUp size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}