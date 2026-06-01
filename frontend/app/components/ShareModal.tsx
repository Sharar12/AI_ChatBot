'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Share2, Globe, Lock } from 'lucide-react';
import { Chat } from '../types';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  chat: Chat | null;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  chat,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !chat) return null;

  const shareUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/share/${chat.id}`
    : `https://aichat.local/share/${chat.id}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-md rounded-2xl bg-[#161824] border border-white/10 shadow-2xl overflow-hidden p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Share2 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-base font-semibold text-white">Share Conversation</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          Anyone with this link will be able to view a read-only snapshot of this chat thread.
        </p>

        {/* Preview card */}
        <div className="p-3.5 rounded-xl bg-zinc-900/90 border border-white/5 mb-4">
          <h3 className="text-sm font-semibold text-zinc-200 truncate mb-1">
            {chat.title}
          </h3>
          <p className="text-[11px] text-zinc-400">
            {chat.messages.length} messages • Model: {chat.model}
          </p>
        </div>

        {/* Link field */}
        <div className="flex items-center gap-2 p-1.5 rounded-xl bg-zinc-900 border border-white/10 mb-4">
          <input
            type="text"
            readOnly
            value={shareUrl}
            className="flex-1 bg-transparent text-xs text-zinc-300 px-2 outline-none font-mono truncate"
          />
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition shrink-0"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-white" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-2 border-t border-white/5">
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-emerald-400" /> Public snapshot
          </span>
          <span className="flex items-center gap-1">
            <Lock className="w-3.5 h-3.5" /> Excludes sensitive credentials
          </span>
        </div>
      </div>
    </div>
  );
};
