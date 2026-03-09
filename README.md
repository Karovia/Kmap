# Kmap - 安卓本地知识图谱应用

Kmap 是一款面向知识管理场景的 AI 本地应用，提供文档接入、知识抽取、图谱浏览、智能问答和模型配置等能力。项目当前以前端界面层和后端服务为基础，目标交付形态是可安装的 Android App，而不是面向用户直接访问的 Web 产品。

## 当前定位

- 产品形态：Android 本地应用
- 界面层技术栈：`React 19 + TypeScript + Vite 6 + Tailwind CSS 4`
- 当前前端状态：已完成首轮模块化拆分，不再是单体 `src/App.tsx`
- 当前技术路线：以现有 React 前端作为 App 内部界面层，通过 `Capacitor Android` 封装为本地应用
- 后端形态：仓库内包含服务端代码与接口基础设施

## 当前已完成的界面层重构

- `src/App.tsx` 已收敛为应用壳层，仅负责页面切换和导航装配
- 5 个一级页面已拆分到 `src/pages/`
- 底部导航已抽离到 `src/components/navigation/BottomNav.tsx`
- API、类型、工具、平台占位层已建立基础目录
- 设置页现已支持分别管理“对话模型服务商”和“Embedding 模型服务商”
- 设置页新增了“详细配置指南”入口，可跳转查看火山方舟模型配置教程

当前目录骨架：

```text
src/
├── App.tsx
├── components/
│   └── navigation/
├── data/
├── pages/
├── platform/
├── services/
├── types/
├── utils/
├── main.tsx
└── index.css
```

## 我们不做什么

- 不做面向用户直接访问的公开 Web 应用
- 不把浏览器端当正式产品交付形态
- 不为 SEO、PC 浏览器兼容、站点运营场景做额外建设
- 不采用 React Native 重写当前前端

## 为什么这样做

根据 `docs/前端代码分析报告.md` 与当前代码状态，项目具备以下特点：

- 已完成基于 React + Vite 的页面原型，包含首页、文档、图谱、对话、设置 5 个一级页面
- 当前页面结构已开始模块化，适合继续向 App 化架构演进
- 主要差距集中在路由、平台桥接、原生能力接入，而不是页面本身缺失
- 安卓 App 所需的关键差异主要在文件、权限、存储、分享、通知、返回键等系统能力

因此，项目采用“Android 本地 App + 内部前端界面层 + 原生桥接”的路线推进，而不是建设独立 Web 产品。

## 目标架构

### 界面与业务层

- React 负责页面渲染与业务编排
- TypeScript 负责类型约束
- 后续引入 React Router 管理页面路由
- `services/` 统一处理 API 请求

### 平台适配层

- `platform/` 统一封装平台检测与能力接口
- 在开发阶段可保留浏览器调试能力，但仅作为开发手段，不作为产品交付
- Android 容器环境通过桥接调用原生能力

### 安卓宿主层

- 采用 `Capacitor Android` 作为本地 App 容器
- 使用 Capacitor Plugins 或自定义插件接入原生能力
- 负责权限、文件选择、文件系统、分享、通知、返回键、启动参数等系统能力

## 安卓本地应用的能力边界

### 由前端界面层承担

- 首页仪表盘
- 文档列表与筛选
- 聊天界面
- 设置页
- 大部分图谱浏览交互

### 由安卓原生层承担

- 文件选择与上传入口
- Android 存储权限申请
- 本地文件读写
- 下载与分享
- 通知、外部唤起、返回键等系统交互

### 后续按性能评估处理

- 大规模知识图谱渲染
- 大文件导入与后台任务联动

## 当前代码结构

```text
Kmap/
├── src/
│   ├── App.tsx
│   ├── components/
│   │   └── navigation/BottomNav.tsx
│   ├── data/
│   │   └── mockActivities.ts
│   ├── pages/
│   │   ├── DashboardPage.tsx
│   │   ├── DocumentsPage.tsx
│   │   ├── GraphPage.tsx
│   │   ├── ChatPage.tsx
│   │   └── SettingsPage.tsx
│   ├── platform/
│   ├── services/
│   ├── types/
│   └── utils/
├── backend/
├── docs/
├── .claude.md
└── README.md
```

## 迭代路线

### P0：App 化重构

- [x] 拆分 `src/App.tsx`
- [x] 抽离 `pages/`、`components/`、`services/`、`types/`、`platform/`、`utils/`
- [ ] 引入 React Router
- [ ] 继续把文档页和设置页拆成更细的子组件

### P1：安卓宿主接入

- [ ] 引入 `Capacitor Android`
- [ ] 建立 Android 工程与打包流程
- [ ] 打通文件选择、权限、上传等桥接能力

### P2：移动端体验优化

- [ ] 底部导航与安全区适配
- [ ] 聊天输入区与软键盘适配
- [ ] Android 返回键与深链接处理
- [ ] 离线缓存与启动性能优化

## 当前技术栈

### 界面层

- React 19
- TypeScript
- Vite 6
- Tailwind CSS 4
- Motion
- Lucide React
- D3.js（已引入，后续用于图谱增强）

### 安卓宿主

- Capacitor Android（规划采用）
- 原生桥接插件（按需补充）

### 后端

- Python 3.11
- FastAPI
- LangChain

## 本地开发

### 界面层开发

```bash
npm install
npm run dev
```

说明：开发阶段仍可在浏览器中调试界面，但这只是开发手段，最终交付目标始终是 Android 本地 App。

### 构建

```bash
npm run build
```

### 类型检查

```bash
npm run type-check
```

### 后端

请参考 `backend/README.md`。

## 相关文档

- 开发规范：`./.claude.md`
- 前端代码分析报告：`./docs/前端代码分析报告.md`
- 安卓接入方案：`./docs/Capacitor Android 接入方案.md`
- 安卓应用开发任务清单：`./docs/安卓本地应用开发任务清单.md`
- 项目开发进度与计划：`./docs/项目开发进度与计划.md`
- 后端技术栈选型报告：`./docs/后端技术栈选型报告.md`
- 产品需求文档：`./docs/产品需求文档.md`

## 当前重点事项

- 继续细化前端页面拆分，降低页面文件复杂度
- 引入路由与平台桥接层
- 为安卓端建立宿主层与原生能力接入
- 优先交付 Android 安装包，暂不建设独立 Web 产品

## 许可证

MIT License
