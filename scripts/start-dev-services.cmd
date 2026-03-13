@echo off
setlocal
cd /d D:\Kmap
start "Kmap Backend" "D:\Kmap\scripts\start-backend-dev.cmd"
start "Kmap Frontend" "D:\Kmap\scripts\start-frontend-dev.cmd"

