import React, { useState } from 'react';
import { Copy, BookOpen, Check } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

export default function ResultCard({ result, originalInput, onSave }) {
  const [saved, setSaved] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
    toast.success('Copied!');
  };

  const handleSave = async () => {
    if (saved) return;
    try {
      await onSave();
      setSaved(true);
      toast.success('Saved to Library');
    } catch {
      toast.error('Failed to save. Try again.');
    }
  };

  return (
    <div style={{
      width: '100%', maxWidth: 800, marginTop: 24,
    }}>
      <div style={{
        background: '#FDFAF4',
        border: '1px solid rgba(200,184,138,0.25)',
        borderRadius: 16,
        boxShadow: '0 8px 40px rgba(44,58,30,0.08)',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '28px 28px 20px' }}>
          <div style={{
            fontSize: 11, color: '#8A7A5A', fontWeight: 600,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: 16,
          }}>
            Improved Prompt
          </div>

          <div style={{
            fontSize: 15, color: '#1A2410', lineHeight: 1.75,
            fontFamily: "'Inter', -apple-system, sans-serif",
          }}>
            <ReactMarkdown
              components={{
                p: ({ children }) => <p style={{ margin: '0 0 12px' }}>{children}</p>,
                strong: ({ children }) => <strong style={{ fontWeight: 600, color: '#1A2410' }}>{children}</strong>,
                em: ({ children }) => <em style={{ fontStyle: 'italic' }}>{children}</em>,
                ul: ({ children }) => <ul style={{ margin: '0 0 12px', paddingLeft: 20 }}>{children}</ul>,
                ol: ({ children }) => <ol style={{ margin: '0 0 12px', paddingLeft: 20 }}>{children}</ol>,
                li: ({ children }) => <li style={{ marginBottom: 4 }}>{children}</li>,
                h1: ({ children }) => <h1 style={{ fontSize: 20, fontWeight: 600, margin: '16px 0 8px' }}>{children}</h1>,
                h2: ({ children }) => <h2 style={{ fontSize: 18, fontWeight: 600, margin: '14px 0 8px' }}>{children}</h2>,
                h3: ({ children }) => <h3 style={{ fontSize: 16, fontWeight: 600, margin: '12px 0 6px' }}>{children}</h3>,
                code: ({ children }) => <code style={{ background: 'rgba(200,184,138,0.12)', padding: '2px 6px', borderRadius: 4, fontSize: 14 }}>{children}</code>,
                blockquote: ({ children }) => <blockquote style={{ borderLeft: '3px solid #C8B88A', margin: '12px 0', paddingLeft: 16, color: '#6B7A5A' }}>{children}</blockquote>,
              }}
            >
              {result}
            </ReactMarkdown>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid rgba(200,184,138,0.15)',
          padding: '12px 28px 16px',
          display: 'flex', gap: 8,
        }}>
          <button
            onClick={handleCopy}
            style={{
              background: 'rgba(200,184,138,0.08)', border: '1px solid rgba(200,184,138,0.2)',
              color: '#6B7A5A', fontSize: 13, fontWeight: 500, padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 6,
              borderRadius: 8, cursor: 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.15)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(200,184,138,0.08)'; }}
          >
            <Copy size={14} /> Copy
          </button>

          <button
            onClick={handleSave}
            disabled={saved}
            style={{
              background: saved ? '#4A6030' : '#2C3A1E', border: 'none',
              color: '#F5F0E8', fontSize: 13, fontWeight: 500, padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: 6,
              borderRadius: 8, cursor: saved ? 'default' : 'pointer', transition: 'all 150ms',
            }}
            onMouseEnter={e => { if (!saved) e.currentTarget.style.background = '#3A4D28'; }}
            onMouseLeave={e => { if (!saved) e.currentTarget.style.background = '#2C3A1E'; }}
          >
            {saved ? <><Check size={14} /> Saved</> : <><BookOpen size={14} /> Save to Library</>}
          </button>
        </div>
      </div>
    </div>
  );
}