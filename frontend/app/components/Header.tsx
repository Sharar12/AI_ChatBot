'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronDown,
  Sparkles,
  Share2,
  Download,
  Trash2,
  PanelLeft,
  Check,
  BrainCircuit,
  Bot,
  Zap,
} from 'lucide-react';
import { ModelOption } from '../types';
import { AVAILABLE_MODELS } from '../data/sampleChats';

interface HeaderProps {
  currentModelId: string;
  onSelectModel: (modelId: string) => void;
  chatTitle?: string;
  onToggleSidebar: () => void;
  isSidebarCollapsed: boolean;
  onShareChat: () => void;
  onExportChat: () => void;
  onClearChat: () => void;
  hasMessages: boolean;
  isGenerating?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  currentModelId,
  onSelectModel,
  chatTitle,
  onToggleSidebar,
  onShareChat,
  onExportChat,
  onClearChat,
  hasMessages,
  isGenerating,
}) => {
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [serverOnline, setServerOnline] = useState<boolean | null>(null);

  useEffect(() => {
    let mounted = true;
    const checkServer = async () => {
      try {
        const res = await fetch('/api/chat');
        if (res.ok) {
          const data = await res.json();
          if (mounted) setServerOnline(!!data.online);
        } else {
          if (mounted) setServerOnline(false);
        }
      } catch {
        if (mounted) setServerOnline(false);
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const currentModel = AVAILABLE_MODELS.find((m) => m.id === currentModelId) || AVAILABLE_MODELS[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsModelDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="h-14 border-b border-white/5 bg-[#11131a]/80 backdrop-blur-md px-4 flex items-center justify-between z-20 shrink-0 select-none">
      {/* Left section: Sidebar toggle & Model selector */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
          title="Toggle sidebar"
        >
          <PanelLeft className="w-5 h-5" />
        </button>

        {/* Model Selector Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-zinc-800/60 hover:bg-zinc-800 border border-white/5 hover:border-white/10 transition text-zinc-200 text-sm font-medium shadow-xs"
          >
            <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${currentModel.iconColor}`} />
            <span className="font-semibold text-xs sm:text-sm">{currentModel.name}</span>
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md border font-normal ${currentModel.badgeColor}`}>
              {currentModel.badge}
            </span>
            <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform duration-200 ${
              isModelDropdownOpen ? 'rotate-180' : ''
            }`} />
          </button>

          {/* Dropdown Menu */}
          {isModelDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-[#161822] border border-white/10 shadow-2xl p-2 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider flex items-center justify-between border-b border-white/5 mb-1.5">
                <span>Select Intelligence Engine</span>
                <span className="text-[10px] text-indigo-400 font-normal">v3.8 Frontier</span>
              </div>

              <div className="space-y-1">
                {AVAILABLE_MODELS.map((model) => {
                  const isSelected = model.id === currentModelId;
                  return (
                    <button
                      key={model.id}
                      onClick={() => {
                        onSelectModel(model.id);
                        setIsModelDropdownOpen(false);
                      }}
                      className={`w-full text-left p-2.5 rounded-xl transition flex items-start justify-between gap-3 ${
                        isSelected
                          ? 'bg-indigo-600/15 border border-indigo-500/20'
                          : 'hover:bg-zinc-800/60 border border-transparent'
                      }`}
                    >
                      <div className="flex items-start gap-2.5 min-w-0">
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${model.iconColor} flex items-center justify-center shrink-0 mt-0.5 shadow-sm`}>
                          {model.provider === 'Gemini' ? (
                            <Sparkles className="w-4 h-4 text-white" />
                          ) : model.provider === 'Claude' ? (
                            <BrainCircuit className="w-4 h-4 text-white" />
                          ) : (
                            <Bot className="w-4 h-4 text-white" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-zinc-100">
                              {model.name}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded border font-medium ${model.badgeColor}`}>
                              {model.provider}
                            </span>
                          </div>
                          <p className="text-xs text-zinc-400 mt-0.5 line-clamp-1">
                            {model.tagline}
                          </p>
                        </div>
                      </div>

                      {isSelected && (
                        <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-white/5 px-2 flex items-center justify-between text-[11px] text-zinc-500">
                <span className="flex items-center gap-1">
                  <Zap className="w-3 h-3 text-amber-400" /> Auto-switches on heavy code tasks
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Llama Server Status Pill */}
        <div
          title={
            serverOnline === true
              ? 'llama-server is active on http://127.0.0.1:8085 (Gemma 4 E2B)'
              : serverOnline === false
              ? 'llama-server is offline. Run run-llama-server.bat to start it.'
              : 'Checking llama-server status...'
          }
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[11px] font-mono border transition ${
            serverOnline === true
              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
              : serverOnline === false
              ? 'bg-amber-500/10 border-amber-500/20 text-amber-300'
              : 'bg-zinc-800/60 border-white/5 text-zinc-400'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              serverOnline === true
                ? 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]'
                : serverOnline === false
                ? 'bg-amber-400'
                : 'bg-zinc-500'
            }`}
          />
          <span className="font-medium">
            {serverOnline === true
              ? 'llama-server :8085'
              : serverOnline === false
              ? 'llama-server offline'
              : 'llama-server ...'}
          </span>
        </div>
      </div>

      {/* Center chat title on medium/large screens */}
      {chatTitle && (
        <div className="hidden md:flex items-center max-w-xs lg:max-w-md truncate text-xs text-zinc-400 font-medium">
          <span className="truncate">{chatTitle}</span>
        </div>
      )}

      {/* Right action icons */}
      <div className="flex items-center gap-1 sm:gap-2">
        {isGenerating && (
          <span className="hidden sm:inline-flex items-center gap-1.5 text-xs text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20 mr-1 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-ping" />
            Generating...
          </span>
        )}

        {hasMessages && (
          <>
            <button
              onClick={onShareChat}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition flex items-center gap-1.5 text-xs"
              title="Share conversation link"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">Share</span>
            </button>

            <button
              onClick={onExportChat}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/60 transition flex items-center gap-1.5 text-xs"
              title="Export chat as Markdown / JSON"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export</span>
            </button>

            <button
              onClick={onClearChat}
              className="p-2 rounded-xl text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
              title="Clear messages"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </header>
  );
};
