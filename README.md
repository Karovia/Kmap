# Kmap

Kmap 是一个**纯本地优先+云端可选**的知识管理/知识图谱应用，核心目标是实现「安装即离线可用，按需切换云端」，无需任何后端服务、不联网即可使用所有核心能力，同时保留完整的云端部署兼容能力。

当前核心开发优先级：
1. **最高优先级**：Android 端纯本地离线应用重构
2. **第二优先级**：Windows 桌面端移植 + 内网穿透服务端能力
3. **第三优先级**：云端部署形态（原有能力100%保留）

当前仓库采用三层结构：

- `src/`：`React 19 + TypeScript + Vite 6 + Tailwind CSS 4` 前端界面层（90%代码可复用，双模式通用）
- `android/`：`Capacitor Android` 原生宿主工程（本地能力封装核心）
- `backend/`：`FastAPI` 后端服务、LLM 服务商配置与文档处理链路（云端模式100%复用）

项目的优先交付形态是 Android 纯本地离线 App；浏览器运行形态仅用于开发调试，不作为独立 Web 产品交付。

## 项目状态快照（2026-03-11）

| 模块 | 状态 | 当前情况 |
| --- | --- | --- |
| 应用壳层与导航 | ✅ 已落地 | `React Router + HashRouter` 已接入，底部导航与页面切换动画可用 |
| 文档管理 | 🟡 部分完成 | 前后端已打通上传、列表、详情、删除、状态轮询；浏览器上传可用，Android 代码链路已支持原生选文件后读取内容再上传，但仍需真机验证 |
| 服务商配置 | ✅ 已落地 | 设置页与 `/api/v1/providers` 已支持 `chat` / `embedding` 两类服务商的列表、创建、编辑、删除、测试连接 |
| 聊天 | 🟡 基础可用 | `ChatPage` 已接入 `/api/v1/chat`，支持非流式多轮消息提交，但没有历史记录、流式响应、RAG 与引用来源 |
| 图谱 | 🟡 概览版 | `GraphPage` 已接入 `/api/v1/graph/overview`，当前展示的是文档状态、服务商与文档节点的概览图，不是真实实体关系图谱 |
| 首页仪表盘 | 🟡 原型阶段 | `DashboardPage` 仍以静态展示和 mock 数据为主 |
| 平台桥接 | 🟡 部分完成 | 已统一封装文件选择、原生文件读取、权限、分享、保存文件、设备信息、返回键监听；真实设备体验仍待验证 |
| 后端能力 | 🟡 基础完成 | 已提供健康检查、文档管理、服务商配置、聊天、图谱概览接口；认证、完整会话能力、真实图数据库查询尚未完成 |
| Android 宿主 | ✅ 已初始化 | `Capacitor` 工程已生成，应用 ID 为 `com.karovia.kmap`，已有 Android 工程与相关构建脚本 |

## 核心开发 roadmap（当前最高优先级：纯本地化重构）

### 第一阶段：Android 纯本地优先架构重构（进行中）
实现100%纯本地运行，无需任何后端服务、不联网，所有能力打包进APK，安装即可用，同时云端能力无缝兼容。
1. 基础架构搭建与双模式网关适配（1-2天）：新增统一业务网关层，支持「纯本地模式 / 云端模式」一键切换
2. 本地存储与文档管理本地化落地（3-4天）：Android原生存储、向量引擎、文档解析能力替代云端服务
3. 本地AI引擎与服务商配置本地化落地（3-4天）：端侧ONNX Runtime推理，支持本地量化模型运行
4. RAG聊天与图谱能力本地化落地（2-3天）：本地RAG全链路、实体关系图谱完全离线可用
5. 全链路适配、优化与打包（2-3天）：双模式无缝切换，APK体积优化，真机验证

### 第二阶段：Windows 端移植（纯本地化完成后）
- 基于Electron/Tauri移植到Windows桌面端，实现与Android端一致的纯本地运行能力
- 集成Windows本地存储、向量引擎、AI推理全栈能力

### 第三阶段：内网穿透与跨端服务（Windows移植完成后）
- Windows端作为本地服务端，支持内网穿透能力
- 同一局域网内Android端可直接访问Windows端服务，共享本地计算资源
- 云端API调用模型能力作为纯本地服务的一部分，支持多端共享

## 当前已落地能力

- 文档页已支持搜索、状态筛选、上传进度、删除和状态轮询
- 设置页已支持区分 `chat` / `embedding` 服务商，并提供配置指南页
- 聊天页已能调用默认 `chat` 服务商返回回复
- 图谱页已能基于后端聚合数据渲染概览节点和节点详情
- 平台层已收敛到 `src/platform/`，避免页面直接耦合 Capacitor API
- 后端文档处理链路已具备上传落盘、RabbitMQ 投递、Unstructured 分片、Embedding、PostgreSQL / Qdrant 写入能力

## 当前缺口与已知问题

- 首页仍是静态仪表盘，不是实时业务数据
- 当前图谱只是概览视图，还没有 Nebula Graph 实体关系查询与高级交互
- 聊天仍是基础问答，没有流式返回、历史会话、检索增强和引用来源
- `Gemini` 已接入后端对话 / Embedding 代码路径，但还缺少完整联调与稳定性验证
- 如果本地环境未安装 `google-generativeai`，后端仍可启动，但 Gemini 服务商在实际调用时会报缺少依赖
- 文档删除已补上 `Qdrant` 关联向量清理逻辑，但仍需依赖真实环境验证
- Android / Capacitor 打包后的 App 不能依赖 Vite 代理；本地调试需通过 `VITE_API_BASE_URL` 指向真实可达的后端地址
- Android 原生文件上传、权限、分享、返回键等能力仍需真机联调验证

## 仓库结构

```text
.
├── src/        # 前端页面、组件、平台桥接、服务层、状态管理
├── android/    # Capacitor Android 宿主工程
├── backend/    # FastAPI 后端与文档处理链路
├── docs/       # PRD、方案、进度、评审文档
├── scripts/    # 构建与辅助脚本
├── .claude.md  # 仓库级上下文缓存 / 协作记忆
└── README.md   # 对外项目说明
```

## 本地开发

### 前端

```bash
npm install
npm run dev
```

常用命令：

```bash
npm run type-check
npm run lint
npm run build
```

如需在 Android / 真机环境联调后端，请在本地额外配置：

```bash
VITE_API_BASE_URL=http://你的局域网IP:8000
```

如果本机 `8000` 端口被其他服务占用，也可以让后端换到别的端口，并同时配置：

```bash
VITE_API_BASE_URL=http://你的局域网IP:8001
VITE_API_PROXY_TARGET=http://127.0.0.1:8001
```

仓库内也提供了一键脚本：

- `scripts/start-frontend-dev.cmd`
- `scripts/start-backend-dev.cmd`
- `scripts/start-dev-services.cmd`

### 后端

```bash
cd backend
poetry install
cp .env.example .env
docker-compose up -d
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

补充说明：

- LLM 服务商快速启动见 `backend/QUICKSTART_LLM.md`
- 文档处理模块说明见 `backend/docs/document_module.md`
- 服务商配置说明见 `backend/docs/LLM_PROVIDER.md`

### Android

```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

如果需要构建已签名 release 包，确保本地存在：

- `android/keystore.properties`
- `android/*.jks` 或 `android/*.keystore`

当前 `android/app/build.gradle` 已按 Android 工程根目录解析签名文件路径。

## 重要文档

- `docs/产品需求文档.md`：产品目标、功能范围与需求边界
- `docs/项目开发进度与计划.md`：早期推进计划，部分状态描述已过时
- `docs/前端代码分析报告.md`：前端拆分与结构分析
- `docs/Capacitor Android 接入方案.md`：Android 宿主接入思路
- `docs/安卓本地应用开发任务清单.md`：Android 真机与桥接待办
- `docs/后端技术栈初步方案.md`、`docs/后端技术栈选型报告.md`：后端架构选型
- `docs/GitHub-Issue-推进计划.md`：Issue 拆解与推进计划
- `Kmap-P1-Preview开发进度计划表.md`：P1 Preview 阶段进度计划
- `docs/基于Kmap项目的「纯本地优先+云端可选」完整重构方案.md`：当前核心开发 roadmap，纯本地化架构重构的完整实施计划
- `docs/Kmap移动端主攻方向开发计划.md`：Android 主线版本推进计划
- `docs/Kmap本地模型支持技术方案.md`：本地模型与离线能力方案
- `docs/移动端联调问题排查说明.md`：本次真机联调问题、根因和处理建议
- `backend/README.md`：后端总体说明
- `backend/QUICKSTART_LLM.md`：LLM 服务商模块快速启动
- `backend/docs/LLM_PROVIDER.md`：服务商配置模型与 API
- `backend/docs/document_module.md`：文档处理链路说明

> 说明：`docs/` 中部分文档属于早期设计或阶段性分析；若与当前源码冲突，请优先以当前工作树源码、`.claude.md` 和本 README 为准。

## 协作与文档同步

- `.claude.md` 是仓库级上下文缓存，用于沉淀当前真实状态、边界和重要文档摘要
- 任何功能、接口、目录结构或完成度变化后，都要同步更新 `.claude.md` 与 `README.md`
- 对完成度统一使用：`已落地`、`部分完成`、`概览版 / 原型`、`规划中`
