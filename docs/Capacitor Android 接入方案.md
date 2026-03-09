# Capacitor Android 接入方案

## 1. 文档目标

本方案用于指导 Kmap 将现有前端界面层封装为 Android 本地应用。目标是确保项目交付形态为可安装 App，而不是面向用户直接访问的 Web 产品。

## 2. 当前基础

- 当前界面层技术栈：React 19 + TypeScript + Vite 6
- 当前页面形态：首页、文档、图谱、对话、设置
- 当前已完成首轮页面级拆分
- 当前目录已具备 `pages / components / services / types / platform / utils / data` 基础骨架
- 当前目标平台：Android

## 3. 接入原则

1. 继续复用现有前端页面与业务逻辑
2. 浏览器只作为开发调试环境，不作为产品交付形态
3. 所有安卓系统能力通过桥接层提供，不直接散落在页面组件中
4. 先完成结构重构，再接入原生能力

## 4. 目标架构

```text
React UI / 页面 / 状态 / API
        |
        v
platform 适配层（TypeScript 接口）
        |
        v
Capacitor Plugins / 自定义 Android Plugin
        |
        v
Android App 宿主
```

## 5. 当前目录与目标目录

### 当前目录

```text
src/
├── App.tsx
├── components/
├── data/
├── pages/
├── platform/
├── services/
├── types/
├── utils/
├── main.tsx
└── index.css
```

### 目标补全目录

```text
src/
├── app/                 # 应用装配（后续可选）
├── pages/
├── components/
├── services/
├── platform/
├── stores/
├── types/
├── hooks/
└── utils/

android/
capacitor.config.ts
```

## 6. 当前完成度

### 已完成

- `App.tsx` 已收敛为应用壳层
- `BottomNav` 已独立为公共组件
- 5 个一级页面已完成页面级拆分
- `platform/` 已建立基础接口占位

### 未完成

- React Router 未接入
- Capacitor 尚未初始化
- Android 原生桥接未真正落地

## 7. 首批桥接能力清单

### 7.1 文件能力

- `pickDocument()`：选择文档
- `readSelectedFile()`：读取已选文件信息
- `uploadDocumentFromDevice()`：从本地文件发起上传

### 7.2 权限能力

- `requestStoragePermission()`：申请存储权限
- `checkStoragePermission()`：检查权限状态

### 7.3 设备与系统能力

- `shareContent()`：分享文本或文件
- `saveFile()`：保存文件到本地目录
- `getAppInfo()`：获取版本号、构建号
- `handleBackButton()`：统一处理 Android 返回键

## 8. 界面层接口约束

所有页面只能调用 `src/platform/` 暴露的接口，不允许直接依赖 Capacitor API。

当前建议继续沿用统一返回结构：

```ts
export interface PlatformResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}
```

## 9. 接入步骤

### 阶段一：继续整理界面层

- 引入 React Router
- 继续拆分 `DocumentsPage` 和 `SettingsPage`
- 建立 `stores/` 与 `hooks/`

### 阶段二：Capacitor 初始化

- 安装 `@capacitor/core`
- 安装 `@capacitor/cli`
- 初始化 `capacitor.config.ts`
- 添加 Android 平台

参考命令：

```bash
npm install @capacitor/core @capacitor/cli
npx cap init
npx cap add android
```

### 阶段三：构建产物接入 Android

- 配置前端构建目录为 Capacitor 可读取的静态资源目录
- 执行前端打包
- 同步到 Android 工程

参考命令：

```bash
npm run build
npx cap sync android
```

### 阶段四：桥接能力接入

- 接入官方插件可覆盖的能力
- 对文件选择、复杂文件访问等能力补充自定义插件
- 将桥接能力封装到 `src/platform/`

### 阶段五：真机验证

- 验证启动流程
- 验证文件上传
- 验证权限申请
- 验证返回键
- 验证软键盘和安全区

## 10. 推荐优先安装的 Capacitor 能力

- `@capacitor/android`
- `@capacitor/app`
- `@capacitor/filesystem`
- `@capacitor/share`
- `@capacitor/preferences`
- `@capacitor/status-bar`
- `@capacitor/keyboard`

## 11. 打包与调试流程

### 开发阶段

1. 使用 `npm run dev` 调试界面层
2. 使用浏览器快速验证 UI 和业务逻辑
3. 不把浏览器行为当成最终产品行为

### App 集成阶段

1. 执行 `npm run build`
2. 执行 `npx cap sync android`
3. 用 Android Studio 打开 `android/`
4. 运行模拟器或真机调试

## 12. 风险与注意事项

### 12.1 当前代码结构风险

- 虽然已完成首轮拆分，但 `DocumentsPage` 和 `SettingsPage` 仍偏大
- 当前仍以状态切换代替路由，不利于 App 生命周期管理

### 12.2 平台能力风险

- Android 文件 URI 和权限模型比浏览器复杂
- 不同 Android 版本的存储访问策略存在差异
- 图谱页面在 WebView 容器中的性能需要单独验证

### 12.3 工程流程风险

- 若前端构建目录、资源路径、路由基址配置不正确，App 启动后会出现空白页
- 若页面直接依赖浏览器特有 API，进入 App 容器后可能异常

## 13. 近期执行建议

1. 先完成 React Router 接入
2. 继续拆分文档页和设置页
3. 接着初始化 Capacitor Android 工程
4. 首批只打通文件选择、上传、权限、分享四类能力
5. 图谱性能放到真机验证后再决定是否做专项优化
