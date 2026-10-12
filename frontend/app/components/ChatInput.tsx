'use client';

import React, { useRef, useState, useEffect } from 'react';
import {
  Paperclip,
  ArrowUp,
  Square,
  Globe,
  BrainCircuit,
  Mic,
  MicOff,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Attachment } from '../types';

interface ChatInputProps {
  onSendMessage: (
    content: string,
    attachments: Attachment[],
    options: { webSearch: boolean; deepThink: boolean; imageGen?: boolean }
  ) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  selectedModelName: string;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  selectedModelName,
}) => {
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [deepThinkEnabled, setDeepThinkEnabled] = useState(false);
  const [imageGenEnabled, setImageGenEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognitionRef = useRef<any>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        220
      )}px`;
    }
  }, [content]);

  // Setup Web Speech API for voice dictation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;

        recognition.onresult = (event: any) => {
          let transcript = '';
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          if (transcript) {
            setContent((prev) => (prev ? `${prev} ${transcript}` : transcript));
          }
        };

        recognition.onerror = () => {
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        speechRecognitionRef.current = recognition;
      }
    }
  }, []);

  const toggleVoice = () => {
    if (!speechRecognitionRef.current) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        speechRecognitionRef.current.start();
        setIsListening(true);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const newAttachment: Attachment = {
        id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        file,
      };

      const reader = new FileReader();
      reader.onload = (e) => {
        newAttachment.dataUrl = e.target?.result as string;

        // If it's a plain text or code file, also extract raw text
        if (
          file.type.startsWith('text/') ||
          /\.(txt|md|csv|json|js|ts|jsx|tsx|py|html|css|xml|sql|sh|bat|env|yaml|yml)$/i.test(file.name)
        ) {
          const textReader = new FileReader();
          textReader.onload = (te) => {
            newAttachment.textContent = te.target?.result as string;
            setAttachments((prev) => [...prev, newAttachment]);
          };
          textReader.readAsText(file);
        } else {
          setAttachments((prev) => [...prev, newAttachment]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (isGenerating) {
      onStopGeneration();
      return;
    }

    if (!content.trim() && attachments.length === 0) return;

    onSendMessage(content.trim(), attachments, {
      webSearch: webSearchEnabled,
      deepThink: deepThinkEnabled,
      imageGen: imageGenEnabled,
    });

    setContent('');
    setAttachments([]);
    if (isListening && speechRecognitionRef.current) {
      speechRecognitionRef.current.stop();
      setIsListening(false);
    }
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pb-4 pt-1 relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & drop overlay indicator */}
      {isDragOver && (
        <div className="absolute inset-x-4 top-0 bottom-4 rounded-3xl border-2 border-dashed border-indigo-500 bg-indigo-500/10 backdrop-blur-sm z-30 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-indigo-300 font-medium text-sm">
            <ImageIcon className="w-5 h-5 animate-bounce" />
            Drop your files here to attach
          </div>
        </div>
      )}

      {/* Main input card */}
      <div
        className={`relative rounded-2xl sm:rounded-3xl bg-[#161824] border shadow-2xl transition-all duration-200 ${
          imageGenEnabled
            ? 'border-amber-500/50 ring-1 ring-amber-500/30 shadow-amber-500/10'
            : 'border-white/10 focus-within:border-indigo-500/50 focus-within:ring-1 focus-within:ring-indigo-500/30'
        }`}
      >
        {/* Attachment chips preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-1 border-b border-white/5">
            {attachments.map((att) => {
              const isImg =
                att.type.startsWith('image/') &&
                !att.type.includes('pdf') &&
                !att.name.toLowerCase().endsWith('.pdf');
              const isPdf =
                att.type === 'application/pdf' ||
                att.name.toLowerCase().endsWith('.pdf');

              return (
                <div
                  key={att.id}
                  className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-xl bg-zinc-800/90 border border-white/10 text-xs text-zinc-200"
                >
                  {isImg && att.dataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={att.dataUrl}
                      alt={att.name}
                      className="w-6 h-6 object-cover rounded-md"
                    />
                  ) : isPdf ? (
                    <div className="w-6 h-6 rounded-md bg-rose-500/20 text-rose-400 font-bold text-[9px] flex items-center justify-center shrink-0 border border-rose-500/30">
                      PDF
                    </div>
                  ) : (
                    <FileText className="w-4 h-4 text-indigo-400 shrink-0" />
                  )}
                  <span className="truncate max-w-[120px] text-xs">
                    {att.name}
                  </span>
                  <button
                    onClick={() => removeAttachment(att.id)}
                    className="p-1 rounded-full hover:bg-white/10 text-zinc-400 hover:text-white transition"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              );
            })}


          </div>
        )}

        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          placeholder={
            imageGenEnabled
              ? '✨ Describe the image you want to generate with Stable Diffusion...'
              : `Ask ${selectedModelName} anything or upload files...`
          }
          className="w-full bg-transparent px-4 sm:px-5 pt-3.5 pb-2 text-sm sm:text-base text-zinc-100 placeholder-zinc-500 outline-none resize-none max-h-[220px] leading-relaxed"
        />

        {/* Action Toolbar */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 text-zinc-400">
          {/* Left tools: Upload, Image Gen, Search, DeepThink, Voice */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* File Upload Button */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFiles(e.target.files)}
              multiple
              className="hidden"
              accept="image/*,application/pdf,text/*,.csv,.json,.ts,.js,.py,.html,.css"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:text-zinc-200 hover:bg-zinc-800/80 transition text-zinc-400"
              title="Upload images or documents"
            >
              <Paperclip className="w-4 h-4" />
            </button>

            {/* Gemini-style Image Gen toggle */}
            <button
              type="button"
              onClick={() => setImageGenEnabled(!imageGenEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                imageGenEnabled
                  ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/25 text-amber-300 border border-amber-500/40 shadow-sm shadow-amber-500/20'
                  : 'hover:bg-zinc-800/80 hover:text-zinc-200 text-zinc-400 border border-transparent'
              }`}
              title="Create image with Stable Diffusion (Gemini style)"
            >
              <Sparkles className={`w-3.5 h-3.5 ${imageGenEnabled ? 'text-amber-400 animate-spin-slow' : ''}`} />
              <span className="hidden sm:inline">Image Gen</span>
            </button>

            {/* Web Search toggle */}
            <button
              type="button"
              onClick={() => setWebSearchEnabled(!webSearchEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                webSearchEnabled
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'hover:bg-zinc-800/80 hover:text-zinc-200 text-zinc-400 border border-transparent'
              }`}
              title="Search the web for real-time information"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Search</span>
            </button>

            {/* Deep Reasoning toggle */}
            <button
              type="button"
              onClick={() => setDeepThinkEnabled(!deepThinkEnabled)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-medium transition ${
                deepThinkEnabled
                  ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                  : 'hover:bg-zinc-800/80 hover:text-zinc-200 text-zinc-400 border border-transparent'
              }`}
              title="Enable deep chain-of-thought reasoning"
            >
              <BrainCircuit className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Deep Think</span>
            </button>

            {/* Voice Dictation toggle */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`p-2 rounded-xl transition ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 animate-pulse'
                  : 'hover:text-zinc-200 hover:bg-zinc-800/80 text-zinc-400'
              }`}
              title={isListening ? 'Stop listening' : 'Speak your prompt'}
            >
              {isListening ? (
                <MicOff className="w-4 h-4 text-rose-400" />
              ) : (
                <Mic className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* Right tool: Send / Stop button */}
          <div className="flex items-center gap-2">
            {content.trim().length > 0 && (
              <span className="text-[11px] text-zinc-400 font-mono select-none px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/5 hidden sm:inline">
                ~{Math.max(1, Math.ceil(content.length / 3.8))} tok
              </span>
            )}
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="w-9 h-9 rounded-full bg-zinc-700 hover:bg-zinc-600 text-white flex items-center justify-center transition shadow-md active:scale-95"
                title="Stop response generation"
              >
                <Square className="w-4 h-4 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!content.trim() && attachments.length === 0}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition shadow-md active:scale-95 ${
                  content.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-400 hover:to-purple-500 shadow-indigo-600/30'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
                title="Send message (Enter)"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer warning message */}
      <p className="text-center text-[11px] text-zinc-500 mt-2 select-none">
        A.I. Chat can make mistakes. Consider checking important information.
      </p>
    </div>
  );
};
