'use client';

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sparkles,
  Server,
  Save,
  Check,
  Shield,
  Palette,
  Key,
  ExternalLink,
} from 'lucide-react';
import { UserSettings } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveSettings,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'model' | 'api'>('general');
  const [currentSettings, setCurrentSettings] = useState<UserSettings>(settings);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveSettings(currentSettings);
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-2xl bg-[#161824] border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">System Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs Bar */}
        <div className="flex border-b border-white/5 px-6 gap-6 text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'general'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            General
          </button>

          <button
            onClick={() => setActiveTab('model')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'model'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Model & Prompt
          </button>

          <button
            onClick={() => setActiveTab('api')}
            className={`py-3 border-b-2 transition flex items-center gap-2 ${
              activeTab === 'api'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            API Keys & Backend
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm text-zinc-300">
          {activeTab === 'general' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-2">
                  Color Theme
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setCurrentSettings({ ...currentSettings, theme: 'dark' })}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      currentSettings.theme === 'dark'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white'
                        : 'bg-zinc-800/40 border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs">Obsidian Dark</p>
                      <p className="text-[11px] text-zinc-500">Gemini/Claude high contrast</p>
                    </div>
                    {currentSettings.theme === 'dark' && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>

                  <button
                    onClick={() => setCurrentSettings({ ...currentSettings, theme: 'light' })}
                    className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                      currentSettings.theme === 'light'
                        ? 'bg-indigo-600/15 border-indigo-500 text-white'
                        : 'bg-zinc-800/40 border-white/5 text-zinc-400 hover:text-zinc-200'
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-xs">Clean Light</p>
                      <p className="text-[11px] text-zinc-500">Minimal daylight canvas</p>
                    </div>
                    {currentSettings.theme === 'light' && <Check className="w-4 h-4 text-indigo-400" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-zinc-200">Audio & Sound FX</p>
                  <p className="text-[11px] text-zinc-500">Play subtle click chimes on response completion</p>
                </div>
                <input
                  type="checkbox"
                  checked={currentSettings.soundEnabled}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, soundEnabled: e.target.checked })
                  }
                  className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                />
              </div>
            </div>
          )}

          {activeTab === 'model' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                  Custom System Instructions (Persona)
                </label>
                <textarea
                  rows={4}
                  value={currentSettings.systemPrompt}
                  onChange={(e) =>
                    setCurrentSettings({ ...currentSettings, systemPrompt: e.target.value })
                  }
                  className="w-full bg-zinc-900 border border-white/10 rounded-xl p-3 text-xs text-zinc-200 outline-none focus:border-indigo-500 leading-relaxed font-mono"
                  placeholder="e.g. You are a senior full-stack architect. Always respond with concise code and clear explanations."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-medium text-zinc-400">
                    Creativity (Temperature)
                  </label>
                  <span className="text-xs font-mono text-indigo-400">
                    {currentSettings.temperature}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1.5"
                  step="0.1"
                  value={currentSettings.temperature}
                  onChange={(e) =>
                    setCurrentSettings({
                      ...currentSettings,
                      temperature: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
                  <span>Precise (0.0)</span>
                  <span>Balanced (0.7)</span>
                  <span>Creative (1.5)</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4">
              {/* Live LLM API Key section */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-950/50 to-purple-950/40 border border-indigo-500/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Key className="w-4 h-4 text-indigo-400" />
                    <span className="font-semibold text-xs text-zinc-100">Live AI API Key</span>
                  </div>
                  <a
                    href="https://aistudio.google.com/app/apikey"
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1 text-[11px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Get free Gemini Key <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  Enter an API key to talk directly to live AI models. Stored locally in your browser only.
                </p>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <select
                      value={currentSettings.apiProvider || 'gemini'}
                      onChange={(e) =>
                        setCurrentSettings({
                          ...currentSettings,
                          apiProvider: e.target.value as any,
                        })
                      }
                      className="bg-zinc-900 border border-white/10 rounded-lg px-2.5 py-1.5 text-xs text-zinc-200 outline-none"
                    >
                      <option value="gemini">Google Gemini (Free tier)</option>
                      <option value="openai">OpenAI (GPT-4o)</option>
                      <option value="openrouter">OpenRouter (Claude/DeepSeek)</option>
                    </select>
                  </div>

                  <input
                    type="password"
                    value={currentSettings.apiKey || ''}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, apiKey: e.target.value.trim() })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-mono"
                    placeholder="AIzaSy... or sk-..."
                  />
                </div>
              </div>

              {/* Laravel Backend Section */}
              <div className="pt-2 border-t border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-zinc-200">
                      Route via Laravel Backend API
                    </p>
                    <p className="text-[11px] text-zinc-500">
                      When enabled, prompts are routed to your Laravel server at {currentSettings.backendApiUrl}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={currentSettings.useBackendApi}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, useBackendApi: e.target.checked })
                    }
                    className="w-4 h-4 accent-indigo-600 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Backend API Base URL
                  </label>
                  <input
                    type="text"
                    value={currentSettings.backendApiUrl}
                    onChange={(e) =>
                      setCurrentSettings({ ...currentSettings, backendApiUrl: e.target.value })
                    }
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-zinc-200 outline-none focus:border-indigo-500 font-mono"
                    placeholder="http://127.0.0.1:8000/api"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-white/5 bg-[#12141d]">
          <span className="text-[11px] text-zinc-500 flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" /> Client encrypted storage
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs text-zinc-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shadow-md shadow-indigo-600/20"
            >
              {savedNotice ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
