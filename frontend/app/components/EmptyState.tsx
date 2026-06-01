'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Code2,
  FileSearch,
  Compass,
  ArrowRight,
  BrainCircuit,
  Bot,
} from 'lucide-react';
import { ModelOption } from '../types';

interface EmptyStateProps {
  currentModel: ModelOption;
  onSelectPrompt: (prompt: string) => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  currentModel,
  onSelectPrompt,
}) => {
  const [greeting, setGreeting] = useState('Welcome back');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  const promptSuggestions = [
    {
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      title: 'Full-Stack Architecture',
      description: 'Build a low-latency real-time stream consumer with Redis and WebSockets',
      prompt: 'Write a production-ready real-time stream consumer in TypeScript using Redis Pub/Sub, Node.js worker threads, and Next.js frontend.',
    },
    {
      icon: <BrainCircuit className="w-5 h-5 text-purple-400" />,
      title: 'Deep System Analysis',
      description: 'Benchmark Pinecone, Qdrant, and pgvector for multimodal embeddings',
      prompt: 'Provide a detailed benchmark and trade-off analysis comparing Pinecone, Qdrant, and pgvector for 1536-dim embeddings at 10M scale.',
    },
    {
      icon: <FileSearch className="w-5 h-5 text-amber-400" />,
      title: 'Analyze & Summarize Docs',
      description: 'Extract key clauses, indemnities, and SLA terms from contracts',
      prompt: 'Here is our vendor SLA agreement. Please identify high-risk indemnification clauses, downtime penalties, and termination triggers.',
    },
    {
      icon: <Compass className="w-5 h-5 text-emerald-400" />,
      title: 'Product Strategy & Copy',
      description: 'Draft a viral launch campaign for developer tools on GitHub & X',
      prompt: 'Draft an engaging, viral Product Hunt and X launch thread for our new autonomous AI code review platform.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 max-w-3xl mx-auto w-full select-none">
      {/* Brand Icon & Welcome */}
      <div className="text-center mb-8 sm:mb-10 animate-in fade-in zoom-in-95 duration-300">
        <div className="inline-flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 shadow-xl shadow-indigo-500/20 mb-4 ring-4 ring-indigo-500/10">
          {currentModel.provider === 'Gemini' ? (
            <Sparkles className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          ) : currentModel.provider === 'Claude' ? (
            <BrainCircuit className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          ) : (
            <Bot className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
          )}
        </div>

        <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-white mb-2.5">
          {greeting}, <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Sharar</span>
        </h1>

        <p className="text-sm sm:text-base text-zinc-400 max-w-md mx-auto">
          Powered by <strong className="text-zinc-200">{currentModel.name}</strong>. {currentModel.tagline}.
        </p>
      </div>

      {/* Suggestion Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
        {promptSuggestions.map((item, index) => (
          <button
            key={index}
            onClick={() => onSelectPrompt(item.prompt)}
            className="group text-left p-4 rounded-2xl bg-[#161824] hover:bg-[#1d2030] border border-white/5 hover:border-indigo-500/30 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-indigo-500/5 active:scale-[0.99] flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-zinc-800/80 border border-white/5 group-hover:scale-105 transition">
                  {item.icon}
                </div>
                <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-indigo-300 transition">
                {item.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
