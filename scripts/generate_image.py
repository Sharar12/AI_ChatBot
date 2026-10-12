import os
import sys
import json
import time
import subprocess
import argparse

BASE_DIR = r"D:\.Github Projects\A.I. Chat"
SD_EXE = os.path.join(BASE_DIR, "stable-diffusion.cpp", "sd-cli.exe")
MODELS_DIR = os.path.join(BASE_DIR, "stable-diffusion.cpp", "models")
PUBLIC_GEN_DIR = os.path.join(BASE_DIR, "frontend", "public", "generated")

os.makedirs(PUBLIC_GEN_DIR, exist_ok=True)

DEFAULT_NEGATIVE_PROMPT = (
    "deformed, bad anatomy, bad hands, missing fingers, extra limbs, disfigured, "
    "blurry, low quality, oversaturated, watermark, signature"
)

def pick_best_model():
    candidates = [
        os.path.join(MODELS_DIR, "Realistic_Vision_V6.0_NV_B1_fp16.safetensors"),
        os.path.join(MODELS_DIR, "v1-5-pruned-emaonly-Q4_0.gguf"),
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    # Any other .safetensors or .gguf in models directory
    if os.path.exists(MODELS_DIR):
        for f in os.listdir(MODELS_DIR):
            if f.endswith(".safetensors") or f.endswith(".gguf"):
                return os.path.join(MODELS_DIR, f)
    return candidates[-1]

def get_vae_path():
    vae_cand = os.path.join(MODELS_DIR, "vae-ft-mse-840000-ema-pruned.safetensors")
    return vae_cand if os.path.exists(vae_cand) else None

def generate_image(prompt, negative_prompt=None, width=512, height=512, steps=15, cfg_scale=6.5, seed=-1):
    if not os.path.exists(SD_EXE):
        return {"success": False, "error": f"Executable not found at {SD_EXE}"}

    model_path = pick_best_model()
    if not os.path.exists(model_path):
        return {"success": False, "error": f"Model not found at {model_path}"}

    is_realistic_vision = "Realistic_Vision" in os.path.basename(model_path)
    model_name = "Realistic Vision V6.0 (Photorealistic)" if is_realistic_vision else "Stable Diffusion 1.5"

    timestamp = int(time.time() * 1000)
    filename = f"gen-{timestamp}.png"
    output_path = os.path.join(PUBLIC_GEN_DIR, filename)

    neg = negative_prompt if negative_prompt is not None else DEFAULT_NEGATIVE_PROMPT

    cmd = [
        SD_EXE,
        "-m", model_path,
        "-p", prompt,
        "-n", neg,
        "-o", output_path,
        "-W", str(width),
        "-H", str(height),
        "--steps", str(steps),
        "--cfg-scale", str(cfg_scale),
    ]

    # If VAE is present and we're using Realistic Vision, pass standalone VAE for rich colors
    vae_path = get_vae_path()
    if vae_path and is_realistic_vision:
        cmd.extend(["--vae", vae_path])

    # Realistic Vision produces best results with DPM++ 2M Karras or Euler a
    if is_realistic_vision:
        cmd.extend(["--sampling-method", "dpm++2m", "--scheduler", "karras"])

    if seed >= 0:
        cmd.extend(["-s", str(seed)])

    start_time = time.time()
    try:
        result = subprocess.run(
            cmd,
            cwd=os.path.dirname(SD_EXE),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=240
        )

        duration = round(time.time() - start_time, 2)

        if not os.path.exists(output_path):
            return {
                "success": False,
                "error": "Image file was not generated",
                "stderr": result.stderr[-1000:] if result.stderr else "",
                "stdout": result.stdout[-500:] if result.stdout else "",
            }

        return {
            "success": True,
            "filename": filename,
            "url": f"/generated/{filename}",
            "full_path": output_path,
            "prompt": prompt,
            "model": model_name,
            "width": width,
            "height": height,
            "steps": steps,
            "duration": duration,
        }
    except subprocess.TimeoutExpired:
        return {"success": False, "error": "Image generation timed out after 240s"}
    except Exception as e:
        return {"success": False, "error": str(e)}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate image using stable-diffusion.cpp")
    parser.add_argument("--prompt", type=str, required=True, help="Image prompt")
    parser.add_argument("--neg", type=str, default=None, help="Negative prompt")
    parser.add_argument("--width", type=int, default=512, help="Width")
    parser.add_argument("--height", type=int, default=512, help="Height")
    parser.add_argument("--steps", type=int, default=15, help="Sampling steps")
    parser.add_argument("--cfg", type=float, default=6.5, help="CFG scale")
    parser.add_argument("--seed", type=int, default=-1, help="Seed")

    args = parser.parse_args()
    res = generate_image(
        prompt=args.prompt,
        negative_prompt=args.neg,
        width=args.width,
        height=args.height,
        steps=args.steps,
        cfg_scale=args.cfg,
        seed=args.seed
    )
    print(json.dumps(res))
