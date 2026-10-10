'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Pin,
  Trash2,
  Edit2,
  Check,
  X,
  Settings,
  Sun,
  Moon,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { Chat, UserSettings } from '../types';

interface SidebarProps {
  chats: Chat[];
  activeChatId: string | null;
  onSelectChat: (id: string) => void;
  onNewChat: () => void;
  onDeleteChat: (id: string) => void;
  onRenameChat: (id: string, newTitle: string) => void;
  onTogglePin: (id: string) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  settings: UserSettings;
  onOpenSettings: () => void;
  onToggleTheme: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
  onRenameChat,
  onTogglePin,
  isCollapsed,
  onToggleCollapse,
  settings,
  onOpenSettings,
  onToggleTheme,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const [todayStart, setTodayStart] = useState<number>(0);

  useEffect(() => {
    setTodayStart(new Date().setHours(0, 0, 0, 0));
  }, []);

  // Compute active conversation context tokens
  const activeChat = useMemo(() => chats.find((c) => c.id === activeChatId), [chats, activeChatId]);

  const activeChatTokens = useMemo(() => {
    if (!activeChat || !activeChat.messages) return 0;
    return activeChat.messages.reduce((acc, m) => {
      if (typeof m.tokens === 'number') return acc + m.tokens;
      const textLen = (m.content || '').length + (m.thinking || '').length;
      return acc + Math.max(1, Math.ceil(textLen / 3.8));
    }, 0);
  }, [activeChat]);

  // Total session tokens across all chats
  const totalSessionTokens = useMemo(() => {
    return chats.reduce((acc, c) => {
      const chatTokens = (c.messages || []).reduce((mAcc, m) => {
        if (typeof m.tokens === 'number') return mAcc + m.tokens;
        const textLen = (m.content || '').length + (m.thinking || '').length;
        return mAcc + Math.max(1, Math.ceil(textLen / 3.8));
      }, 0);
      return acc + chatTokens;
    }, 0);
  }, [chats]);

  const maxContextTokens = 128000;
  const contextPercentage = Math.min(100, Math.round((activeChatTokens / maxContextTokens) * 100 * 10) / 10);

  // Group chats by date and pin status
  const { pinnedChats, todayChats, yesterdayChats, olderChats } = useMemo(() => {
    const oneDay = 24 * 60 * 60 * 1000;

    const filtered = chats.filter((chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some((m) => m.content.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const pinned: Chat[] = [];
    const today: Chat[] = [];
    const yesterday: Chat[] = [];
    const older: Chat[] = [];

    filtered.forEach((chat) => {
      if (chat.pinned) {
        pinned.push(chat);
        return;
      }

      if (chat.updatedAt >= todayStart) {
        today.push(chat);
      } else if (chat.updatedAt >= todayStart - oneDay) {
        yesterday.push(chat);
      } else {
        older.push(chat);
      }
    });

    return {
      pinnedChats: pinned,
      todayChats: today,
      yesterdayChats: yesterday,
      olderChats: older,
    };
  }, [chats, searchQuery]);

  const startEditing = (chat: Chat, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingChatId(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveRename = (chatId: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      onRenameChat(chatId, editTitle.trim());
    }
    setEditingChatId(null);
  };

  const renderChatItem = (chat: Chat) => {
    const isActive = activeChatId === chat.id;
    const isEditing = editingChatId === chat.id;

    return (
      <div
        key={chat.id}
        onClick={() => onSelectChat(chat.id)}
        className={`group relative flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer text-sm transition-all duration-150 select-none ${
          isActive
            ? 'bg-indigo-600/15 text-indigo-300 font-medium border border-indigo-500/20 shadow-sm'
            : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40 border border-transparent'
        }`}
      >
        <MessageSquare
          className={`w-4 h-4 shrink-0 transition-colors ${
            isActive ? 'text-indigo-400' : 'text-zinc-500 group-hover:text-zinc-300'
          }`}
        />

        {isEditing ? (
          <form
            onSubmit={(e) => handleSaveRename(chat.id, e)}
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center gap-1 min-w-0"
          >
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              autoFocus
              className="w-full bg-zinc-900 text-xs px-2 py-1 rounded border border-indigo-500 text-zinc-100 outline-none"
            />
            <button
              type="submit"
              className="p-1 hover:text-emerald-400 text-zinc-400 transition"
              title="Save"
            >
              <Check className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditingChatId(null)}
              className="p-1 hover:text-rose-400 text-zinc-400 transition"
              title="Cancel"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </form>
        ) : (
          <>
            <span className="truncate flex-1 text-xs sm:text-sm font-normal">
              {chat.title}
            </span>

            {/* Hover actions */}
            <div
              className={`items-center gap-0.5 shrink-0 transition-opacity ${
                isActive ? 'flex' : 'hidden group-hover:flex'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onTogglePin(chat.id);
                }}
                title={chat.pinned ? 'Unpin' : 'Pin to top'}
                className={`p-1 rounded hover:bg-white/10 transition ${
                  chat.pinned ? 'text-amber-400' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Pin className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => startEditing(chat, e)}
                title="Rename chat"
                className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/10 transition"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
                title="Delete chat"
                className="p-1 rounded text-zinc-400 hover:text-rose-400 hover:bg-white/10 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`h-screen flex flex-col shrink-0 border-r transition-all duration-300 relative z-30 select-none ${
        isCollapsed ? 'w-[68px]' : 'w-72 md:w-80'
      } bg-[#11131a] border-white/5 text-zinc-300`}
    >
      {/* Top Header */}
      <div className="p-3.5 flex items-center justify-between border-b border-white/5 gap-2">
        <div
          className={`flex items-center gap-2.5 overflow-hidden transition-all ${
            isCollapsed ? 'justify-center w-full' : ''
          }`}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm tracking-tight text-white">
                  A.I. Chat
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full font-medium bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-xs">
                  PRO
                </span>
              </div>
              <span className="text-[11px] text-zinc-400 truncate">
                Gemini • Claude • GPT-4o
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {!isCollapsed && (
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800/60 transition"
            title="Collapse sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-medium shadow-md shadow-indigo-600/20 transition-all active:scale-[0.98] ${
            isCollapsed ? 'p-2.5' : ''
          }`}
          title="Start new conversation (Ctrl+N)"
        >
          <Plus className="w-4 h-4 shrink-0 stroke-[2.5]" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Search Input (visible if expanded) */}
      {!isCollapsed && (
        <div className="px-3 pb-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#181a24] text-xs pl-8 pr-7 py-2 rounded-lg text-zinc-200 placeholder-zinc-500 border border-white/5 focus:border-indigo-500/50 outline-none transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Chat History List */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 scroll-smooth">
        {isCollapsed ? (
          <div className="flex flex-col items-center gap-2">
            {chats.slice(0, 10).map((chat) => (
              <button
                key={chat.id}
                onClick={() => onSelectChat(chat.id)}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                  activeChatId === chat.id
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                }`}
                title={chat.title}
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            ))}
          </div>
        ) : (
          <>
            {/* Pinned section */}
            {pinnedChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 text-[11px] font-medium text-amber-400/90 tracking-wider uppercase flex items-center gap-1.5">
                  <Pin className="w-3 h-3" /> Pinned
                </div>
                {pinnedChats.map(renderChatItem)}
              </div>
            )}

            {/* Today */}
            {todayChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
                  Today
                </div>
                {todayChats.map(renderChatItem)}
              </div>
            )}

            {/* Yesterday */}
            {yesterdayChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
                  Yesterday
                </div>
                {yesterdayChats.map(renderChatItem)}
              </div>
            )}

            {/* Older */}
            {olderChats.length > 0 && (
              <div className="space-y-1">
                <div className="px-2.5 text-[11px] font-medium text-zinc-400 tracking-wider uppercase">
                  Previous 7 Days & Older
                </div>
                {olderChats.map(renderChatItem)}
              </div>
            )}

            {chats.length === 0 && (
              <div className="text-center py-8 text-xs text-zinc-500">
                No conversations yet
              </div>
            )}
          </>
        )}
      </div>

      {/* Expand Button for Collapsed State */}
      {isCollapsed && (
        <div className="p-3 border-t border-white/5 flex justify-center">
          <button
            onClick={onToggleCollapse}
            className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            title="Expand sidebar"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Footer Profile & Settings */}
      {!isCollapsed && (
        <div className="p-3 border-t border-white/5 space-y-2 bg-[#0e1017]">
          {/* Dynamic Context Window & Token Meter */}
          <div className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/10">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="flex items-center gap-1.5 text-indigo-300 font-medium">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                Context Window
              </span>
              <span className="text-zinc-400 text-[11px] font-mono">
                {activeChatTokens >= 1000
                  ? `${(activeChatTokens / 1000).toFixed(1)}k`
                  : activeChatTokens}{' '}
                / 128k
              </span>
            </div>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  contextPercentage > 85
                    ? 'bg-rose-500'
                    : contextPercentage > 60
                    ? 'bg-amber-500'
                    : 'bg-gradient-to-r from-indigo-500 to-purple-500'
                }`}
                style={{ width: `${Math.max(activeChatTokens > 0 ? 1 : 0, contextPercentage)}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-[10px] text-zinc-500 mt-1.5 pt-0.5">
              <span>{contextPercentage}% used</span>
              <span>Total: {totalSessionTokens >= 1000 ? `${(totalSessionTokens / 1000).toFixed(1)}k` : totalSessionTokens} tok</span>
            </div>
          </div>

          {/* User profile & actions */}
          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-700 text-white font-semibold text-xs flex items-center justify-center ring-2 ring-indigo-500/30">
                SH
              </div>
              <div className="truncate">
                <p className="text-xs font-semibold text-zinc-200 truncate">
                  Sharar Hossain
                </p>
                <p className="text-[10px] text-zinc-500 truncate">
                  Ultra Member
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={onToggleTheme}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
                title={`Switch to ${settings.theme === 'dark' ? 'Light' : 'Dark'} mode`}
              >
                {settings.theme === 'dark' ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </button>

              <button
                onClick={onOpenSettings}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
                title="Settings & API config"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
};
