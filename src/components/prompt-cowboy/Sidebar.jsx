import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Plus, BookOpen, Brain, Search, X, LogOut } from 'lucide-react';
import { promptsApi } from '@/lib/promptsApi';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { label: 'New Prompt', icon: Plus, path: '/' },
  { label: 'Library', icon: BookOpen, path: '/library' },
  { label: 'Memories', icon: Brain, path: '/memories' },
];

const SIDEBAR_EXPANDED = 220;
const SIDEBAR_COLLAPSED = 72;

export default function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [recentPrompts, setRecentPrompts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [allPrompts, setAllPrompts] = useState([]);
  const searchInputRef = useRef(null);

  useEffect(() => {
    document.documentElement.style.setProperty('--sidebar-width', SIDEBAR_EXPANDED + 'px');
  }, []);

  useEffect(() => {
    promptsApi.list().then(prompts => {
      setRecentPrompts(prompts.slice(0, 5));
      setAllPrompts(prompts);
    }).catch(() => {});
  }, [location.pathname]);

  useEffect(() => {
    setSearchOpen(false);
    setSearchQuery('');
  }, [location.pathname]);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const q = searchQuery.toLowerCase();
    const results = allPrompts.filter(p =>
      (p.title || '').toLowerCase().includes(q) ||
      (p.improved_output || '').toLowerCase().includes(q) ||
      (p.original_input || '').toLowerCase().includes(q)
    ).slice(0, 6);
    setSearchResults(results);
  }, [searchQuery, allPrompts]);

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return path && location.pathname.startsWith(path);
  };

  const sidebarContent = () => (
    <div style={{
      width: SIDEBAR_EXPANDED,
      height: '100vh',
      background: '#2C3A1E',
      borderRight: '1px solid rgba(200, 184, 138, 0.15)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    }}>
      {/* Logo */}
      <div style={{
        height: 64,
        borderBottom: '1px solid rgba(200, 184, 138, 0.1)',
        display: 'flex', alignItems: 'center',
        padding: '0 16px', gap: 10, flexShrink: 0,
      }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'rgba(200,184,138,0.15)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#C8B88A', fontSize: 13, fontWeight: 700, flexShrink: 0,
          letterSpacing: '-0.02em',
        }}>
          Pq
        </div>
        <span style={{
          color: '#D4C49A', fontSize: 14, fontWeight: 600,
          letterSpacing: '-0.02em', whiteSpace: 'nowrap',
        }}>
          PromptGenie
        </span>
      </div>

      {/* Nav Items */}
      <div style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = isActive(item.path);
          const Icon = item.icon;

          return (
            <Link key={item.label} to={item.path} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  width: 'calc(100% - 16px)', margin: '2px 8px', height: 40,
                  borderRadius: 8, display: 'flex', alignItems: 'center',
                  gap: 10, padding: active ? '0 8px' : '0 10px', cursor: 'pointer',
                  background: active ? 'rgba(200,184,138,0.12)' : 'transparent',
                  borderLeft: active ? '2px solid #C8B88A' : '2px solid transparent',
                  transition: 'all 150ms',
                }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.background = 'rgba(200,184,138,0.08)'; }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={16} style={{ color: active ? '#C8B88A' : '#DADAC6', flexShrink: 0, opacity: active ? 1 : 0.5 }} />
                <span style={{ color: active ? '#D4C49A' : 'rgba(213,196,154,0.6)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                  {item.label}
                </span>
              </div>
            </Link>
          );
        })}

        {/* Quick Search */}
        <div style={{ padding: '4px 8px' }}>
          {searchOpen ? (
            <div style={{
              background: 'rgba(200,184,138,0.1)',
              border: '1px solid rgba(200,184,138,0.25)',
              borderRadius: 8, padding: '0 8px',
              display: 'flex', alignItems: 'center', gap: 6, height: 36,
            }}>
              <Search size={14} style={{ color: '#C8B88A', flexShrink: 0 }} />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search prompts..."
                style={{
                  flex: 1, background: 'transparent', border: 'none', outline: 'none',
                  color: '#D4C49A', fontSize: 12, fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => { setSearchOpen(false); setSearchQuery(''); }}
                style={{ background: 'none', border: 'none', color: 'rgba(213,196,154,0.5)', cursor: 'pointer', padding: 0 }}
              >
                <X size={12} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setSearchOpen(true)}
              style={{
                width: '100%', height: 36, borderRadius: 8,
                display: 'flex', alignItems: 'center', gap: 10, padding: '0 10px',
                cursor: 'pointer', background: 'transparent', border: 'none',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.08)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
            >
              <Search size={16} style={{ color: '#DADAC6', flexShrink: 0, opacity: 0.5 }} />
              <span style={{ color: 'rgba(213,196,154,0.6)', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' }}>
                Search
              </span>
              <span style={{
                marginLeft: 'auto', fontSize: 10, color: 'rgba(213,196,154,0.3)',
                background: 'rgba(200,184,138,0.08)', padding: '2px 6px', borderRadius: 4,
              }}>
                ⌘K
              </span>
            </button>
          )}
        </div>

        {/* Search Results */}
        {searchQuery.trim() && (
          <div style={{ padding: '4px 12px 0' }}>
            <div style={{ color: 'rgba(213,196,154,0.4)', fontSize: 10, marginBottom: 4 }}>
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </div>
            {searchResults.length === 0 && (
              <div style={{ color: 'rgba(213,196,154,0.35)', fontSize: 11, padding: '4px 0' }}>
                No prompts found
              </div>
            )}
            {searchResults.map(p => (
              <Link key={p.id} to="/library" onClick={() => { setSearchOpen(false); setSearchQuery(''); }} style={{ textDecoration: 'none' }}>
                <div style={{
                  color: '#D4C49A', fontSize: 12, fontWeight: 500,
                  padding: '4px 0', cursor: 'pointer',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  opacity: 0.85,
                }}>
                  {(p.title || '').substring(0, 28)}
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Recent section */}
        {!searchQuery.trim() && recentPrompts.length > 0 && (
          <div style={{ padding: '16px 16px 0', marginTop: 8 }}>
            <div style={{ color: 'rgba(213,196,154,0.5)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 6, fontWeight: 600 }}>
              Recent
            </div>
            {recentPrompts.map((p) => (
              <Link key={p.id} to="/library" style={{ textDecoration: 'none' }}>
                <div style={{
                  color: '#D4C49A', fontSize: 12, fontWeight: 500,
                  padding: '5px 0', cursor: 'pointer',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                  opacity: 0.85,
                }}>
                  {(p.title || '').substring(0, 28)}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Bottom workspace */}
      <div style={{ marginTop: 'auto', borderTop: '1px solid rgba(200,184,138,0.1)', padding: '12px 8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '0 8px' }}>
          <div style={{ background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)', padding: 1, borderRadius: '50%', flexShrink: 0 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: '#2C3A1E', display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#D4C49A', fontSize: 14, fontWeight: 600,
            }}>
              {(user?.full_name || user?.email || 'U')[0].toUpperCase()}
            </div>
          </div>
          <span style={{ color: 'rgba(213,196,154,0.6)', fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
            {user?.full_name || user?.email || 'My Workspace'}
          </span>
          <button
            onClick={logout}
            title="Sign out"
            style={{ background: 'none', border: 'none', color: 'rgba(213,196,154,0.4)', cursor: 'pointer', padding: 4, flexShrink: 0 }}
            onMouseEnter={e => { e.currentTarget.style.color = '#C8B88A'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(213,196,154,0.4)'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, height: '100vh', zIndex: 60, width: SIDEBAR_EXPANDED }}>
      {sidebarContent()}
    </div>
  );
}