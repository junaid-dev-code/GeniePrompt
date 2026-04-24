import React from 'react';
import { Sparkles, Mail, Code, Pen, BarChart3, Lightbulb } from 'lucide-react';

const EXAMPLES = [
  { icon: Mail, label: 'Write a cold email', prompt: 'Write a cold email to a potential client about our new SaaS product' },
  { icon: Code, label: 'Debug my code', prompt: 'Help me debug this function that is returning undefined instead of the expected value' },
  { icon: Pen, label: 'Blog post outline', prompt: 'Create an outline for a blog post about the future of AI in healthcare' },
  { icon: BarChart3, label: 'Analyze data', prompt: 'Analyze this sales data and identify the top 3 trends and recommendations' },
  { icon: Lightbulb, label: 'Brainstorm ideas', prompt: 'Brainstorm 10 creative marketing campaign ideas for a sustainable fashion brand' },
  { icon: Sparkles, label: 'Improve my pitch', prompt: 'Improve my startup pitch to make it more compelling for investors' },
];

export default function DiscoverSection({ onCardClick }) {
  return (
    <div style={{ width: '100%', maxWidth: 800, marginTop: 40 }}>
      <div style={{
        fontSize: 13, fontWeight: 500, color: '#8A7A5A',
        textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16,
      }}>
        Try an example
      </div>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))',
        gap: 10,
      }}>
        {EXAMPLES.map((ex) => {
          const Icon = ex.icon;
          return (
            <button
              key={ex.label}
              onClick={() => onCardClick(ex.prompt)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 14px', borderRadius: 10,
                background: 'rgba(200,184,138,0.06)',
                border: '1px solid rgba(200,184,138,0.2)',
                cursor: 'pointer', textAlign: 'left',
                transition: 'all 150ms',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(200,184,138,0.12)';
                e.currentTarget.style.borderColor = 'rgba(200,184,138,0.35)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(200,184,138,0.06)';
                e.currentTarget.style.borderColor = 'rgba(200,184,138,0.2)';
              }}
            >
              <Icon size={16} style={{ color: '#C8B88A', flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: '#1A2410', fontWeight: 500 }}>{ex.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}