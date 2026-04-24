import React, { useState, useEffect, useMemo } from 'react';
import { Brain, Trash2, Search, Plus, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { memoriesApi } from '@/lib/promptsApi';

const PRESET_NEUTRAL = ['No em-dashes', "Don't sound like AI", 'Always verify sources', 'Skip the flattery'];
const PRESET_ACCENT = ['Marketing: Use persuasive, benefit-focused language with clear calls-to-action'];
const PRESET_DARK = ['My company', 'My role'];

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

export default function Memories() {
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [scopeFilter, setScopeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newMemory, setNewMemory] = useState('');
  const [newMemoryScope, setNewMemoryScope] = useState('global');
  const [addingPreset, setAddingPreset] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [scopePopupText, setScopePopupText] = useState(null);

  useEffect(() => {
    memoriesApi.list().then(data => {
      setMemories(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...memories];
    if (search) result = result.filter(m => m.content.toLowerCase().includes(search.toLowerCase()));
    if (scopeFilter !== 'all') result = result.filter(m => m.scope === scopeFilter);
    if (sortBy === 'oldest') result.reverse();
    if (sortBy === 'alphabetical') result.sort((a, b) => a.content.localeCompare(b.content));
    return result;
  }, [memories, search, scopeFilter, sortBy]);

  const handleAddPreset = async (text, scope = 'global') => {
    setAddingPreset(text);
    const created = await memoriesApi.create(text, true, scope);
    setMemories(prev => [created, ...prev]);
    toast.success('Memory added');
    setAddingPreset(null);
  };

  const handleAddCustom = async () => {
    if (!newMemory.trim()) return;
    const created = await memoriesApi.create(newMemory.trim(), true, newMemoryScope);
    setMemories(prev => [created, ...prev]);
    toast.success('Memory added');
    setNewMemory('');
    setNewMemoryScope('global');
    setShowAddForm(false);
  };

  const handleToggle = async (id, enabled) => {
    await memoriesApi.update(id, { enabled });
    setMemories(prev => prev.map(m => m.id === id ? { ...m, enabled } : m));
    toast.success('Saved');
  };

  const handleDelete = async (id) => {
    await memoriesApi.deleteMemory(id);
    setMemories(prev => prev.filter(m => m.id !== id));
    setDeletingId(null);
    toast.success('Deleted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, padding: '32px', maxWidth: 900, margin: '0 auto', width: '100%' }}
        className="max-md:p-4"
      >
        {/* Header */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A2410' }}>Memories</h1>
        <p style={{ fontSize: 14, color: '#6B7A5A', marginTop: 6, marginBottom: 24 }}>
          Personalize every prompt with instructions you control
        </p>

        {/* Search & Filters */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.4), rgba(44,58,30,0.2))',
            padding: 1, borderRadius: 9, flex: 1, minWidth: 200,
          }}>
            <div style={{
              position: 'relative', height: 40,
              background: '#FDFAF4', borderRadius: 8,
            }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0956A' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search memories..."
                style={{ width: '100%', height: '100%', padding: '0 12px 0 36px', fontSize: 13, color: '#1A2410', background: 'transparent', border: 'none', outline: 'none' }}
              />
            </div>
          </div>

          <FilterDropdown value={scopeFilter} onChange={setScopeFilter} options={[
            { value: 'all', label: 'All Scopes' },
            { value: 'global', label: 'Global' },
            { value: 'workspace', label: 'Workspace' },
          ]} />

          <FilterDropdown value={sortBy} onChange={setSortBy} options={[
            { value: 'newest', label: 'Newest first' },
            { value: 'oldest', label: 'Oldest first' },
            { value: 'alphabetical', label: 'Alphabetical' },
          ]} />
        </div>

        {/* Presets */}
        {memories.length === 0 && !loading && (
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💭</div>
            <h3 style={{ fontSize: 18, color: '#1A2410', marginBottom: 4 }}>
              Get started with instruction presets
            </h3>
            <p style={{ fontSize: 13, color: '#6B7A5A', marginBottom: 16 }}>
              Click any pill to add it as a memory
            </p>
          </div>
        )}

        {/* Preset pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {PRESET_NEUTRAL.map(text => (
            <PresetPill key={text} text={text} loading={addingPreset === text} onClick={() => setScopePopupText(text)} variant="neutral" />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          {PRESET_ACCENT.map(text => (
            <PresetPill key={text} text={text} loading={addingPreset === text} onClick={() => setScopePopupText(text)} variant="accent" />
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {PRESET_DARK.map(text => (
            <PresetPill key={text} text={text} loading={addingPreset === text} onClick={() => setScopePopupText(text)} variant="dark" />
          ))}
        </div>

        {/* Scope selection popup */}
        {scopePopupText && (
          <>
            <div
              onClick={() => setScopePopupText(null)}
              style={{ position: 'fixed', inset: 0, background: 'rgba(26,36,16,0.4)', zIndex: 500 }}
            />
            <div style={{
              position: 'fixed', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              zIndex: 510, width: 320,
            }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(44,58,30,0.3), rgba(200,184,138,0.5), rgba(44,58,30,0.3))',
                padding: 1, borderRadius: 13,
                boxShadow: '0 8px 32px rgba(44,58,30,0.2)',
              }}>
                <div style={{
                  background: '#FDFAF4', borderRadius: 12, padding: 24,
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#1A2410', fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
                    Save memory
                  </div>
                  <div style={{
                    fontSize: 13, color: '#6B7A5A', marginBottom: 16,
                    whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  }}>
                    "{scopePopupText}"
                  </div>
                  <div style={{ color: '#6B7A5A', fontSize: 12, marginBottom: 12 }}>
                    Choose scope:
                  </div>
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                    <button
                      onClick={() => { handleAddPreset(scopePopupText, 'global'); setScopePopupText(null); }}
                      style={{
                        padding: '10px 24px', fontSize: 13, borderRadius: 8,
                        border: 'none', cursor: 'pointer',
                        background: '#2C3A1E', color: '#F5F0E8',
                        fontWeight: 500, transition: 'all 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#3A4D28'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = '#2C3A1E'; }}
                    >Global</button>
                    <button
                      onClick={() => { handleAddPreset(scopePopupText, 'workspace'); setScopePopupText(null); }}
                      style={{
                        padding: '10px 24px', fontSize: 13, borderRadius: 8,
                        border: '1px solid rgba(200,184,138,0.4)', cursor: 'pointer',
                        background: '#FDFAF4', color: '#6B7A5A',
                        fontWeight: 500, transition: 'all 150ms',
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(200,184,138,0.7)'; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(200,184,138,0.4)'; }}
                    >Workspace</button>
                  </div>
                  <button
                    onClick={() => setScopePopupText(null)}
                    style={{
                      marginTop: 16, background: 'none', border: 'none',
                      color: '#A0956A', fontSize: 12, cursor: 'pointer',
                    }}
                  >Cancel</button>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Add custom button */}
        {!showAddForm ? (
          <div style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, rgba(44,58,30,0.25), rgba(200,184,138,0.5), rgba(44,58,30,0.25))',
            padding: 1, borderRadius: 9, marginBottom: 24,
          }}>
            <button
              onClick={() => setShowAddForm(true)}
              style={{
                background: '#FDFAF4', border: 'none', borderRadius: 8,
                padding: '10px 20px', fontSize: 13, color: '#2C3A1E',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FDFAF4'; }}
            >
              <Plus size={14} /> Add Custom Instruction
            </button>
          </div>
        ) : (
          <div style={{ marginBottom: 24 }}>
            <textarea
              value={newMemory} onChange={e => setNewMemory(e.target.value)}
              placeholder="Type your custom instruction..."
              style={{
                width: '100%', minHeight: 80, padding: 16, fontSize: 14,
                color: '#1A2410', background: '#FDFAF4',
                border: '1px solid rgba(200,184,138,0.4)', borderRadius: 10,
                outline: 'none', resize: 'vertical', fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8, alignItems: 'center' }}>
              <div style={{
                display: 'flex', borderRadius: 8, overflow: 'hidden',
                border: '1px solid rgba(200,184,138,0.3)',
              }}>
                <button
                  type="button"
                  onClick={() => setNewMemoryScope('global')}
                  style={{
                    padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer',
                    background: newMemoryScope === 'global' ? '#2C3A1E' : '#FDFAF4',
                    color: newMemoryScope === 'global' ? '#F5F0E8' : '#6B7A5A',
                    transition: 'all 150ms',
                  }}
                >Global</button>
                <button
                  type="button"
                  onClick={() => setNewMemoryScope('workspace')}
                  style={{
                    padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer',
                    background: newMemoryScope === 'workspace' ? '#2C3A1E' : '#FDFAF4',
                    color: newMemoryScope === 'workspace' ? '#F5F0E8' : '#6B7A5A',
                    transition: 'all 150ms',
                  }}
                >Workspace</button>
              </div>
              <div style={{ flex: 1 }} />
              <div style={{ background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)', padding: 1, borderRadius: 8 }}>
                <button onClick={handleAddCustom} style={{
                  background: '#2C3A1E', color: '#F5F0E8', padding: '8px 20px',
                  fontSize: 13, borderRadius: 7, border: 'none', cursor: 'pointer',
                }}>Save</button>
              </div>
              <button onClick={() => { setShowAddForm(false); setNewMemory(''); setNewMemoryScope('global'); }} style={{
                background: 'transparent', border: '1px solid rgba(200,184,138,0.4)',
                padding: '8px 20px', fontSize: 13, borderRadius: 8, cursor: 'pointer', color: '#6B7A5A',
              }}>Cancel</button>
            </div>
          </div>
        )}

        {/* Memory cards */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#A0956A' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {filtered.map(mem => (
              <div key={mem.id} style={{
                background: 'linear-gradient(135deg, rgba(44,58,30,0.25), rgba(200,184,138,0.5), rgba(44,58,30,0.25))',
                padding: 1, borderRadius: 11,
              }}>
                <div style={{
                  background: '#FDFAF4', borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}>
                  <Brain size={16} style={{ color: '#C8B88A', flexShrink: 0 }} />
                  <span style={{ fontSize: 13, color: '#1A2410', lineHeight: 1.5, flex: 1 }}>
                    {mem.content}
                  </span>
                  <span style={{
                    fontSize: 10, fontWeight: 600, textTransform: 'uppercase',
                    letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 4,
                    background: mem.scope === 'workspace' ? 'rgba(200,184,138,0.15)' : 'rgba(44,58,30,0.08)',
                    color: mem.scope === 'workspace' ? '#8A7A5A' : '#4A6030',
                    flexShrink: 0,
                  }}>
                    {mem.scope || 'global'}
                  </span>
                  <MemoryToggle enabled={mem.enabled} onToggle={() => handleToggle(mem.id, !mem.enabled)} />

                  {deletingId === mem.id ? (
                    <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                      <button onClick={() => handleDelete(mem.id)} style={{
                        background: 'rgba(200,50,50,0.1)', border: 'none', padding: '2px 8px',
                        fontSize: 11, borderRadius: 4, cursor: 'pointer', color: '#c33',
                      }}>Yes</button>
                      <button onClick={() => setDeletingId(null)} style={{
                        background: 'rgba(200,184,138,0.15)', border: 'none', padding: '2px 8px',
                        fontSize: 11, borderRadius: 4, cursor: 'pointer', color: '#6B7A5A',
                      }}>No</button>
                    </div>
                  ) : (
                    <Trash2
                      size={14}
                      style={{ color: 'rgba(200,184,138,0.5)', cursor: 'pointer', flexShrink: 0, transition: 'color 150ms' }}
                      onClick={() => setDeletingId(mem.id)}
                      onMouseEnter={e => { e.currentTarget.style.color = '#8A7A5A'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,184,138,0.5)'; }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterDropdown({ value, onChange, options }) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.4), rgba(44,58,30,0.2))',
      padding: 1, borderRadius: 9,
    }}>
      <select
        value={value} onChange={e => onChange(e.target.value)}
        style={{
          height: 40, padding: '0 12px', fontSize: 13, color: '#1A2410',
          background: '#FDFAF4', border: 'none', borderRadius: 8,
          outline: 'none', cursor: 'pointer', appearance: 'auto',
        }}
      >
        {options.map(o => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function PresetPill({ text, onClick, loading, variant }) {
  const bgMap = {
    neutral: '#FDFAF4',
    accent: 'rgba(200,184,138,0.08)',
    dark: 'rgba(44,58,30,0.06)',
  };
  const colorMap = {
    neutral: '#1A2410',
    accent: '#8A7A5A',
    dark: '#4A6030',
  };

  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.45), rgba(44,58,30,0.2))',
      padding: 1, borderRadius: 9999,
    }}>
      <button
        onClick={loading ? undefined : onClick}
        style={{
          background: bgMap[variant], color: colorMap[variant],
          borderRadius: 9999, padding: '8px 16px', fontSize: 13,
          fontWeight: 500, minHeight: 40, cursor: 'pointer',
          border: 'none', transition: 'all 150ms',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.12)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = bgMap[variant]; }}
      >
        {loading && <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} />}
        {text}
      </button>
    </div>
  );
}