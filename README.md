<div align="center">
<img width="1200" height="475" alt="Kmap Banner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Kmap - 智能知识图谱应用

Kmap 是一款基于 AI 的知识图谱管理与应用平台，支持文档上传、知识自动抽取、图谱可视化、智能问答等功能，帮助用户高效管理和利用知识资产。

## ✨ 功能特性

- 📁 **多格式文档支持**：支持 PDF、DOCX、CSV、TXT 等多种格式文档上传
- 🧠 **智能知识抽取**：自动从文档中抽取实体和关系，构建知识图谱
- 🎨 **3D图谱可视化**：直观展示知识网络结构，支持交互探索
- 💬 **AI智能问答**：基于知识图谱的自然语言问答，精准获取信息
- 📊 **数据仪表盘**：展示知识总量、实体类型、关系分布等统计信息
- ⚙️ **灵活配置**：支持多种 LLM 模型和向量模型配置

## 🛠️ 技术栈

### 前端
- **框架**：React 19 + TypeScript
- **构建工具**：Vite 6.x
- **样式方案**：Tailwind CSS 4.x
- **UI组件**：Lucide React + Framer Motion
- **可视化**：D3.js + 3D 图谱渲染引擎
- **AI集成**：Google GenAI SDK

### 后端
- **框架**：Python 3.11 + FastAPI + LangChain
- **数据存储**：
  - 业务数据库：PostgreSQL 16+
  - 向量数据库：Qdrant（本地部署，高性能向量检索）
  - 图数据库：Nebula Graph v3.6+（分布式知识图谱存储）
  - 缓存/消息队列：Redis 7+ + RabbitMQ 3.12+
- **核心服务**：
  - 文档解析：Unstructured.IO（多格式文档结构化解析）
  - 多LLM适配：统一支持 OpenAI、Claude、Gemini 和自定义服务商
  - 知识图谱：大模型知识抽取 + 自然语言Schema设计

## 🚀 本地运行

### 环境要求
- Node.js 18+
-  Gemini API Key（用于AI功能）

### 运行步骤
1. 安装依赖：
   ```bash
   npm install
   ```
2. 配置环境变量：
   复制 `.env.example` 为 `.env.local`，并配置 `GEMINI_API_KEY`
3. 启动开发服务：
   ```bash
   npm run dev
   ```
4. 访问应用：
   打开浏览器访问 `http://localhost:3000`

## 📁 项目结构
```
Kmap/
├── src/                    # 前端代码主目录
│   ├── App.tsx             # 主应用组件
│   ├── main.tsx            # 应用入口
│   ├── index.css           # 全局样式
│   ├── components/         # 公共组件
│   ├── pages/              # 页面组件
│   ├── services/           # API服务封装
│   ├── types/              # TypeScript类型定义
│   └── utils/              # 工具函数
├── docs/                   # 项目文档
│   ├── 前端代码分析报告.md
│   ├── 后端技术栈选型报告.md
│   └── 产品需求文档.md
├── .env.example            # 环境变量示例
├── .claude.md              # 项目开发规范
├── tsconfig.json           # TypeScript配置
├── vite.config.ts          # Vite构建配置
└── README.md               # 项目说明文档
```

## 📄 相关文档
- [前端代码分析报告](./docs/前端代码分析报告.md)
- [后端技术栈选型报告](./docs/后端技术栈选型报告.md)
- [产品需求文档](./docs/产品需求文档.md)
- [开发规范](./.claude.md)

## 🤝 贡献指南
1. Fork 本仓库
2. 创建功能分支：`git checkout -b feature/xxx`
3. 提交更改：`git commit -m 'feat: 添加 xxx 功能'`
4. 推送分支：`git push origin feature/xxx`
5. 提交 Pull Request

## 📄 许可证
MIT License
