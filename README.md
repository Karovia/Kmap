# Kmap

Kmap 是一个面向知识管理场景的 Android 本地知识图谱应用仓库。

当前仓库包含三部分：

- `src/`：基于 `React 19 + TypeScript + Vite 6 + Tailwind CSS 4` 的前端界面层
- `android/`：基于 `Capacitor Android` 的原生宿主工程
- `backend/`：基于 `FastAPI` 的后端服务与文档处理能力

项目的最终交付形态是 Android App。浏览器运行形态仅用于开发调试，不作为独立 Web 产品交付。

## 项目状态快照（2026-03-11）

| 模块 | 状态 | 当前情况 |
| --- | --- | --- |
| 应用壳层与导航 | ✅ 已落地 | `React Router + HashRouter` 已接入，底部导航与一级页面切换可用 |
| 文档管理 | 🟡 部分完成 | 前后端已打通文档上传、列表、删除、状态轮询；浏览器上传可用，Android 原生选中文件后的真实内容上传仍未闭环 |
| 服务商配置 | ✅ 已落地 | 前端设置页与后端 `/api/v1/providers` 已支持列表、创建、编辑、删除、测试连接 |
| Android 宿主 | ✅ 已初始化 | `Capacitor` 工程已生成，应用 ID 为 `com.karovia.kmap`，仓库内已有 APK 构建产物 |
| 平台桥接 | 🟡 部分完成 | `pickDocument`、权限、分享、保存文件、设备信息、返回键监听接口已封装，但仍需继续补齐真实业务链路 |
| 首页 / 图谱 / 聊天 | 🟡 原型阶段 | 页面骨架与视觉稿已在 `src/pages/` 中落地，但图谱与聊天尚未接入真实数据与业务接口 |
| 后端能力 | 🟡 基础完成 | 已提供健康检查、文档管理、LLM 服务商配置接口；聊天、图谱、认证授权等能力尚未实现 |
| 工程校验 | 🟡 部分完成 | 本次检查中 `npm run type-check` 通过；`npm run lint` 当前因 ESLint 9 配置模式不匹配失败；`vite build` 未在当前受限环境中复验成功 |

## 当前已落地能力

- 前端已完成页面级拆分，`src/App.tsx` 只负责应用壳层、路由装配与页面切换动画
- 入口已使用 `HashRouter`，更适合 `Capacitor` 容器场景
- 文档页已拆为页面、Hook 和多个文档组件，支持搜索、状态筛选、删除与轮询反馈
- 设置页已拆为页面、服务商列表、表单弹窗、状态提示和配置指南页面
- `src/services/`、`src/platform/`、`src/stores/`、`src/hooks/`、`src/types/` 等基础层已建立
- 后端已提供 `/api/v1/documents`、`/api/v1/providers`、`/health` 等基础接口
- Android 宿主工程已生成，当前构建产物可见于：
  - `android/app/build/outputs/apk/debug/app-debug.apk`
  - `android/app/build/outputs/apk/release/app-release.apk`

## 当前缺口与已知问题

- `DashboardPage`、`GraphPage`、`ChatPage` 目前主要还是静态展示或交互原型，不应视为完整业务能力
- Android 原生文件选择虽然已经通过 `src/platform/index.ts` 封装，但 `useDocuments` 中当前仍使用空 `File` 对象上传，原生选中文件后并未把真实字节流送到后端
- 后端尚未提供聊天接口、图谱查询接口、认证授权与完整文档处理联调闭环
- 根目录 `package.json` 的包名仍是 `react-example`，尚未完全完成工程品牌化整理
- `npm run lint` 目前不可用，原因是仓库仍使用 `.eslintrc.json`，但依赖版本已是 ESLint 9，需迁移到 `eslint.config.js` 或回退 ESLint 版本

## 仓库结构

```text
Kmap/
├── src/
│   ├── components/
│   ├── data/
│   ├── hooks/
│   ├── pages/
│   ├── platform/
│   ├── services/
│   ├── stores/
│   ├── types/
│   └── utils/
├── android/
├── backend/
├── docs/
├── capacitor.config.ts
├── .claude.md
└── README.md
```

## 环境要求

### 前端

- Node.js `20+`
- npm `10+`

### Android

- Android Studio
- Android SDK
- JDK `17+`
- 正确配置 `JAVA_HOME`

### 后端

- Python `3.11`
- Poetry（推荐）
- Docker Desktop（需要完整依赖栈时）

## 本地开发

### 1. 前端

安装依赖：

```bash
npm install
```

启动开发服务器：

```bash
npm run dev
```

类型检查：

```bash
npm run type-check
```

注意：

- `npm run lint` 当前会失败，需先修复 ESLint 配置
- `npm run build` 请在本机完整环境中执行并复验

### 2. 后端

进入后端目录：

```bash
cd backend
```

复制环境变量示例：

```bash
cp .env.example .env
```

安装依赖并启动：

```bash
poetry install
poetry run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

默认接口地址：

- API 根路径：`http://localhost:8000/api/v1`
- Swagger 文档：`http://localhost:8000/docs`

### 3. Android

先构建前端资源：

```bash
npm run build
```

同步到 Android 工程：

```bash
npx cap sync android
```

用 Android Studio 打开：

```bash
npx cap open android
```

如果需要命令行构建 APK：

```bash
cd android
./gradlew assembleDebug
./gradlew assembleRelease
```

## 本次检查记录（2026-03-11）

- `npm run type-check`：✅ 通过
- `npm run lint`：❌ 失败，当前配置与 ESLint 9 不兼容
- `vite build`：⚠️ 在当前 CLI 受限环境中触发 `spawn EPERM`，本次未复验成功
- 后端测试：⚠️ 当前环境没有可直接使用的 Python 运行时，本次未复验

## 当前建议优先级

1. 补齐 Android 原生文件选择后的真实内容上传链路
2. 完成聊天接口与聊天页接入
3. 完成图谱数据接口与图谱页接入
4. 修复 ESLint 配置，恢复 `npm run lint`
5. 在真机环境复验 APK 安装、权限、分享、返回键与安全区体验

## 相关文档

- `docs/项目开发进度与计划.md`
- `docs/Capacitor Android 接入方案.md`
- `docs/产品需求文档.md`
- `代码审查和测试报告.md`
