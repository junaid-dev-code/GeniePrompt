import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, BookOpen, Brain, MessageCircle } from 'lucide-react';

const NAV_LINKS = [
  { label: 'New Prompt', to: '/', icon: Zap },
  { label: 'Library', to: '/library', icon: BookOpen },
  { label: 'Memories', to: '/memories', icon: Brain },
];

export default function Footer() {
  return (
    <footer style={{
      background: '#2C3A1E',
      padding: '28px 40px',
      marginTop: 'auto',
    }}>
      <div style={{
        maxWidth: 900, margin: '0 auto',
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', flexWrap: 'wrap', gap: 24,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <div style={{
              width: 28, height: 28, borderRadius: 6,
              background: 'rgba(200,184,138,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C8B88A', fontSize: 11, fontWeight: 700,
            }}>Pq</div>
            <span style={{ color: '#D4C49A', fontSize: 14, fontWeight: 600, letterSpacing: '-0.02em' }}>
              PromptGenie
            </span>
          </div>
          <p style={{ color: 'rgba(213,196,154,0.4)', fontSize: 12, maxWidth: 200, lineHeight: 1.5 }}>
            Turn your rough ideas into expertly crafted AI prompts.
          </p>
        </div>

        {/* App links */}
        <div>
          <div style={{ color: 'rgba(213,196,154,0.3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            App
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {NAV_LINKS.map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.label} to={link.to} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Icon size={13} style={{ color: 'rgba(213,196,154,0.35)' }} />
                  <span
                    style={{ color: 'rgba(213,196,154,0.55)', fontSize: 13, transition: 'color 150ms' }}
                    onMouseEnter={e => { e.currentTarget.style.color = '#D4C49A'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'rgba(213,196,154,0.55)'; }}
                  >
                    {link.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Help */}
        <div>
          <div style={{ color: 'rgba(213,196,154,0.3)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
            Help
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              { label: 'How it works', to: '/landing' },
              { label: 'About', to: '/landing' },
            ].map(link => (
              <Link key={link.label} to={link.to} style={{ textDecoration: 'none' }}>
                <span
                  style={{ color: 'rgba(213,196,154,0.55)', fontSize: 13, transition: 'color 150ms' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#D4C49A'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'rgba(213,196,154,0.55)'; }}
                >
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{
        maxWidth: 900, margin: '20px auto 0',
        paddingTop: 16, borderTop: '1px solid rgba(200,184,138,0.1)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ color: 'rgba(213,196,154,0.3)', fontSize: 11 }}>
          © {new Date().getFullYear()} PromptGenie. All rights reserved.
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageCircle size={12} style={{ color: 'rgba(213,196,154,0.3)' }} />
          <span style={{ color: 'rgba(213,196,154,0.3)', fontSize: 11 }}>
            Built for makers & thinkers
          </span>
        </div>
      </div>
    </footer>
  );
}