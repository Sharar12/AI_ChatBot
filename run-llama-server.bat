@echo off
title Llama Server - Gemma 4 E2B IT (Port 8085)

set "MODEL_PATH=D:\.Github Projects\A.I. Chat\llama.cpp\model\gemma-4-E2B-it-Q5_K_S.gguf"
set "MMPROJ_FILE="

if exist "D:\.Github Projects\A.I. Chat\llama.cpp\model\mmproj-BF16.gguf" (
    set "MMPROJ_FILE=D:\.Github Projects\A.I. Chat\llama.cpp\model\mmproj-BF16.gguf"
    echo [Vision Enabled] Found mmproj-BF16.gguf
) else if exist "D:\.Github Projects\A.I. Chat\llama.cpp\model\mmproj-F16.gguf" (
    set "MMPROJ_FILE=D:\.Github Projects\A.I. Chat\llama.cpp\model\mmproj-F16.gguf"
    echo [Vision Enabled] Found mmproj-F16.gguf
) else (
    echo [Text Mode] No mmproj file found in llama.cpp\model\ (Vision disabled)
)

cd /d "%~dp0llama.cpp\build\bin\Release"
echo ========================================================
echo  Starting llama-server.exe with Gemma 4 E2B
echo  Host: 0.0.0.0 ^| Port: 8085 ^| Context: 128k
echo  Flash Attention: ON ^| GPU Layers: 999
if defined MMPROJ_FILE (
    echo  Multimodal Projector: ENABLED (Vision + Audio)
) else (
    echo  Multimodal Projector: NONE (Text Only)
)
echo ========================================================

if defined MMPROJ_FILE (
    llama-server.exe ^
      --model "%MODEL_PATH%" ^
      --mmproj "%MMPROJ_FILE%" ^
      --host 0.0.0.0 ^
      --port 8085 ^
      --ctx-size 128000 ^
      --n-gpu-layers 999 ^
      --n-cpu-moe 999 ^
      --flash-attn on ^
      --cache-type-k q4_0 ^
      --cache-type-v q4_0 ^
      --batch-size 1024 ^
      --ubatch-size 512 ^
      --threads 4 ^
      --threads-batch 4 ^
      --temp 0.6 ^
      --top-p 0.95 ^
      --top-k 20 ^
      --metrics ^
      --fit on --fit-target 1024
) else (
    llama-server.exe ^
      --model "%MODEL_PATH%" ^
      --host 0.0.0.0 ^
      --port 8085 ^
      --ctx-size 128000 ^
      --n-gpu-layers 999 ^
      --n-cpu-moe 999 ^
      --flash-attn on ^
      --cache-type-k q4_0 ^
      --cache-type-v q4_0 ^
      --batch-size 1024 ^
      --ubatch-size 512 ^
      --threads 4 ^
      --threads-batch 4 ^
      --temp 0.6 ^
      --top-p 0.95 ^
      --top-k 20 ^
      --metrics ^
      --fit on --fit-target 1024
)

pause
