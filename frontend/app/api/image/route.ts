import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';

export async function GET() {
  const modelsDir = 'D:\\.Github Projects\\A.I. Chat\\stable-diffusion.cpp\\models';
  const exePath = 'D:\\.Github Projects\\A.I. Chat\\stable-diffusion.cpp\\sd-cli.exe';

  const rvPath = path.join(modelsDir, 'Realistic_Vision_V6.0_NV_B1_fp16.safetensors');
  const baseModelPath = path.join(modelsDir, 'v1-5-pruned-emaonly-Q4_0.gguf');

  const activeModel = fs.existsSync(rvPath)
    ? 'Realistic_Vision_V6.0_NV_B1_fp16.safetensors'
    : fs.existsSync(baseModelPath)
    ? 'v1-5-pruned-emaonly-Q4_0.gguf'
    : null;

  const ready = !!activeModel && fs.existsSync(exePath);

  return NextResponse.json({
    status: ready ? 'ready' : 'not_ready',
    model: activeModel || 'None',
    ready,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const prompt = (body.prompt || '').trim();
    const width = Number(body.width) || 512;
    const height = Number(body.height) || 512;
    const steps = Number(body.steps) || 15;
    const cfg = Number(body.cfg) || 7.0;

    if (!prompt) {
      return NextResponse.json(
        { success: false, error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const scriptCandidates = [
      path.resolve(process.cwd(), 'scripts', 'generate_image.py'),
      path.resolve(process.cwd(), '..', 'scripts', 'generate_image.py'),
      'D:\\.Github Projects\\A.I. Chat\\scripts\\generate_image.py',
    ];

    const scriptPath = scriptCandidates.find((p) => fs.existsSync(p)) || scriptCandidates[scriptCandidates.length - 1];

    const result = await new Promise<any>((resolve) => {
      const proc = spawn('python', [
        scriptPath,
        '--prompt', prompt,
        '--width', String(width),
        '--height', String(height),
        '--steps', String(steps),
        '--cfg', String(cfg),
      ], {
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
        resolve({ success: false, error: 'Image generation process timed out (180s)' });
      }, 180000);

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code !== 0 || !stdout.trim()) {
          console.error('Image generation error:', stderr);
          resolve({
            success: false,
            error: stderr || `Process failed with exit code ${code}`,
          });
          return;
        }

        try {
          const parsed = JSON.parse(stdout);
          resolve(parsed);
        } catch {
          resolve({ success: false, error: stdout || 'Failed to parse JSON response' });
        }
      });
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Server error' },
      { status: 500 }
    );
  }
}
