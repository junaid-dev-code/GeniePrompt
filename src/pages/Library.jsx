import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Copy, Trash2, Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import { promptsApi } from '@/lib/promptsApi';

export default function Library() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    promptsApi.list().then(data => {
      setPrompts(data);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let result = [...prompts];
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(p =>
        (p.title || '').toLowerCase().includes(s) ||
        (p.original_input || '').toLowerCase().includes(s) ||
        (p.improved_output || '').toLowerCase().includes(s)
      );
    }
    if (sortBy === 'oldest') result.reverse();
    if (sortBy === 'alphabetical') result.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
    return result;
  }, [prompts, search, sortBy]);

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied!');
  };

  const handleDelete = async (id) => {
    await promptsApi.deletePrompt(id);
    setPrompts(prev => prev.filter(p => p.id !== id));
    setDeletingId(null);
    toast.success('Deleted');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <div style={{ flex: 1, padding: 32, maxWidth: 1000, margin: '0 auto', width: '100%' }}
        className="max-md:p-4"
      >
        {/* Header */}
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#1A2410' }}>Library</h1>
        <p style={{ fontSize: 14, color: '#6B7A5A', marginTop: 6, marginBottom: 24 }}>
          Your saved prompts, ready to reuse
        </p>

        {/* Toolbar */}
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.4), rgba(44,58,30,0.2))',
            padding: 1, borderRadius: 9, flex: 1, minWidth: 200,
          }}>
            <div style={{ position: 'relative', height: 40, background: '#FDFAF4', borderRadius: 8 }}>
              <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#A0956A' }} />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search prompts..."
                style={{ width: '100%', height: '100%', padding: '0 12px 0 36px', fontSize: 13, color: '#1A2410', background: 'transparent', border: 'none', outline: 'none' }}
              />
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.4), rgba(44,58,30,0.2))',
            padding: 1, borderRadius: 9,
          }}>
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value)}
              style={{
                height: 40, padding: '0 12px', fontSize: 13, color: '#1A2410',
                background: '#FDFAF4', border: 'none', borderRadius: 8,
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="newest">Newest first</option>
              <option value="oldest">Oldest first</option>
              <option value="alphabetical">Alphabetical</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        {!loading && search && (
          <div style={{ fontSize: 13, color: '#6B7A5A', marginBottom: 16 }}>
            {filtered.length} result{filtered.length !== 1 ? 's' : ''} for "<span style={{ color: '#1A2410', fontWeight: 500 }}>{search}</span>"
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 60, color: '#A0956A' }}>
            <Loader2 size={24} style={{ animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 && search ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <Search size={48} style={{ color: 'rgba(200,184,138,0.5)', marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: '#6B7A5A', marginBottom: 4 }}>No results for "{search}"</p>
            <p style={{ fontSize: 13, color: '#A0956A' }}>
              Try different keywords or clear your search
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 60 }}>
            <BookOpen size={48} style={{ color: 'rgba(200,184,138,0.5)', marginBottom: 16 }} />
            <p style={{ fontSize: 16, color: '#6B7A5A', marginBottom: 4 }}>No saved prompts yet</p>
            <p style={{ fontSize: 13, color: '#A0956A' }}>
              Generate a prompt on the home page and click Save to Library
            </p>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 16,
          }}>
            {filtered.map(prompt => (
              <LibraryCard
                key={prompt.id}
                prompt={prompt}
                expanded={expandedId === prompt.id}
                onToggleExpand={() => setExpandedId(expandedId === prompt.id ? null : prompt.id)}
                onCopy={() => handleCopy(prompt.improved_output || prompt.original_input)}
                deleting={deletingId === prompt.id}
                onDeleteStart={() => setDeletingId(prompt.id)}
                onDeleteConfirm={() => handleDelete(prompt.id)}
                onDeleteCancel={() => setDeletingId(null)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LibraryCard({ prompt, expanded, onToggleExpand, onCopy, deleting, onDeleteStart, onDeleteConfirm, onDeleteCancel }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      style={{
        background: hovered
          ? 'linear-gradient(135deg, rgba(44,58,30,0.5), rgba(200,184,138,0.8), rgba(44,58,30,0.5))'
          : 'linear-gradient(135deg, rgba(44,58,30,0.25), rgba(200,184,138,0.5), rgba(44,58,30,0.25))',
        padding: 1, borderRadius: 11,
        transition: 'all 200ms ease-out',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{
        background: '#FDFAF4', borderRadius: 10, padding: '16px 18px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-1px)' : 'none',
        transition: 'all 200ms ease-out',
      }}>
        <div onClick={onToggleExpand}>
          <div className="line-clamp-1" style={{ fontSize: 13, fontWeight: 600, color: '#1A2410' }}>
            {prompt.title}
          </div>
          <div style={{ fontSize: 11, color: '#A0956A', marginTop: 2 }}>
            {prompt.created_date ? format(new Date(prompt.created_date), 'MMM d, yyyy') : ''}
          </div>
          <div className={expanded ? '' : 'line-clamp-3'} style={{
            fontSize: 12, color: '#6B7A5A', marginTop: 8, lineHeight: 1.5,
            transition: 'all 200ms ease-out',
          }}>
            {expanded ? (
              <ReactMarkdown
                components={{
                  p: ({ children }) => <span>{children}</span>,
                  strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#1A2410' }}>{children}</strong>,
                  em: ({ children }) => <em>{children}</em>,
                  ul: ({ children }) => <ul style={{ margin: '4px 0', paddingLeft: 16 }}>{children}</ul>,
                  ol: ({ children }) => <ol style={{ margin: '4px 0', paddingLeft: 16 }}>{children}</ol>,
                  li: ({ children }) => <li style={{ marginBottom: 2 }}>{children}</li>,
                }}
              >
                {prompt.improved_output || prompt.original_input}
              </ReactMarkdown>
            ) : (
              (prompt.improved_output || prompt.original_input).replace(/\*\*/g, '').replace(/\*/g, '').replace(/#{1,3}\s/g, '').replace(/[-*]\s/g, '')
            )}
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
          {deleting ? (
            <div style={{ display: 'flex', gap: 4, alignItems: 'center', fontSize: 11, color: '#6B7A5A' }}>
              <span>Delete?</span>
              <button onClick={e => { e.stopPropagation(); onDeleteConfirm(); }} style={{
                background: 'rgba(200,50,50,0.1)', border: 'none', padding: '2px 8px',
                fontSize: 11, borderRadius: 4, cursor: 'pointer', color: '#c33',
              }}>Yes</button>
              <button onClick={e => { e.stopPropagation(); onDeleteCancel(); }} style={{
                background: 'rgba(200,184,138,0.15)', border: 'none', padding: '2px 8px',
                fontSize: 11, borderRadius: 4, cursor: 'pointer', color: '#6B7A5A',
              }}>No</button>
            </div>
          ) : (
            <>
              <div style={{
                background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.4), rgba(44,58,30,0.2))',
                padding: 1, borderRadius: 7,
              }}>
                <button
                  onClick={e => { e.stopPropagation(); onCopy(); }}
                  style={{
                    background: '#FDFAF4', border: 'none', borderRadius: 6,
                    width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: '#8A7A5A',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#2C3A1E'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = '#8A7A5A'; }}
                >
                  <Copy size={14} />
                </button>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.4), rgba(44,58,30,0.2))',
                padding: 1, borderRadius: 7,
              }}>
                <button
                  onClick={e => { e.stopPropagation(); onDeleteStart(); }}
                  style={{
                    background: '#FDFAF4', border: 'none', borderRadius: 6,
                    width: 28, height: 28, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', color: 'rgba(200,184,138,0.5)',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#8A7A5A'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(200,184,138,0.5)'; }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}