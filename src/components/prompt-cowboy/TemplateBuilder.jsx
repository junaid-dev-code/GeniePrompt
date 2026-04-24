import React, { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { promptsApi } from '@/lib/promptsApi';

export default function TemplateBuilder({ onUseTemplate }) {
  const [templateBody, setTemplateBody] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedTemplates, setSavedTemplates] = useState(() => {
    const stored = localStorage.getItem('prompt_cowboy_templates');
    return stored ? JSON.parse(stored) : [];
  });

  const variables = useMemo(() => {
    const matches = templateBody.match(/\[([^\]]+)\]/g);
    return matches ? [...new Set(matches)] : [];
  }, [templateBody]);

  const handleSave = async () => {
    if (!templateBody.trim()) { toast.error('Please enter a template'); return; }
    if (!templateName.trim()) { toast.error('Please name your template'); return; }
    setSaving(true);
    await promptsApi.save(templateName, templateBody, templateBody);
    const newTemplate = { name: templateName, body: templateBody, id: Date.now() };
    const updated = [newTemplate, ...savedTemplates];
    setSavedTemplates(updated);
    localStorage.setItem('prompt_cowboy_templates', JSON.stringify(updated));
    toast.success('Template saved!');
    setTemplateName('');
    setTemplateBody('');
    setSaving(false);
  };

  const handleTextareaInput = (e) => {
    setTemplateBody(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = e.target.scrollHeight + 'px';
  };

  return (
    <div style={{ width: '100%', maxWidth: 800, marginTop: 24 }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(44,58,30,0.4), rgba(200,184,138,0.6), rgba(44,58,30,0.4))',
        padding: '1.5px', borderRadius: 15,
      }}>
        <div style={{
          background: 'rgba(253,250,244,0.95)', borderRadius: 14, padding: 24,
        }}>
          <h3 style={{ fontSize: 22, color: '#1A2410', fontWeight: 400, marginBottom: 4 }}>
            Build a reusable template
          </h3>
          <p style={{ fontSize: 13, color: '#6B7A5A', marginBottom: 20 }}>
            Create a prompt with [variables] you can fill in each time
          </p>

          {/* Template textarea */}
          <textarea
            value={templateBody}
            onChange={handleTextareaInput}
            placeholder="Write your template here. Use [variable_name] for parts you want to change each time. Example: Write a professional email to [recipient] about [topic]."
            style={{
              width: '100%', background: 'transparent',
              border: '1px solid rgba(200,184,138,0.3)', outline: 'none',
              padding: '16px 20px', fontSize: 14, color: '#1A2410',
              minHeight: 120, maxHeight: 300, resize: 'none',
              borderRadius: 10, lineHeight: 1.5, fontFamily: 'inherit',
            }}
          />

          {/* Variables */}
          {variables.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <div style={{ fontSize: 12, color: '#6B7A5A', marginBottom: 8 }}>
                Variables detected
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                {variables.map(v => (
                  <span key={v} style={{
                    background: 'rgba(200,184,138,0.15)',
                    border: '1px solid rgba(200,184,138,0.4)',
                    color: '#8A7A5A', fontSize: 11, fontWeight: 500,
                    padding: '3px 10px', borderRadius: 9999,
                  }}>
                    {v}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Template name */}
          <div style={{ marginTop: 20 }}>
            <label style={{ fontSize: 12, color: '#6B7A5A', display: 'block', marginBottom: 4 }}>
              Template name
            </label>
            <input
              value={templateName}
              onChange={e => setTemplateName(e.target.value)}
              placeholder="Give your template a name..."
              style={{
                width: '100%', background: 'transparent',
                border: 'none', borderBottom: '1.5px solid rgba(200,184,138,0.4)',
                outline: 'none', padding: '6px 0', fontSize: 14, color: '#1A2410',
                fontFamily: 'inherit',
              }}
              onFocus={e => { e.target.style.borderBottomColor = '#C8B88A'; }}
              onBlur={e => { e.target.style.borderBottomColor = 'rgba(200,184,138,0.4)'; }}
            />
          </div>

          {/* Save button */}
          <div style={{ marginTop: 20 }}>
            <div style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2C3A1E, #C8B88A)',
              padding: 1, borderRadius: 9,
            }}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: '#2C3A1E', color: '#F5F0E8',
                  padding: '10px 28px', fontSize: 13, fontWeight: 500,
                  borderRadius: 8, border: 'none', cursor: 'pointer',
                  transition: 'all 150ms', opacity: saving ? 0.7 : 1,
                }}
                onMouseEnter={e => { e.currentTarget.style.background = '#3A4D28'; }}
                onMouseLeave={e => { e.currentTarget.style.background = '#2C3A1E'; }}
              >
                {saving ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Saved templates */}
      {savedTemplates.length > 0 && (
        <div style={{ marginTop: 32 }}>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: '#1A2410', marginBottom: 16 }}>
            Your Templates
          </h3>
          <div style={{ display: 'grid', gap: 12 }}>
            {savedTemplates.map(t => (
              <div key={t.id} style={{
                background: 'linear-gradient(135deg, rgba(44,58,30,0.25), rgba(200,184,138,0.5), rgba(44,58,30,0.25))',
                padding: 1, borderRadius: 11,
              }}>
                <div style={{
                  background: '#FDFAF4', borderRadius: 10, padding: '14px 18px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#1A2410' }}>
                      {t.name}
                    </div>
                    <div className="line-clamp-2" style={{ fontSize: 12, color: '#6B7A5A', marginTop: 2 }}>
                      {t.body}
                    </div>
                  </div>
                  <button
                    onClick={() => onUseTemplate(t.body)}
                    style={{
                      background: 'rgba(44,58,30,0.08)',
                      border: '1px solid rgba(44,58,30,0.15)',
                      color: '#2C3A1E', fontSize: 11, padding: '4px 12px',
                      borderRadius: 6, cursor: 'pointer', marginLeft: 12,
                      whiteSpace: 'nowrap', transition: 'all 150ms',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(44,58,30,0.15)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(44,58,30,0.08)'; }}
                  >
                    Use this
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}