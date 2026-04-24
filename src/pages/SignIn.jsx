import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { authApi } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';

export default function SignIn() {
  const navigate = useNavigate();
  const { checkUserAuth } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (isSignUp) {
        const result = await authApi.register(email, password, fullName);
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
      } else {
        const result = await authApi.login(email, password);
        if (result.token) {
          localStorage.setItem('auth_token', result.token);
        }
      }
      await checkUserAuth();
      navigate('/');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#F5F0E8', padding: 24,
    }}>
      {/* Glow */}
      <div style={{
        position: 'fixed', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 60% 40%, rgba(200,184,138,0.14) 0%, transparent 55%)',
      }} />

      <div style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <Link to="/landing" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, background: '#2C3A1E',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#C8B88A', fontSize: 14, fontWeight: 700,
            }}>Pq</div>
            <span style={{ fontSize: 18, fontWeight: 600, color: '#1A2410', letterSpacing: '-0.02em' }}>
              PromptGenie
            </span>
          </Link>
        </div>

        {/* Card */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(44,58,30,0.3), rgba(200,184,138,0.55), rgba(44,58,30,0.3))',
          padding: '1.5px', borderRadius: 16,
          boxShadow: '0 20px 60px rgba(44,58,30,0.12)',
        }}>
          <div style={{ background: '#FDFAF4', borderRadius: 15, padding: '36px 32px' }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1A2410', marginBottom: 4 }}>
              {isSignUp ? 'Create your account' : 'Welcome back'}
            </h1>
            <p style={{ fontSize: 13, color: '#6B7A5A', marginBottom: 28 }}>
              {isSignUp ? 'Sign up to get started with PromptGenie' : 'Sign in to continue to PromptGenie'}
            </p>

            {error && (
              <div style={{
                background: 'rgba(200,50,50,0.08)', border: '1px solid rgba(200,50,50,0.2)',
                borderRadius: 8, padding: '10px 14px', fontSize: 13, color: '#b33',
                marginBottom: 16,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {isSignUp && (
                <div>
                  <label style={{ fontSize: 12, color: '#6B7A5A', display: 'block', marginBottom: 6 }}>
                    Full Name
                  </label>
                  <div style={{
                    background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.35))',
                    padding: 1, borderRadius: 9,
                  }}>
                    <input
                      type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                      placeholder="Your name" required={isSignUp}
                      style={{
                        width: '100%', height: 42, padding: '0 14px', fontSize: 14,
                        color: '#1A2410', background: '#FDFAF4', border: 'none',
                        borderRadius: 8, outline: 'none', fontFamily: 'inherit',
                      }}
                    />
                  </div>
                </div>
              )}

              <div>
                <label style={{ fontSize: 12, color: '#6B7A5A', display: 'block', marginBottom: 6 }}>
                  Email
                </label>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.35))',
                  padding: 1, borderRadius: 9,
                }}>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    placeholder="you@example.com" required
                    style={{
                      width: '100%', height: 42, padding: '0 14px', fontSize: 14,
                      color: '#1A2410', background: '#FDFAF4', border: 'none',
                      borderRadius: 8, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 12, color: '#6B7A5A', display: 'block', marginBottom: 6 }}>
                  Password
                </label>
                <div style={{
                  background: 'linear-gradient(135deg, rgba(44,58,30,0.2), rgba(200,184,138,0.35))',
                  padding: 1, borderRadius: 9,
                }}>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••" required
                    style={{
                      width: '100%', height: 42, padding: '0 14px', fontSize: 14,
                      color: '#1A2410', background: '#FDFAF4', border: 'none',
                      borderRadius: 8, outline: 'none', fontFamily: 'inherit',
                    }}
                  />
                </div>
              </div>

              <div style={{
                background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)',
                padding: 1, borderRadius: 10, marginTop: 4,
              }}>
                <button
                  type="submit" disabled={loading}
                  style={{
                    width: '100%', height: 44, background: '#2C3A1E', color: '#F5F0E8',
                    fontSize: 14, fontWeight: 500, borderRadius: 9, border: 'none',
                    cursor: 'pointer', transition: 'all 150ms',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                    opacity: loading ? 0.7 : 1,
                  }}
                  onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#3A4D28'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#2C3A1E'; }}
                >
                  {loading ? (isSignUp ? 'Creating account...' : 'Signing in...') : <>{isSignUp ? 'Sign up' : 'Sign in'} <ArrowRight size={15} /></>}
                </button>
              </div>
            </form>

            <div style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: '#6B7A5A' }}>
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{' '}
              <span
                onClick={() => { setIsSignUp(!isSignUp); setEmail(''); setPassword(''); setFullName(''); setError(''); }}
                style={{ color: '#2C3A1E', fontWeight: 600, textDecoration: 'none', cursor: 'pointer' }}
              >
                {isSignUp ? 'Sign in' : 'Sign up free'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: 20 }}>
          <Link to="/landing" style={{ color: '#A0956A', fontSize: 12, textDecoration: 'none' }}>
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}