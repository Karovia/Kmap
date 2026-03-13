@echo off
setlocal enabledelayedexpansion

echo ==============================================
echo Kmap Android APK 打包脚本
echo ==============================================
echo.

:: 检查Node.js是否安装
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到Node.js，请先安装Node.js
    pause
    exit /b 1
)

:: 检查npm是否安装
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到npm，请先安装npm
    pause
    exit /b 1
)

:: 检查Android SDK是否配置
if not defined ANDROID_HOME (
    echo 警告: ANDROID_HOME环境变量未设置，可能导致打包失败
    echo 请确保已安装Android SDK并配置ANDROID_HOME环境变量
    echo.
)

:: 检查模型文件是否存在
set MODEL_DIR=android\app\src\main\assets\models
set QWEN2_MODEL=%MODEL_DIR%\qwen2\model.onnx
set BGE_MODEL=%MODEL_DIR%\bge\model.onnx

if not exist "%QWEN2_MODEL%" (
    echo 警告: 未找到Qwen2模型文件 %QWEN2_MODEL%
    echo 请将Qwen2-0.5B ONNX量化模型放置到 %MODEL_DIR%\qwen2\ 目录
    echo.
)

if not exist "%BGE_MODEL%" (
    echo 警告: 未找到BGE模型文件 %BGE_MODEL%
    echo 请将bge-small-zh ONNX量化模型放置到 %MODEL_DIR%\bge\ 目录
    echo.
)

echo [1/4] 安装前端依赖...
call npm install
if %errorlevel% neq 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)
echo 依赖安装完成
echo.

echo [2/4] 构建前端生产版本...
call npm run build
if %errorlevel% neq 0 (
    echo 错误: 前端构建失败
    pause
    exit /b 1
)
echo 前端构建完成
echo.

echo [3/4] 同步Capacitor配置到Android工程...
call npx cap sync android
if %errorlevel% neq 0 (
    echo 错误: Capacitor同步失败
    pause
    exit /b 1
)
echo Capacitor同步完成
echo.

echo [4/4] 构建Android APK release版本...
cd android
call gradlew assembleRelease
if %errorlevel% neq 0 (
    echo 错误: APK构建失败
    cd ..
    pause
    exit /b 1
)
cd ..
echo APK构建完成
echo.

echo ==============================================
echo 打包完成!
echo ==============================================
echo.

:: 显示生成的APK文件路径
set APK_DIR=android\app\build\outputs\apk\release
echo 生成的APK文件位于:
echo %CD%\%APK_DIR%\
echo.

dir /b "%APK_DIR%\*.apk"
echo.

echo 注意:
echo 1. 请确保已将模型文件放置到正确的目录
echo 2. 基础版APK总大小应控制在600MB以内
echo 3. 生成的APK支持Android 9+，armeabi-v7a和arm64-v8a架构
echo 4. 已开启代码混淆和资源压缩
echo.

pause
