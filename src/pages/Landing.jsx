import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Brain, BookOpen, ArrowRight, Sparkles } from 'lucide-react';

const FEATURES = [
  { icon: Zap, title: 'Instant Improvement' },
  { icon: Brain, title: 'Smart Memories' },
  { icon: BookOpen, title: 'Prompt Library' },
  { icon: Sparkles, title: 'Reusable Templates' },
];

export default function Landing() {
  const navigate = useNavigate();
  const [transitioning, setTransitioning] = useState(false);

  const handleGetStarted = (e) => {
    e.preventDefault();
    setTransitioning(true);
    setTimeout(() => navigate('/signin'), 500);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      opacity: transitioning ? 0 : 1,
      transition: 'opacity 500ms ease',
    }}>
      {/* Ambient glow */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, left: 0,
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 75% 25%, rgba(200,184,138,0.15) 0%, transparent 55%)',
      }} />

      <div style={{ position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {/* Nav */}
        <nav style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '20px 40px', maxWidth: 1100, margin: '0 auto', width: '100%',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 8, background: '#2C3A1E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C8B88A', fontSize: 13, fontWeight: 700,
            }}>
              Pq
            </div>
            <span style={{ fontSize: 16, fontWeight: 600, color: '#1A2410', letterSpacing: '-0.02em' }}>
              PromptGenie
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Link to="/signin" style={{ textDecoration: 'none', color: '#6B7A5A', fontSize: 13, fontWeight: 500 }}>
              Sign in
            </Link>
            <div style={{ background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)', padding: 1, borderRadius: 9 }}>
              <button
                onClick={handleGetStarted}
                style={{
                  background: '#2C3A1E', color: '#F5F0E8', padding: '9px 22px',
                  fontSize: 13, fontWeight: 500, borderRadius: 8, border: 'none',
                  cursor: 'pointer', transition: 'all 150ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3A4D28'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2C3A1E'; }}
              >
                Get Started
              </button>
            </div>
          </div>
        </nav>

        {/* Hero — centered, minimal */}
        <div style={{ textAlign: 'center', padding: '0 32px', maxWidth: 600 }}>
          <h1 style={{ fontSize: 48, fontWeight: 400, color: '#1A2410', lineHeight: 1.15, marginBottom: 12 }}>
            Better prompts.
            <br />
            <span style={{ color: '#8A7A5A' }}>Better results.</span>
          </h1>

          <p style={{ fontSize: 16, color: 'rgba(26,36,16,0.5)', marginBottom: 32 }}>
            Turn rough ideas into expert prompts — instantly.
          </p>

          <button
            onClick={handleGetStarted}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: '#2C3A1E', color: '#F5F0E8',
              padding: '14px 36px', fontSize: 15, fontWeight: 500,
              borderRadius: 10, border: '2px solid transparent',
              backgroundImage: 'linear-gradient(#2C3A1E, #2C3A1E), linear-gradient(135deg, #2C3A1E, #C8B88A)',
              backgroundOrigin: 'border-box', backgroundClip: 'padding-box, border-box',
              cursor: 'pointer', transition: 'all 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.backgroundImage = 'linear-gradient(#3A4D28, #3A4D28), linear-gradient(135deg, #2C3A1E, #C8B88A)'; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundImage = 'linear-gradient(#2C3A1E, #2C3A1E), linear-gradient(135deg, #2C3A1E, #C8B88A)'; }}
          >
            Try it free <ArrowRight size={16} />
          </button>
        </div>

        {/* Feature pills */}
        <div style={{
          display: 'flex', gap: 12, marginTop: 48, flexWrap: 'wrap', justifyContent: 'center', padding: '0 32px',
        }}>
          {FEATURES.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', borderRadius: 9999,
                background: 'rgba(200,184,138,0.08)',
                border: '1px solid rgba(200,184,138,0.2)',
              }}>
                <Icon size={14} style={{ color: '#C8B88A' }} />
                <span style={{ fontSize: 13, color: '#6B7A5A', fontWeight: 500 }}>{feature.title}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}