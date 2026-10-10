import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

const LLAMA_SERVER_URL = process.env.LLAMA_SERVER_URL || 'http://127.0.0.1:8085';

interface ParsedPdf {
  success: boolean;
  page_count?: number;
  text?: string;
  images?: string[];
  error?: string;
}

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

async function performLiveWebSearch(query: string): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    try {
      const candidates = [
        path.resolve(process.cwd(), 'scripts', 'web_search.py'),
        path.resolve(process.cwd(), '..', 'scripts', 'web_search.py'),
        'D:\\.Github Projects\\A.I. Chat\\scripts\\web_search.py',
      ];
      const scriptPath = candidates.find((p) => fs.existsSync(p)) || candidates[candidates.length - 1];

      const proc = spawn('python', [scriptPath, query], {
        stdio: ['ignore', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (d) => {
        stdout += d.toString();
      });
      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      const timer = setTimeout(() => {
        try {
          proc.kill();
        } catch {}
        resolve([]);
      }, 9000);

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0 || !stdout.trim()) {
          console.warn('Web search returned non-zero code:', code, stderr);
          resolve([]);
          return;
        }
        try {
          const parsed = JSON.parse(stdout);
          if (parsed.success && Array.isArray(parsed.results)) {
            resolve(parsed.results);
          } else {
            resolve([]);
          }
        } catch {
          resolve([]);
        }
      });
    } catch {
      resolve([]);
    }
  });
}

async function parsePdfAttachment(dataUrl: string, maxPages = 2): Promise<ParsedPdf> {
  return new Promise((resolve) => {
    try {
      const candidates = [
        path.resolve(process.cwd(), 'scripts', 'parse_pdf.py'),
        path.resolve(process.cwd(), '..', 'scripts', 'parse_pdf.py'),
        'D:\\.Github Projects\\A.I. Chat\\scripts\\parse_pdf.py',
      ];
      const scriptPath = candidates.find((p) => fs.existsSync(p)) || candidates[candidates.length - 1];

      const proc = spawn('python', [scriptPath], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';

      proc.stdout.on('data', (d) => {
        stdout += d.toString();
      });
      proc.stderr.on('data', (d) => {
        stderr += d.toString();
      });

      const timer = setTimeout(() => {
        try {
          proc.kill();
        } catch {}
        resolve({ success: false, error: 'PDF parsing timed out' });
      }, 20000);

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0 || !stdout.trim()) {
          console.error('PDF parser error:', stderr);
          resolve({ success: false, error: stderr || `Exit code ${code}` });
          return;
        }
        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Unknown error';
          resolve({ success: false, error: msg });
        }
      });

      proc.stdin.write(JSON.stringify({ dataUrl, maxPages }));
      proc.stdin.end();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      resolve({ success: false, error: msg });
    }
  });
}

function decodeBase64Text(dataUrl: string): string {
  try {
    const b64 = dataUrl.includes(',') ? dataUrl.split(',')[1] : dataUrl;
    return Buffer.from(b64, 'base64').toString('utf-8');
  } catch {
    return '';
  }
}

export async function GET() {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);

    const res = await fetch(`${LLAMA_SERVER_URL}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      return NextResponse.json({
        status: 'ok',
        online: true,
        port: 8085,
        model: 'gemma-4-E2B-it-Q5_K_S.gguf',
        url: LLAMA_SERVER_URL,
      });
    }

    return NextResponse.json({
      status: 'offline',
      online: false,
      port: 8085,
      url: LLAMA_SERVER_URL,
    });
  } catch {
    return NextResponse.json({
      status: 'offline',
      online: false,
      port: 8085,
      url: LLAMA_SERVER_URL,
    });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      prompt,
      messages: incomingMessages = [],
      systemPrompt,
      stream = true,
      temperature = 0.6,
      top_p = 0.95,
      max_tokens = 8192,
      attachments = [],
      webSearch = false,
      deepThink = false,
    } = body;

    // Construct OpenAI-compatible messages array
    const chatMessages: Array<{ role: string; content: any }> = [];

    if (systemPrompt && typeof systemPrompt === 'string' && systemPrompt.trim()) {
      chatMessages.push({ role: 'system', content: systemPrompt.trim() });
    }

    if (incomingMessages && Array.isArray(incomingMessages) && incomingMessages.length > 0) {
      for (const m of incomingMessages) {
        if (m.role && m.content) {
          chatMessages.push({
            role: m.role,
            content: m.content,
          });
        }
      }
    } else {
      chatMessages.push({ role: 'user', content: prompt || '' });
    }

    // Process attachments: PDFs, images, text files
    const imageParts: Array<{ type: string; image_url: { url: string } }> = [];
    let textAdditions = '';

    for (const att of attachments) {
      const fileName = att.name || 'unnamed';
      const fileType = att.type || '';
      const dataUrl = att.dataUrl || '';
      const textContent = att.textContent;

      const isPdf =
        fileType === 'application/pdf' || fileName.toLowerCase().endsWith('.pdf');
      const isImage =
        fileType.startsWith('image/') ||
        /\.(png|jpe?g|webp|gif|bmp)$/i.test(fileName);
      const isTextFile =
        fileType.startsWith('text/') ||
        /\.(txt|md|csv|json|py|js|ts|jsx|tsx|html|css|xml|sql|sh|bat|env|yaml|yml)$/i.test(fileName);

      if (isPdf && dataUrl) {
        // Extract text + render pages using PyMuPDF helper
        const pdfResult = await parsePdfAttachment(dataUrl, 2);
        if (pdfResult.success) {
          const pageCount = pdfResult.page_count || 1;
          const extractedText = (pdfResult.text || '').trim();

          if (extractedText) {
            textAdditions += `\n\n[Attached Document: "${fileName}" (${pageCount} page${pageCount > 1 ? 's' : ''})]\n${extractedText}`;
          } else {
            textAdditions += `\n\n[Attached Document: "${fileName}" (${pageCount} page${pageCount > 1 ? 's' : ''}, visually rendered below)]`;
          }

          // Attach rendered page images for multimodal vision OCR
          if (pdfResult.images && pdfResult.images.length > 0) {
            for (const imgUrl of pdfResult.images) {
              imageParts.push({
                type: 'image_url',
                image_url: { url: imgUrl },
              });
            }
          }
        } else {
          textAdditions += `\n\n[Attached Document: "${fileName}" (Parsing note: ${pdfResult.error || 'could not extract text'})]`;
        }
      } else if (isImage && dataUrl) {
        imageParts.push({
          type: 'image_url',
          image_url: { url: dataUrl },
        });
      } else if (isTextFile) {
        const raw = textContent || (dataUrl ? decodeBase64Text(dataUrl) : '');
        if (raw.trim()) {
          textAdditions += `\n\n[Attached File: "${fileName}"]\n\`\`\`\n${raw.trim()}\n\`\`\``;
        }
      }
    }

    // Live Web Search Grounding
    let webSearchContext = '';
    if (webSearch) {
      const userQuery = (
        prompt ||
        (incomingMessages.length > 0
          ? incomingMessages[incomingMessages.length - 1]?.content
          : '') ||
        ''
      ).trim();

      if (userQuery) {
        const searchResults = await performLiveWebSearch(userQuery);
        if (searchResults.length > 0) {
          const formattedSources = searchResults
            .map(
              (r, idx) =>
                `[Source ${idx + 1}]: "${r.title}"\nURL: ${r.url}\nSummary: ${r.snippet}`
            )
            .join('\n\n');

          webSearchContext = `\n\n[Live Web Search Grounding Context]\nCurrent Date: October 2026\nUser Query: "${userQuery}"\nLive Search Results:\n${formattedSources}\n\nInstructions: The user has requested live web search grounding. Use the live internet search results above to provide an accurate, up-to-date answer. Cite sources and links when relevant.`;
        }
      }
    }

    // Deep reasoning instruction
    let deepThinkInstruction = '';
    if (deepThink) {
      deepThinkInstruction = `\n\n[System Directive: Deep Reasoning]\nPlease perform thorough, step-by-step chain-of-thought analysis in your thinking process before formulating the final answer.`;
    }

    // Attach processed additions, search grounding, and multimodal images to the latest user message
    if (chatMessages.length > 0) {
      const lastMsg = chatMessages[chatMessages.length - 1];
      if (lastMsg && lastMsg.role === 'user') {
        let baseText = typeof lastMsg.content === 'string' ? lastMsg.content.trim() : '';

        // If user didn't type text or just sent "here is the pdf", provide clear intent
        if (!baseText && (textAdditions || imageParts.length > 0)) {
          baseText = 'Please analyze, read, and summarize the attached document.';
        }

        const fullText = (baseText + textAdditions + webSearchContext + deepThinkInstruction).trim();

        if (imageParts.length > 0) {
          lastMsg.content = [
            { type: 'text', text: fullText },
            ...imageParts,
          ];
        } else {
          lastMsg.content = fullText;
        }
      }
    }

    // Call llama-server v1/chat/completions endpoint
    const controller = new AbortController();
    const llamaRes = await fetch(`${LLAMA_SERVER_URL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: chatMessages,
        temperature,
        top_p,
        max_tokens,
        stream: !!stream,
      }),
      signal: controller.signal,
    });

    if (!llamaRes.ok) {
      const errText = await llamaRes.text();
      return NextResponse.json(
        {
          status: 'error',
          message: `llama-server error (${llamaRes.status}): ${errText || llamaRes.statusText}`,
        },
        { status: llamaRes.status }
      );
    }

    // If streaming was requested, pass the event stream through
    if (stream && llamaRes.body) {
      return new Response(llamaRes.body as unknown as BodyInit, {
        headers: {
          'Content-Type': 'text/event-stream; charset=utf-8',
          'Cache-Control': 'no-cache, no-transform',
          'Connection': 'keep-alive',
          'X-Accel-Buffering': 'no',
        },
      });
    }

    // Non-streaming response parsing
    const data = await llamaRes.json();
    const choice = data.choices?.[0]?.message || {};
    const replyText = choice.content || '';
    const thinkingText = choice.reasoning_content || undefined;

    return NextResponse.json({
      status: 'success',
      reply: replyText,
      thinking: thinkingText,
      model: 'Gemma 4 E2B (llama-server :8085)',
      usage: data.usage,
      timings: data.timings,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('API Error connecting to llama-server:', error);
    return NextResponse.json(
      {
        status: 'error',
        message:
          'Could not connect to llama-server on http://127.0.0.1:8085. Please ensure llama-server.exe is running.',
        detail: message,
      },
      { status: 503 }
    );
  }
}
