import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import PromptInput from '@/components/prompt-cowboy/PromptInput';
import ModeSwitcher from '@/components/prompt-cowboy/ModeSwitcher';
import DiscoverSection from '@/components/prompt-cowboy/DiscoverSection';
import ResultCard from '@/components/prompt-cowboy/ResultCard';
import TemplateBuilder from '@/components/prompt-cowboy/TemplateBuilder';
import { promptsApi, memoriesApi } from '@/lib/promptsApi';

const SAVED_PROMPT_KEY = 'pg_saved_prompt';
const SAVED_RESULT_KEY = 'pg_saved_result';
const SAVED_ORIGINAL_KEY = 'pg_saved_original';
const SAVED_WORKSPACE_KEY = 'pg_active_workspace';
const DEFAULT_WORKSPACE_ID = 'default-workspace';

export default function Home() {
  const [promptText, setPromptText] = useState(() => localStorage.getItem(SAVED_PROMPT_KEY) || '');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(() => localStorage.getItem(SAVED_RESULT_KEY) || null);
  const [originalInput, setOriginalInput] = useState(() => localStorage.getItem(SAVED_ORIGINAL_KEY) || '');
  const [activeMode, setActiveMode] = useState('prompt');
  const [memories, setMemories] = useState([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState(() => localStorage.getItem(SAVED_WORKSPACE_KEY) || DEFAULT_WORKSPACE_ID);

  useEffect(() => {
    memoriesApi.list().then(setMemories).catch(() => {});
  }, []);

  const workspaceOptions = useMemo(() => {
    const ids = new Set([DEFAULT_WORKSPACE_ID]);
    memories.forEach((m) => {
      if (m.scope === 'workspace' && m.workspace_id) {
        ids.add(m.workspace_id);
      }
    });
    return Array.from(ids);
  }, [memories]);

  const updatePromptText = (text) => {
    setPromptText(text);
    localStorage.setItem(SAVED_PROMPT_KEY, text);
  };

  const handleSend = async () => {
    if (!promptText.trim()) {
      toast.error('Please enter a prompt');
      return;
    }
    setIsLoading(true);
    setOriginalInput(promptText);
    localStorage.setItem(SAVED_ORIGINAL_KEY, promptText);
    setResult(null);
    localStorage.removeItem(SAVED_RESULT_KEY);

    try {
      const improved = await promptsApi.generate(promptText, activeWorkspaceId);
      setResult(improved);
      localStorage.setItem(SAVED_RESULT_KEY, improved);
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveToLibrary = async () => {
    await promptsApi.save(originalInput.substring(0, 80), originalInput, result);
    // refresh sidebar recent prompts on next navigation
  };

  const handleCardClick = (template) => {
    updatePromptText(template);
    setActiveMode('prompt');
    setResult(null);
    localStorage.removeItem(SAVED_RESULT_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUseTemplate = (body) => {
    updatePromptText(body);
    setActiveMode('prompt');
    setResult(null);
    localStorage.removeItem(SAVED_RESULT_KEY);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleToggleMemory = async (id, enabled) => {
    await memoriesApi.update(id, { enabled });
    setMemories(prev => prev.map(m => m.id === id ? { ...m, enabled } : m));
  };

  const handleToggleScope = async (scope, enabled) => {
    const targetMemories = memories.filter((m) => {
      if (m.scope !== scope) return false;
      if (scope === 'workspace') {
        return (m.workspace_id || DEFAULT_WORKSPACE_ID) === activeWorkspaceId;
      }
      return true;
    });

    if (targetMemories.length === 0) return;

    await Promise.all(targetMemories.map((m) => memoriesApi.update(m.id, { enabled })));
    setMemories((prev) => prev.map((m) => {
      const isTarget = targetMemories.some((t) => t.id === m.id);
      return isTarget ? { ...m, enabled } : m;
    }));
  };

  const handleWorkspaceChange = (workspaceId) => {
    setActiveWorkspaceId(workspaceId);
    localStorage.setItem(SAVED_WORKSPACE_KEY, workspaceId);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', position: 'relative' }}>
      {/* Ambient glow */}
      <div style={{
        position: 'absolute', top: 0, right: 0, bottom: 0, left: 0,
        pointerEvents: 'none', zIndex: 0,
        background: 'radial-gradient(ellipse at 75% 35%, rgba(200,184,138,0.13) 0%, transparent 55%)',
      }} />

      <div style={{
        position: 'relative', zIndex: 1, flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center',
      }}>
        <div style={{
          maxWidth: 1000, width: '100%', margin: '0 auto',
          padding: '0 32px', paddingTop: '10vh',
          display: 'flex', flexDirection: 'column', alignItems: 'center',
        }}
        className="max-md:pt-[6vh] max-md:px-4"
        >
          {/* Early pricing banner */}
          <a
            href="/pricing"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '10px 20px', borderRadius: 9999,
              background: 'rgba(200,184,138,0.1)',
              border: '1px solid rgba(200,184,138,0.3)',
              color: '#8A7A5A', fontSize: 13, fontWeight: 500,
              textDecoration: 'none', marginBottom: 48,
              transition: 'all 200ms',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(200,184,138,0.5)';
              e.currentTarget.style.background = 'rgba(200,184,138,0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(200,184,138,0.3)';
              e.currentTarget.style.background = 'rgba(200,184,138,0.1)';
            }}
          >
            Get exclusive early pricing and access to new features
            <span style={{ color: '#C8B88A' }}>→</span>
          </a>

          {/* Hero */}
          <h1 style={{
            fontSize: 42, fontWeight: 400, textAlign: 'center',
            color: '#1A2410', lineHeight: 1.15, marginBottom: 8,
          }}
          className="max-md:text-[28px]"
          >
            Turn lazy prompts into great ones
          </h1>
          <p style={{
            fontSize: 18, fontWeight: 400, textAlign: 'center',
            color: 'rgba(26,36,16,0.55)', marginBottom: 24,
          }}
          className="max-md:text-[15px]"
          >
            Your cheat code to AI that just works
          </p>

          {/* Input - only in prompt mode */}
          {activeMode === 'prompt' && (
            <>
              <div style={{
                width: '100%', maxWidth: 800, marginBottom: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 8,
              }}>
                <span style={{ fontSize: 12, color: '#6B7A5A' }}>Active workspace</span>
                <select
                  value={activeWorkspaceId}
                  onChange={(e) => handleWorkspaceChange(e.target.value)}
                  style={{
                    height: 30, borderRadius: 7, border: '1px solid rgba(200,184,138,0.35)',
                    background: '#FDFAF4', color: '#1A2410', fontSize: 12, padding: '0 10px',
                  }}
                >
                  {workspaceOptions.map((id) => (
                    <option key={id} value={id}>{id}</option>
                  ))}
                </select>
              </div>
              <PromptInput
                value={promptText}
                onChange={updatePromptText}
                onSend={handleSend}
                isLoading={isLoading}
                memories={memories}
                onToggleMemory={handleToggleMemory}
                onToggleScope={handleToggleScope}
                activeWorkspaceId={activeWorkspaceId}
              />
            </>
          )}

          {/* Mode switcher */}
          <ModeSwitcher activeMode={activeMode} onModeChange={setActiveMode} />

          {/* Template mode */}
          {activeMode === 'template' && (
            <TemplateBuilder onUseTemplate={handleUseTemplate} />
          )}

          {/* Loading shimmer */}
          {isLoading && activeMode === 'prompt' && (
            <div style={{
              width: '100%', maxWidth: 800, height: 120,
              borderRadius: 14, marginTop: 24,
              background: 'linear-gradient(90deg, rgba(200,184,138,0.08) 25%, rgba(200,184,138,0.16) 50%, rgba(200,184,138,0.08) 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }} />
          )}

          {/* Result */}
          {result && activeMode === 'prompt' && (
            <ResultCard
              result={result}
              originalInput={originalInput}
              onSave={handleSaveToLibrary}
            />
          )}

          {/* Discover section - only when no result and in prompt mode */}
          {!result && !isLoading && activeMode === 'prompt' && (
            <DiscoverSection onCardClick={handleCardClick} />
          )}

          {/* Spacer */}
          <div style={{ height: 60 }} />
        </div>
      </div>

    </div>
  );
}