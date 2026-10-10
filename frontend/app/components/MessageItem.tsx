'use client';

import React, { useState } from 'react';
import {
  User,
  Sparkles,
  Bot,
  BrainCircuit,
  Copy,
  Check,
  ThumbsUp,
  ThumbsDown,
  RotateCcw,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronRight,
  FileText,
  Download,
  Eye,
  Globe,
  Terminal,
  Zap,
} from 'lucide-react';
import { Message, Attachment } from '../types';
import { AVAILABLE_MODELS } from '../data/sampleChats';

interface MessageItemProps {
  message: Message;
  onFeedback: (messageId: string, feedback: 'like' | 'dislike') => void;
  onRegenerate?: () => void;
  onPreviewImage: (attachment: Attachment) => void;
  isStreaming?: boolean;
}

export const MessageItem: React.FC<MessageItemProps> = ({
  message,
  onFeedback,
  onRegenerate,
  onPreviewImage,
  isStreaming,
}) => {
  const [copied, setCopied] = useState(false);
  const [codeCopiedIndex, setCodeCopiedIndex] = useState<number | null>(null);
  const [isThinkingExpanded, setIsThinkingExpanded] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const isUser = message.role === 'user';
  const modelMeta = AVAILABLE_MODELS.find((m) => m.id === message.model) || AVAILABLE_MODELS[0];

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = (codeText: string, index: number) => {
    navigator.clipboard.writeText(codeText);
    setCodeCopiedIndex(index);
    setTimeout(() => setCodeCopiedIndex(null), 2000);
  };

  const handleSpeak = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return;

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel();
    // Clean markdown before speaking
    const cleanText = message.content.replace(/```[\s\S]*?```/g, 'Code snippet omitted.').replace(/[#*`_~]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 1.05;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Format and render markdown-like content cleanly
  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(```[\s\S]*?```)/g);

    return parts.map((part, index) => {
      // Check if this part is a code block
      if (part.startsWith('```') && part.endsWith('```')) {
        const firstLineEnd = part.indexOf('\n');
        const language = firstLineEnd !== -1 ? part.substring(3, firstLineEnd).trim() : 'code';
        const codeText = firstLineEnd !== -1 ? part.substring(firstLineEnd + 1, part.length - 3) : part.substring(3, part.length - 3);

        const isCodeCopied = codeCopiedIndex === index;

        return (
          <div
            key={index}
            className="my-3.5 rounded-xl border border-white/10 bg-[#0d0f16] overflow-hidden shadow-lg"
          >
            {/* Code Block Top Bar */}
            <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#141722] border-b border-white/5 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5 text-zinc-300 font-medium">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                {language || 'plaintext'}
              </span>
              <button
                onClick={() => handleCopyCode(codeText, index)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-md hover:bg-white/10 text-zinc-400 hover:text-white transition text-xs"
              >
                {isCodeCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy</span>
                  </>
                )}
              </button>
            </div>
            {/* Code Body */}
            <div className="p-3.5 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed text-zinc-200">
              <pre className="!bg-transparent !p-0 !m-0">
                <code>{codeText}</code>
              </pre>
            </div>
          </div>
        );
      }

      // Render regular text with markdown elements (Headers, bullets, bold, blockquotes)
      const lines = part.split('\n');
      return (
        <div key={index} className="space-y-1.5">
          {lines.map((line, lIdx) => {
            // Header 3
            if (line.startsWith('### ')) {
              return (
                <h3 key={lIdx} className="text-base font-bold text-zinc-100 mt-3 mb-1">
                  {line.replace('### ', '')}
                </h3>
              );
            }
            // Header 2
            if (line.startsWith('## ')) {
              return (
                <h2 key={lIdx} className="text-lg font-bold text-white mt-4 mb-1">
                  {line.replace('## ', '')}
                </h2>
              );
            }
            // Blockquote
            if (line.startsWith('> ')) {
              return (
                <div key={lIdx} className="border-l-2 border-indigo-500 pl-3 my-2 text-zinc-300 italic text-sm">
                  {line.replace('> ', '')}
                </div>
              );
            }
            // Bullet item
            if (line.startsWith('- ') || line.startsWith('* ')) {
              const bulletText = line.substring(2);
              return (
                <div key={lIdx} className="flex items-start gap-2 text-sm text-zinc-200 ml-1">
                  <span className="text-indigo-400 mt-1 shrink-0">•</span>
                  <span>{parseInlineStyles(bulletText)}</span>
                </div>
              );
            }
            // Numbered list item
            if (/^\d+\.\s/.test(line)) {
              return (
                <div key={lIdx} className="flex items-start gap-2 text-sm text-zinc-200 ml-1">
                  <span className="text-indigo-400 font-mono text-xs mt-0.5 shrink-0">
                    {line.match(/^\d+\./)?.[0]}
                  </span>
                  <span>{parseInlineStyles(line.replace(/^\d+\.\s/, ''))}</span>
                </div>
              );
            }
            // Empty line
            if (!line.trim()) {
              return <div key={lIdx} className="h-1.5" />;
            }

            return (
              <p key={lIdx} className="text-sm sm:text-[15px] leading-relaxed text-zinc-200">
                {parseInlineStyles(line)}
              </p>
            );
          })}
        </div>
      );
    });
  };

  // Helper for bold and inline code
  const parseInlineStyles = (text: string) => {
    const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
    return tokens.map((tok, i) => {
      if (tok.startsWith('`') && tok.endsWith('`')) {
        return (
          <code key={i} className="px-1.5 py-0.5 mx-0.5 rounded bg-white/10 text-indigo-300 text-xs font-mono">
            {tok.slice(1, -1)}
          </code>
        );
      }
      if (tok.startsWith('**') && tok.endsWith('**')) {
        return (
          <strong key={i} className="font-semibold text-white">
            {tok.slice(2, -2)}
          </strong>
        );
      }
      return tok;
    });
  };

  return (
    <div
      className={`group w-full py-5 px-3 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-[#14161f]/50 border-y border-white/[0.03]'
      }`}
    >
      <div className="max-w-3xl mx-auto flex items-start gap-3.5 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-600 text-white font-semibold text-xs flex items-center justify-center shadow-md shadow-indigo-600/20 ring-1 ring-white/10">
              SH
            </div>
          ) : (
            <div
              className={`w-8 h-8 rounded-xl bg-gradient-to-br ${modelMeta.iconColor} flex items-center justify-center text-white shadow-md shadow-indigo-500/10 ring-1 ring-white/10`}
            >
              {modelMeta.provider === 'Gemini' ? (
                <Sparkles className="w-4 h-4 text-white" />
              ) : modelMeta.provider === 'Claude' ? (
                <BrainCircuit className="w-4 h-4 text-white" />
              ) : (
                <Bot className="w-4 h-4 text-white" />
              )}
            </div>
          )}
        </div>

        {/* Message Content Container */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold text-zinc-200">
              {isUser ? 'You' : modelMeta.name}
            </span>
            {!isUser && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium border ${modelMeta.badgeColor}`}>
                {modelMeta.badge}
              </span>
            )}
            {message.webSearchUsed && (
              <span className="flex items-center gap-1 text-[10px] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.2 rounded">
                <Globe className="w-2.5 h-2.5" /> Web Grounded
              </span>
            )}
            {!isUser && message.tokens !== undefined && (
              <span
                className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded font-mono"
                title={`${message.tokens} tokens generated${message.durationMs ? ` in ${(message.durationMs / 1000).toFixed(2)}s` : ''}${message.promptTokens ? ` • Prompt: ${message.promptTokens} tok` : ''}`}
              >
                <Zap className="w-2.5 h-2.5 fill-emerald-400" />
                {message.tokens} tok
                {message.speed ? ` • ${message.speed} t/s` : ''}
              </span>
            )}
            <span suppressHydrationWarning className="text-[11px] text-zinc-500 ml-auto font-mono">
              {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>

          {/* Attachments preview (if any) */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {message.attachments.map((att) => {
                const isImage =
                  att.type.startsWith('image/') &&
                  !att.type.includes('pdf') &&
                  !att.name.toLowerCase().endsWith('.pdf');
                const isPdf =
                  att.type === 'application/pdf' ||
                  att.name.toLowerCase().endsWith('.pdf');

                return (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 p-1.5 pr-3 rounded-xl bg-zinc-800/80 border border-white/10 text-xs text-zinc-200 shadow-sm"
                  >
                    {isImage && att.dataUrl ? (
                      <div
                        onClick={() => onPreviewImage(att)}
                        className="w-10 h-10 rounded-lg overflow-hidden cursor-pointer relative group/img bg-black/40 shrink-0"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.dataUrl}
                          alt={att.name}
                          className="w-full h-full object-cover group-hover/img:scale-105 transition"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center transition">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </div>
                    ) : isPdf ? (
                      <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 font-bold text-[10px] flex items-center justify-center shrink-0 border border-rose-500/30">
                        PDF
                      </div>
                    ) : (
                      <div className="w-9 h-9 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="truncate max-w-[140px] font-medium text-xs text-zinc-100">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-zinc-400">
                        {(att.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Reasoning / Thinking Accordion (Claude 3.7 / Gemini Thinking style) */}
          {message.thinking && (
            <div className="mb-3 rounded-xl border border-white/10 bg-[#161824]/60 overflow-hidden">
              <button
                onClick={() => setIsThinkingExpanded(!isThinkingExpanded)}
                className="w-full flex items-center justify-between px-3.5 py-2 text-xs text-zinc-400 hover:text-zinc-200 bg-white/[0.02] hover:bg-white/[0.04] transition"
              >
                <div className="flex items-center gap-2">
                  <BrainCircuit className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="font-medium text-indigo-300">
                    Thinking Process (Chain of thought)
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <span className="text-[10px]">
                    {isThinkingExpanded ? 'Hide' : 'Show reasoning'}
                  </span>
                  {isThinkingExpanded ? (
                    <ChevronDown className="w-3.5 h-3.5" />
                  ) : (
                    <ChevronRight className="w-3.5 h-3.5" />
                  )}
                </div>
              </button>

              {isThinkingExpanded && (
                <div className="p-3 text-xs text-zinc-400 font-mono leading-relaxed border-t border-white/5 bg-black/20 whitespace-pre-wrap">
                  {message.thinking}
                </div>
              )}
            </div>
          )}

          {/* Formatted Message Body */}
          <div className="prose-chat select-text">
            {renderFormattedContent(message.content)}
            {isStreaming && (
              <span className="inline-block w-2 h-4 ml-1 bg-indigo-400 animate-pulse align-middle" />
            )}
          </div>

          {/* Actions toolbar (Assistant messages only) */}
          {!isUser && !isStreaming && (
            <div className="flex items-center gap-1 mt-3.5 pt-2 border-t border-white/[0.04] text-zinc-400">
              <button
                onClick={handleCopyMessage}
                className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition text-xs flex items-center gap-1"
                title="Copy response"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 text-[11px]">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span className="text-[11px] hidden sm:inline">Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={() => onFeedback(message.id, 'like')}
                className={`p-1.5 rounded-lg hover:bg-zinc-800 transition ${
                  message.feedback === 'like' ? 'text-emerald-400 bg-emerald-500/10' : 'hover:text-zinc-200'
                }`}
                title="Good response"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => onFeedback(message.id, 'dislike')}
                className={`p-1.5 rounded-lg hover:bg-zinc-800 transition ${
                  message.feedback === 'dislike' ? 'text-rose-400 bg-rose-500/10' : 'hover:text-zinc-200'
                }`}
                title="Poor response"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={handleSpeak}
                className={`p-1.5 rounded-lg hover:bg-zinc-800 transition ${
                  isSpeaking ? 'text-indigo-400 bg-indigo-500/10' : 'hover:text-zinc-200'
                }`}
                title={isSpeaking ? 'Stop speaking' : 'Read aloud'}
              >
                {isSpeaking ? (
                  <VolumeX className="w-3.5 h-3.5" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5" />
                )}
              </button>

              {!isUser && message.tokens !== undefined && (
                <span className="text-[11px] text-zinc-500 font-mono ml-2 hidden sm:inline select-none">
                  ⚡ {message.tokens} tokens {message.speed ? `(${message.speed} t/s)` : ''}
                </span>
              )}

              {onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="p-1.5 rounded-lg hover:bg-zinc-800 hover:text-zinc-200 transition text-xs flex items-center gap-1 ml-auto"
                  title="Regenerate response"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="text-[11px] hidden sm:inline">Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
