# Android 真机联调修复指南

> 更新时间：2026-03-13
> 状态：Top 0 Issue 修复方案

## 问题概述

当前 Android 真机联调失败的根本原因：
1. Docker Desktop 未运行
2. 后端依赖服务（PostgreSQL、Redis、RabbitMQ、Qdrant、Nebula Graph）无法启动
3. 即使后端 API 进程启动，也无法正常处理业务请求

## 修复步骤

### 第一步：启动 Docker Desktop

1. 打开 Docker Desktop 应用
2. 等待 Docker Engine 完全启动（托盘图标变为绿色）
3. 验证 Docker 是否正常运行：

```bash
docker ps
```

如果能正常显示容器列表（即使是空的），说明 Docker 已就绪。

### 第二步：启动后端依赖服务

进入后端目录并启动所有依赖服务：

```bash
cd D:\Kmap\backend
docker-compose up -d
```

等待所有容器启动完成（约 1-2 分钟），然后验证：

```bash
docker ps
```

应该看到以下容器正在运行：
- kmap-postgres
- kmap-redis
- kmap-qdrant
- kmap-rabbitmq
- kmap-nebula-metad
- kmap-nebula-storaged
- kmap-nebula-graphd

### 第三步：配置局域网 IP

1. 查看当前电脑的局域网 IP：

```bash
ipconfig | findstr "IPv4"
```

假设得到的 IP 是 `10.157.64.171`（根据实际情况调整）

2. 创建或修改 `.env` 文件：

```bash
# 在项目根目录创建 .env 文件
VITE_API_BASE_URL=http://10.157.64.171:8001
VITE_API_PROXY_TARGET=http://127.0.0.1:8001
```

### 第四步：启动后端服务

使用提供的脚本启动后端（端口 8001）：

```bash
D:\Kmap\scripts\start-backend-dev.cmd
```

或手动启动：

```bash
cd D:\Kmap\backend
poetry install
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### 第五步：验证后端健康状态

在电脑浏览器中访问：

```
http://127.0.0.1:8001/api/v1/health
```

应该返回类似：

```json
{
  "status": "healthy",
  "timestamp": "2026-03-13T..."
}
```

### 第六步：验证手机能访问后端

在手机浏览器中访问（替换为实际 IP）：

```
http://10.157.64.171:8001/api/v1/health
```

如果无法访问，检查：
1. 手机和电脑是否在同一 Wi-Fi 网络
2. Windows 防火墙是否放行 8001 端口
3. 企业网络是否限制局域网互访

### 第七步：重新构建并安装 APK

1. 重新构建前端：

```bash
cd D:\Kmap
npm run build
```

2. 同步到 Android：

```bash
npx cap sync android
```

3. 构建 APK：

```bash
cd android
gradlew assembleRelease
```

4. 安装到手机：

```
android\app\build\outputs\apk\release\Kmap-P1-preview.apk
```

### 第八步：真机功能验证

按以下顺序验证：

1. **设置页** - 验证服务商列表能否加载
2. **图谱页** - 验证概览数据能否显示
3. **文档页** - 验证文档列表、上传、删除功能
4. **聊天页** - 验证基础对话功能

## 常见问题排查

### 问题 1：Docker 容器启动失败

```bash
# 查看容器日志
docker logs kmap-postgres
docker logs kmap-redis
docker logs kmap-qdrant
```

### 问题 2：后端启动报错

检查 `backend/.env` 文件是否正确配置：

```bash
cd backend
cat .env
```

### 问题 3：手机无法访问电脑后端

1. 检查防火墙规则：

```bash
# 在 Windows 防火墙中添加入站规则，允许 8001 端口
```

2. 确认手机和电脑在同一网络：

```bash
# 在手机上 ping 电脑 IP
ping 10.157.64.171
```

### 问题 4：APK 安装后仍然无法访问 API

检查 APK 中打包的环境变量：

```bash
# 确保构建前 .env 文件中的 VITE_API_BASE_URL 正确
cat .env
```

## 验收标准

完成以下所有项即可认为真机联调成功：

- [ ] Docker Desktop 正常运行
- [ ] 所有后端依赖服务容器正常运行
- [ ] 后端 API 服务在 8001 端口正常响应
- [ ] 电脑浏览器能访问 health 接口
- [ ] 手机浏览器能访问 health 接口
- [ ] APK 安装到手机后能正常加载各页面数据
- [ ] 文档上传功能正常工作
- [ ] 服务商配置功能正常工作
- [ ] 聊天功能能返回响应
- [ ] 图谱页能显示概览数据

## 下一步工作

真机联调通过后，继续推进：

1. **P1 剩余任务**：
   - 验证权限申请流程
   - 验证分享功能
   - 验证返回键处理
   - 验证安全区与软键盘适配

2. **P2 优化任务**：
   - 图谱与上传性能优化
   - 补充前后端测试
   - 清理工程命名与依赖

## 相关文档

- `docs/移动端联调问题排查说明.md` - 之前的问题分析
- `docs/GitHub-Issue-推进计划.md` - 整体推进计划
- `docs/安卓本地应用开发任务清单.md` - 开发任务清单
