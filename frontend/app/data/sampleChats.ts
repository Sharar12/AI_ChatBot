import { Chat, ModelOption } from '../types';

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'gemma-4-e2b',
    name: 'Gemma 4 E2B',
    provider: 'Llama.cpp',
    tagline: 'Google Gemma 4 E2B IT on llama-server (Port 8085, 128k context, CUDA)',
    badge: 'Live llama-server',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconColor: 'from-emerald-500 via-teal-500 to-cyan-500',
    supportsThinking: true,
  },
  {
    id: 'ling-3.1-flash-free',
    name: 'Ling 3.1 Flash',
    provider: 'OpenCode',
    tagline: '560B MoE model with deep reasoning and coding intelligence',
    badge: 'Hybrid MoE',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    iconColor: 'from-cyan-500 to-blue-500',
    supportsThinking: true,
  },
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Gemini',
    tagline: 'Ultra-fast multimodal speedster with 1M+ token context',
    badge: 'Fast & Multimodal',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    iconColor: 'from-blue-500 via-indigo-500 to-purple-500',
    supportsThinking: true,
  },
  {
    id: 'gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Gemini',
    tagline: 'Google flagship frontier model for complex reasoning and coding',
    badge: 'Pro Reasoning',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    iconColor: 'from-indigo-500 to-cyan-400',
    supportsThinking: true,
  },
  {
    id: 'claude-3-7-sonnet',
    name: 'Claude 3.7 Sonnet',
    provider: 'Claude',
    tagline: 'Hybrid reasoning model with elite coding and articulate nuance',
    badge: 'Most Intelligent',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    iconColor: 'from-amber-500 to-orange-600',
    supportsThinking: true,
  },
  {
    id: 'gpt-4o',
    name: 'GPT-4o Omni',
    provider: 'OpenAI',
    tagline: 'Versatile omni-intelligence for coding, writing, and logic',
    badge: 'Omni Vision',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    iconColor: 'from-emerald-500 to-teal-400',
    supportsThinking: false,
  },
  {
    id: 'deepseek-r1',
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    tagline: 'Open-weights reasoning powerhouse with deep chain-of-thought',
    badge: 'Deep Thinker',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    iconColor: 'from-purple-500 to-pink-500',
    supportsThinking: true,
  },
];

const BASE_TIME = 1740000000000;

export const INITIAL_CHATS: Chat[] = [
  {
    id: 'chat-react-perf',
    title: 'React 19 & Next.js Performance Optimization',
    createdAt: BASE_TIME - 3600000 * 2,
    updatedAt: BASE_TIME - 3600000 * 2,
    model: 'claude-3-7-sonnet',
    pinned: true,
    messages: [
      {
        id: 'msg-1',
        role: 'user',
        content: 'How can I optimize large virtualized list rendering with Next.js 16 and React 19 Server Components?',
        timestamp: BASE_TIME - 3600000 * 2,
      },
      {
        id: 'msg-2',
        role: 'assistant',
        content: `Optimizing large virtualized lists in **Next.js 16** with **React 19** requires leveraging a hybrid rendering strategy: combine server-side data fetching with client-side virtualization.

### Core Architecture Strategy

1. **Server Component Boundary**: Fetch and slice initial data on the server with cache tags.
2. **Windowing / Virtualization**: Only mount DOM nodes in the visible viewport (plus a small overscan buffer).
3. **Concurrent Transitions**: Use React 19's \`useTransition\` to keep filtering and sorting non-blocking.

\`\`\`tsx
'use client';

import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef, useTransition, useState } from 'react';

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T) => React.ReactNode;
  estimateSize?: number;
}

export function VirtualizedFeed<T extends { id: string | number }>({
  items,
  renderItem,
  estimateSize = 72,
}: VirtualListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [isPending, startTransition] = useTransition();

  const rowVirtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan: 5,
  });

  return (
    <div
      ref={parentRef}
      className="h-[600px] overflow-auto rounded-xl border border-white/10 bg-zinc-950 p-2"
    >
      <div
        className="relative w-full"
        style={{ height: \`\${rowVirtualizer.getTotalSize()}px\` }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.key}
            className="absolute top-0 left-0 w-full"
            style={{
              transform: \`translateY(\${virtualRow.start}px)\`,
            }}
          >
            {renderItem(items[virtualRow.index])}
          </div>
        ))}
      </div>
    </div>
  );
}
\`\`\`

### Key Performance Gains
| Metric | Without Virtualization | With Virtualization | Improvement |
| :--- | :--- | :--- | :--- |
| **DOM Node Count** | ~10,000 nodes | ~24 nodes | **99.7% reduction** |
| **Initial Memory** | ~142 MB | ~18 MB | **87% savings** |
| **FPS on Scroll** | 22-34 FPS | 60 FPS locked | **Smooth 60hz** |`,
        timestamp: BASE_TIME - 3600000 * 2 + 15000,
        thinking: `1. Analyzed the stack: Next.js 16 (Turbopack) + React 19.
2. Identified client/server boundary: server components cannot handle high-frequency scroll events, so virtualization must be isolated in a client boundary.
3. Chose TanStack Virtual as the gold standard for lightweight virtualization.
4. Calculated DOM and memory impact benchmarks to provide quantitative clarity.`,
        model: 'claude-3-7-sonnet',
        feedback: 'like',
      },
    ],
  },
  {
    id: 'chat-gemini-vision',
    title: 'Multimodal Image Analysis & OCR Pipeline',
    createdAt: BASE_TIME - 3600000 * 24,
    updatedAt: BASE_TIME - 3600000 * 24,
    model: 'gemini-2.5-flash',
    pinned: false,
    messages: [
      {
        id: 'msg-3',
        role: 'user',
        content: 'I uploaded architectural blueprints and need automated extraction of room dimensions and electrical wiring annotations.',
        timestamp: BASE_TIME - 3600000 * 24,
        attachments: [
          {
            id: 'att-1',
            name: 'floor_plan_level_2.png',
            size: 2450000,
            type: 'image/png',
          },
          {
            id: 'att-2',
            name: 'electrical_spec_v1.pdf',
            size: 1180000,
            type: 'application/pdf',
          },
        ],
      },
      {
        id: 'msg-4',
        role: 'assistant',
        content: `I've analyzed your blueprint \`floor_plan_level_2.png\` and the electrical specifications:

### Extracted Room Measurements
- **Master Suite**: 18'4" × 14'2" (260 sq ft) — *3 duplex outlets, 1 dedicated 20A AC branch*
- **Executive Office**: 12'0" × 11'6" (138 sq ft) — *Cat6 ethernet drop + 4 quad outlets*
- **Living Area / Atrium**: 24'8" × 19'0" (468 sq ft) — *3-way dimmer circuits with recessed LED grid*

### High-Priority Electrical Notes
> **Note**: Panel Schedule specifies a 200A main service breaker. Sub-panel B handles kitchen and utility HVAC loads. All wet-wall circuits are GFCI protected.

Would you like me to generate a structured JSON export of all 42 circuit runs?`,
        timestamp: BASE_TIME - 3600000 * 24 + 12000,
        thinking: `Processed 2 attached assets.
Parsed image floor plan resolution: 3840x2160.
Matched scale legend 1/4" = 1'-0".
Cross-referenced electrical specs with sub-panel schedule.`,
        model: 'gemini-2.5-flash',
      },
    ],
  },
  {
    id: 'chat-laravel-api',
    title: 'Laravel 11 RESTful Chat Controller & Streaming',
    createdAt: BASE_TIME - 3600000 * 72,
    updatedAt: BASE_TIME - 3600000 * 72,
    model: 'gpt-4o',
    pinned: false,
    messages: [
      {
        id: 'msg-5',
        role: 'user',
        content: 'Can you show me how to return Server-Sent Events (SSE) streaming from a Laravel controller for AI chat?',
        timestamp: BASE_TIME - 3600000 * 72,
      },
      {
        id: 'msg-6',
        role: 'assistant',
        content: `Here is a high-performance **Server-Sent Events (SSE)** response in Laravel using \`response()->stream()\`:

\`\`\`php
<?php

namespace App\\Http\\Controllers;

use Illuminate\\Http\\Request;
use Symfony\\Component\\HttpFoundation\\StreamedResponse;

class ChatStreamController extends Controller
{
    public function stream(Request $request): StreamedResponse
    {
        $prompt = $request->input('prompt');

        return response()->stream(function () use ($prompt) {
            // Disable output buffering
            while (ob_get_level() > 0) {
                ob_end_flush();
            }

            $chunks = [
                "Thinking through your request...\\n\\n",
                "Here is the synthesized data stream:\\n",
                "1. Token processing activated.\\n",
                "2. Pipeline throughput: 94 tokens/sec.\\n",
                "Stream completed successfully!\\n"
            ];

            foreach ($chunks as $chunk) {
                echo "data: " . json_encode(['text' => $chunk]) . "\\n\\n";
                flush();
                usleep(80000); // 80ms delay
            }

            echo "data: [DONE]\\n\\n";
            flush();
        }, 200, [
            'Content-Type' => 'text/event-stream',
            'Cache-Control' => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection' => 'keep-alive',
        ]);
    }
}
\`\`\`

Make sure in \`config/cors.php\` you have allowed headers and origins so your frontend can consume the stream without CORS blockages!`,
        timestamp: BASE_TIME - 3600000 * 72 + 8000,
        model: 'gpt-4o',
      },
    ],
  },
];
