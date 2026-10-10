@echo off
cd /d "%~dp0llama.cpp\build\bin\Release"
llama-server.exe %*
