import { NextRequest, NextResponse } from 'next/server';

// In-memory session tracking for OpenCode sessions
let currentOpenCodeSessionId: string | null = null;

async function getOrCreateOpenCodeSession(): Promise<string> {
  if (currentOpenCodeSessionId) {
    return currentOpenCodeSessionId;
  }

  try {
    const res = await fetch('http://127.0.0.1:4096/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'AI Chat Live Session' }),
    });

    if (res.ok) {
      const data = await res.json();
      currentOpenCodeSessionId = data.id;
      return data.id;
    }
  } catch (e) {
    console.error('Error creating OpenCode session:', e);
  }

  return 'ses_default_session';
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { prompt, model = 'ling-3.1-flash-free', attachments = [] } = body;

    let fullPrompt = prompt;
    if (attachments && attachments.length > 0) {
      fullPrompt += `\n\n[User attached ${attachments.length} file(s): ${attachments.map((a: any) => a.name).join(', ')}]`;
    }

    // Call local OpenCode Server running with Ling 3.1 Flash Free
    const sessionId = await getOrCreateOpenCodeSession();

    const response = await fetch(`http://127.0.0.1:4096/session/${sessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: {
          providerID: 'opencode',
          modelID: 'ling-3.1-flash-free',
        },
        parts: [
          {
            type: 'text',
            text: fullPrompt,
          },
        ],
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const parts = data.parts || [];

      // Extract reasoning and text parts
      const reasoningPart = parts.find((p: any) => p.type === 'reasoning');
      const textParts = parts.filter((p: any) => p.type === 'text');
      const replyText = textParts.map((p: any) => p.text).join('\n') || 'Completed.';

      return NextResponse.json({
        status: 'success',
        reply: replyText,
        thinking: reasoningPart?.text,
        model: 'ling-3.1-flash-free',
        tokens: data.info?.tokens,
      });
    }

    // If session expired, reset and retry once
    currentOpenCodeSessionId = null;
    const retrySessionId = await getOrCreateOpenCodeSession();
    const retryResponse = await fetch(`http://127.0.0.1:4096/session/${retrySessionId}/message`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: {
          providerID: 'opencode',
          modelID: 'ling-3.1-flash-free',
        },
        parts: [{ type: 'text', text: fullPrompt }],
      }),
    });

    if (retryResponse.ok) {
      const data = await retryResponse.json();
      const parts = data.parts || [];
      const reasoningPart = parts.find((p: any) => p.type === 'reasoning');
      const textParts = parts.filter((p: any) => p.type === 'text');
      const replyText = textParts.map((p: any) => p.text).join('\n') || 'Completed.';

      return NextResponse.json({
        status: 'success',
        reply: replyText,
        thinking: reasoningPart?.text,
        model: 'ling-3.1-flash-free',
      });
    }

    return NextResponse.json(
      { status: 'error', message: 'Failed to communicate with OpenCode server' },
      { status: 502 }
    );
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
