# 模型文件放置说明

请将以下模型文件放置到对应目录：

## Qwen2-0.5B ONNX 量化版本
- 放置目录：`qwen2/`
- 需要的文件：
  - model.onnx (量化后的ONNX模型文件)
  - config.json (模型配置文件)
  - tokenizer.json / tokenizer.model (分词器文件)
  - vocab.json (词汇表文件)

## bge-small-zh ONNX 量化版本
- 放置目录：`bge/`
- 需要的文件：
  - model.onnx (量化后的ONNX模型文件)
  - config.json (模型配置文件)
  - tokenizer.json / tokenizer.model (分词器文件)

## 注意事项
1. 确保使用的是ARM架构优化的量化版本模型
2. 模型文件总大小应该控制在500MB以内，确保APK总大小不超过600MB
3. 请勿修改文件名，否则初始化代码会找不到模型
