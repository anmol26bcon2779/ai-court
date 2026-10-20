import React, { useState } from 'react';
import { X, Settings, Volume2, VolumeX, Key, Database, ShieldCheck, Check, Sparkles } from 'lucide-react';
import { AppSettings, storageService } from '../services/storage';
import { soundService } from '../services/sound';
import { isSupabaseConfigured } from '../services/supabase';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsSaved: (settings: AppSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onSettingsSaved,
}) => {
  const currentSettings = storageService.getSettings();
  const [soundEnabled, setSoundEnabled] = useState(currentSettings.soundEnabled);
  const [llmProvider, setLlmProvider] = useState(currentSettings.llmProvider);
  const [apiKey, setApiKey] = useState(currentSettings.apiKey);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const hasSupabase = isSupabaseConfigured();

  const handleTestSound = () => {
    soundService.playGavel();
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: AppSettings = {
      soundEnabled,
      llmProvider,
      apiKey: apiKey.trim(),
    };
    storageService.saveSettings(updated);
    soundService.setMuted(!soundEnabled);
    onSettingsSaved(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg p-6 rounded-2xl bg-court-card border border-court-gold/30 shadow-gold-lg">
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-court-gold" />
            <h3 className="font-cinzel text-lg font-bold text-white">Courtroom Settings</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-5 text-xs">
          
          {/* Sound Settings */}
          <div className="p-4 rounded-xl bg-court-surface border border-court-border">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Courtroom Sound Effects</span>
                <span className="text-slate-400">Synthesized gavels, objections, and clock ticks</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestSound}
                  className="px-2 py-1 rounded bg-court-dark border border-court-border text-[11px] text-court-gold hover:text-white"
                >
                  Test Gavel
                </button>
                <button
                  type="button"
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`p-2 rounded-lg border ${
                    soundEnabled ? 'bg-court-gold/20 text-court-gold border-court-gold/40' : 'bg-court-dark text-slate-500 border-court-border'
                  }`}
                >
                  {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* AI Magistrate & Opponent Provider */}
          <div className="p-4 rounded-xl bg-court-surface border border-court-border space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Key className="w-4 h-4 text-court-gold" /> AI Engine Configuration
              </span>
              <span className="text-[10px] font-mono text-court-gold bg-court-gold/15 px-2 py-0.5 rounded">
                Live Switchable
              </span>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">AI Magistrate Provider</label>
              <select
                value={llmProvider}
                onChange={e => setLlmProvider(e.target.value as 'heuristic' | 'gemini' | 'custom')}
                className="w-full px-3 py-2 text-xs bg-court-dark border border-court-border rounded-lg text-white focus:outline-none focus:border-court-gold"
              >
                <option value="heuristic">Built-in AI Magistrate (Fast, zero API key needed, offline)</option>
                <option value="gemini">Google Gemini API (Live generative AI rulings & dialogue)</option>
              </select>
            </div>

            {llmProvider === 'gemini' && (
              <div>
                <label className="block text-slate-300 mb-1">Google Gemini API Key</label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={e => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full px-3 py-2 text-xs bg-court-dark border border-court-border rounded-lg text-white font-mono focus:outline-none focus:border-court-gold"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Keys are stored exclusively in your browser localStorage and never transmitted to any third-party server.
                </p>
              </div>
            )}
          </div>

          {/* Supabase Realtime & Database Status */}
          <div className="p-4 rounded-xl bg-court-surface border border-court-border space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-white flex items-center gap-1.5">
                <Database className="w-4 h-4 text-sky-400" /> Supabase Backend Status
              </span>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded ${
                hasSupabase ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'
              }`}>
                {hasSupabase ? 'CONNECTED' : 'LOCAL DEMO MODE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-light">
              {hasSupabase 
                ? 'Supabase PostgreSQL, Auth, and Realtime are active. Lobbies and verdicts synchronize across remote players.'
                : 'Running in Local Demo Mode. Peer multiplayer uses fast multi-tab BroadcastChannel. To connect remote Supabase, set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'}
            </p>
          </div>

          {/* Save Action */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1 px-5 py-2 rounded-xl font-cinzel font-bold bg-court-gold hover:bg-amber-400 text-black shadow-gold-sm transition-all"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              {savedSuccess ? 'SAVED' : 'SAVE SETTINGS'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
