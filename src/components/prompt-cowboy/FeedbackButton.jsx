import React from 'react';
import { Megaphone } from 'lucide-react';

export default function FeedbackButton() {
  return (
    <>
      {/* Desktop */}
      <button
        className="hidden sm:flex"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 40,
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '8px 14px 8px 10px',
          background: 'rgba(44,58,30,0.88)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(200,184,138,0.25)',
          borderRadius: 9999, cursor: 'pointer',
          transition: 'all 200ms',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'rgba(44,58,30,0.96)';
          e.currentTarget.style.borderColor = 'rgba(200,184,138,0.4)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'rgba(44,58,30,0.88)';
          e.currentTarget.style.borderColor = 'rgba(200,184,138,0.25)';
        }}
      >
        <span style={{
          background: 'rgba(200,184,138,0.15)', color: '#C8B88A',
          fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999,
        }}>
          BETA
        </span>
        <span style={{ color: 'rgba(213,196,154,0.75)', fontSize: 13 }}>Feedback</span>
      </button>

      {/* Mobile */}
      <button
        className="sm:hidden flex"
        style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 40,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(44,58,30,0.88)',
          border: '1px solid rgba(200,184,138,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', color: '#C8B88A',
        }}
      >
        <Megaphone size={16} />
      </button>
    </>
  );
}