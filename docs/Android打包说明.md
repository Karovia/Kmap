# Kmap Android APK 打包说明

## 一、打包前准备

### 1.1 环境要求
- Node.js 18+
- Android SDK 33+
- JDK 17+
- Gradle 8.0+

### 1.2 模型文件准备
请将以下模型文件放置到 `android/app/src/main/assets/models/` 目录：

#### Qwen2-0.5B ONNX 量化版本
放置目录：`android/app/src/main/assets/models/qwen2/`
需要的文件：
- `model.onnx` - 量化后的ONNX模型文件（约350MB）
- `config.json` - 模型配置文件
- `tokenizer.json` / `tokenizer.model` - 分词器文件
- `vocab.json` - 词汇表文件

#### bge-small-zh ONNX 量化版本
放置目录：`android/app/src/main/assets/models/bge/`
需要的文件：
- `model.onnx` - 量化后的ONNX模型文件（约50MB）
- `config.json` - 模型配置文件
- `tokenizer.json` / `tokenizer.model` - 分词器文件

**注意：**
- 请使用ARM架构优化的INT4/INT8量化版本模型
- 模型文件总大小应控制在450MB以内，确保最终APK大小不超过600MB
- 请勿修改文件名，否则初始化代码会找不到模型

### 1.3 签名配置
项目已配置好签名信息，位于 `android/keystore.properties`，如需修改请自行调整。

## 二、打包命令

### 2.1 全自动打包（推荐）
直接运行脚本：
```bash
scripts/build-android-apk.cmd
```

脚本会自动执行以下步骤：
1. 安装前端依赖
2. 构建前端生产版本
3. 同步Capacitor配置到Android工程
4. 构建Android APK release版本

### 2.2 手动分步打包

#### 步骤1：安装依赖
```bash
npm install
```

#### 步骤2：构建前端
```bash
npm run build
```

#### 步骤3：同步Capacitor
```bash
npx cap sync android
```

#### 步骤4：构建APK
```bash
cd android
gradlew assembleRelease
```

## 三、输出说明

### 3.1 APK文件路径
生成的APK文件位于：
```
android/app/build/outputs/apk/release/
```

文件说明：
- `app-armeabi-v7a-release.apk` - 32位ARM架构版本（约550MB）
- `app-arm64-v8a-release.apk` - 64位ARM架构版本（约560MB）

### 3.2 APK配置说明
| 配置项 | 值 |
|--------|----|
| 支持Android版本 | Android 9+ (API 28+) |
| 支持架构 | armeabi-v7a, arm64-v8a |
| 代码混淆 | 已开启 |
| 资源压缩 | 已开启 |
| 硬件加速 | 已开启 |
| NNAPI加速 | 自动启用（如果设备支持） |
| 总大小 | 约550-600MB |

## 四、功能说明

### 4.1 首次启动流程
1. 应用首次启动时会弹出初始化提示
2. 自动将assets中的模型文件复制到应用私有存储目录（/data/data/com.karovia.kmap/files/models/）
3. 自动初始化ONNX Runtime推理服务
4. 初始化完成后弹出提示，告知用户可离线使用

### 4.2 离线功能
打包后的APK包含所有必要的模型文件，安装后：
- 无需额外下载任何文件
- 无网络环境下可正常使用所有本地文档处理和问答功能
- 支持文档上传、解析、向量化存储和本地问答

### 4.3 权限说明
APK已配置以下必要权限：
- `INTERNET` - 网络访问（可选，用于云端功能）
- `READ_EXTERNAL_STORAGE` / `WRITE_EXTERNAL_STORAGE` - 存储读写（Android 12及以下）
- `READ_MEDIA_*` - 媒体文件读取（Android 13+）
- `WAKE_LOCK` - 防止休眠（后台处理时使用）
- `FOREGROUND_SERVICE` - 前台服务（后台下载和处理）
- `ACCESS_NETWORK_STATE` - 网络状态检测

## 五、常见问题

### 5.1 打包失败
1. 检查环境变量是否正确配置（ANDROID_HOME, JAVA_HOME）
2. 检查模型文件是否放置到正确目录
3. 检查依赖是否完整安装
4. 查看构建日志定位具体错误

### 5.2 APK过大
1. 确保使用的是量化版本模型
2. 检查是否有多余的资源文件被打包
3. 可以考虑只构建单一架构版本减少体积

### 5.3 初始化失败
1. 检查模型文件是否完整
2. 检查应用存储权限是否开启
3. 重启应用重试

## 六、测试建议
1. 安装APK后首次启动，确认初始化流程正常
2. 断网环境下测试文档上传和问答功能
3. 测试不同Android版本和设备的兼容性
4. 验证APK大小是否符合要求
