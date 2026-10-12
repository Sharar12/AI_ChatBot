@echo off
title Stable Diffusion Server - SD 1.5 Q4 (Port 1234)

set "MODEL_PATH=D:\.Github Projects\A.I. Chat\stable-diffusion.cpp\models\Realistic_Vision_V6.0_NV_B1_fp16.safetensors"
set "VAE_PATH=D:\.Github Projects\A.I. Chat\stable-diffusion.cpp\models\vae-ft-mse-840000-ema-pruned.safetensors"

if not exist "%MODEL_PATH%" (
    set "MODEL_PATH=D:\.Github Projects\A.I. Chat\stable-diffusion.cpp\models\v1-5-pruned-emaonly-Q4_0.gguf"
)

if not exist "%MODEL_PATH%" (
    echo [ERROR] Model not found: %MODEL_PATH%
    pause
    exit /b 1
)

cd /d "%~dp0stable-diffusion.cpp"
echo ========================================================
echo  Starting sd-server.exe with Realistic Vision V6.0
echo  Listen: 127.0.0.1 ^| Port: 1234 ^| Vulkan GPU Acceleration
echo ========================================================

if exist "%VAE_PATH%" (
    sd-server.exe -m "%MODEL_PATH%" --vae "%VAE_PATH%" --listen-ip 127.0.0.1 --listen-port 1234
) else (
    sd-server.exe -m "%MODEL_PATH%" --listen-ip 127.0.0.1 --listen-port 1234
)

pause
