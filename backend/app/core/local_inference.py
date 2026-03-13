import os
import numpy as np
from typing import List, Optional, Any
from dataclasses import dataclass
import logging

logger = logging.getLogger(__name__)

try:
    import onnxruntime as ort
except ImportError:
    ort = None
    logger.warning("ONNX Runtime 未安装，本地推理功能不可用")

try:
    from transformers import AutoTokenizer
except ImportError:
    AutoTokenizer = None
    logger.warning("Transformers 未安装，本地推理功能不可用")


@dataclass
class InferenceConfig:
    """推理配置"""
    model_path: str
    tokenizer_path: str
    max_seq_len: int = 512
    temperature: float = 0.7
    top_p: float = 0.9
    use_gpu: bool = False


class LocalLLM:
    """本地LLM推理封装，基于ONNX Runtime"""

    def __init__(self, config: InferenceConfig):
        if ort is None or AutoTokenizer is None:
            raise RuntimeError("请先安装 onnxruntime 和 transformers 库")

        self.config = config
        self.tokenizer = AutoTokenizer.from_pretrained(config.tokenizer_path)

        # 配置ONNX Runtime会话
        sess_options = ort.SessionOptions()
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        providers = ['CPUExecutionProvider']
        if config.use_gpu and 'CUDAExecutionProvider' in ort.get_available_providers():
            providers = ['CUDAExecutionProvider']

        self.session = ort.InferenceSession(
            config.model_path,
            sess_options=sess_options,
            providers=providers
        )

        # 检查模型输入输出
        self.input_names = [input.name for input in self.session.get_inputs()]
        self.output_names = [output.name for output in self.session.get_outputs()]
        logger.info(f"本地LLM模型加载完成，输入: {self.input_names}, 输出: {self.output_names}")

    def generate(self, prompt: str, max_new_tokens: int = 200, **kwargs) -> str:
        """生成文本"""
        try:
            # 编码输入
            inputs = self.tokenizer(
                prompt,
                return_tensors="np",
                truncation=True,
                max_length=self.config.max_seq_len - max_new_tokens,
                padding=True
            )

            input_ids = inputs["input_ids"]
            attention_mask = inputs["attention_mask"]

            # 逐token生成
            for _ in range(max_new_tokens):
                outputs = self.session.run(
                    self.output_names,
                    {
                        "input_ids": input_ids,
                        "attention_mask": attention_mask
                    }
                )

                # 获取下一个token的logits
                logits = outputs[0][:, -1, :]

                # 应用温度和top-p采样
                logits = logits / max(self.config.temperature, 1e-8)

                # Top-p过滤
                sorted_logits = np.sort(logits, axis=-1)[:, ::-1]
                sorted_indices = np.argsort(logits, axis=-1)[:, ::-1]
                cumulative_probs = np.cumsum(np.exp(sorted_logits) / np.sum(np.exp(sorted_logits), axis=-1, keepdims=True), axis=-1)

                # 移除累积概率超过top_p的token
                sorted_indices_to_remove = cumulative_probs > self.config.top_p
                sorted_indices_to_remove[:, 1:] = sorted_indices_to_remove[:, :-1].copy()
                sorted_indices_to_remove[:, 0] = 0

                indices_to_remove = np.zeros_like(logits, dtype=bool)
                for i in range(logits.shape[0]):
                    indices_to_remove[i, sorted_indices[i, sorted_indices_to_remove[i]]] = True

                logits[indices_to_remove] = -float('inf')

                # 采样下一个token
                probs = np.exp(logits) / np.sum(np.exp(logits), axis=-1, keepdims=True)
                next_token = np.random.multinomial(1, probs[0]).argmax()

                # 检查是否是结束token
                if next_token == self.tokenizer.eos_token_id:
                    break

                # 更新输入
                input_ids = np.concatenate([input_ids, [[next_token]]], axis=-1)
                attention_mask = np.concatenate([attention_mask, [[1]]], axis=-1)

            # 解码生成的文本
            generated_text = self.tokenizer.decode(input_ids[0], skip_special_tokens=True)
            return generated_text[len(prompt):].strip()

        except Exception as e:
            logger.error(f"本地LLM生成失败: {str(e)}", exc_info=True)
            raise

    async def agenerate(self, prompt: str, **kwargs) -> str:
        """异步生成文本"""
        # TODO: 实现真正的异步推理
        import asyncio
        return await asyncio.to_thread(self.generate, prompt, **kwargs)

    def invoke(self, messages: List[Any], **kwargs) -> Any:
        """兼容LangChain的invoke接口"""
        # 转换消息格式为prompt
        prompt = ""
        for msg in messages:
            if hasattr(msg, 'content'):
                prompt += f"{msg.content}\n"

        response = self.generate(prompt, **kwargs)

        # 返回兼容格式
        from langchain_core.messages import AIMessage
        return AIMessage(content=response)

    async def ainvoke(self, messages: List[Any], **kwargs) -> Any:
        """异步调用接口"""
        import asyncio
        return await asyncio.to_thread(self.invoke, messages, **kwargs)


class LocalEmbedding:
    """本地Embedding推理封装，基于ONNX Runtime"""

    def __init__(self, config: InferenceConfig):
        if ort is None or AutoTokenizer is None:
            raise RuntimeError("请先安装 onnxruntime 和 transformers 库")

        self.config = config
        self.tokenizer = AutoTokenizer.from_pretrained(config.tokenizer_path)

        # 配置ONNX Runtime会话
        sess_options = ort.SessionOptions()
        sess_options.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL

        providers = ['CPUExecutionProvider']
        if config.use_gpu and 'CUDAExecutionProvider' in ort.get_available_providers():
            providers = ['CUDAExecutionProvider']

        self.session = ort.InferenceSession(
            config.model_path,
            sess_options=sess_options,
            providers=providers
        )

        self.input_names = [input.name for input in self.session.get_inputs()]
        self.output_names = [output.name for output in self.session.get_outputs()]
        logger.info(f"本地Embedding模型加载完成，输入: {self.input_names}, 输出: {self.output_names}")

    def _mean_pooling(self, model_output, attention_mask):
        """均值池化获取句向量"""
        token_embeddings = model_output[0]
        input_mask = np.expand_dims(attention_mask, -1)
        return np.sum(token_embeddings * input_mask, 1) / np.clip(np.sum(input_mask, 1), 1e-9, None)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        """批量生成文本向量"""
        try:
            # 编码输入
            inputs = self.tokenizer(
                texts,
                padding=True,
                truncation=True,
                max_length=self.config.max_seq_len,
                return_tensors="np"
            )

            # 推理
            outputs = self.session.run(
                self.output_names,
                {
                    "input_ids": inputs["input_ids"],
                    "attention_mask": inputs["attention_mask"]
                }
            )

            # 池化获取句向量
            embeddings = self._mean_pooling(outputs, inputs["attention_mask"])

            # L2归一化
            embeddings = embeddings / np.linalg.norm(embeddings, axis=1, keepdims=True)

            return embeddings.tolist()

        except Exception as e:
            logger.error(f"本地Embedding生成失败: {str(e)}", exc_info=True)
            raise

    def embed_query(self, text: str) -> List[float]:
        """生成单个查询向量"""
        return self.embed_documents([text])[0]


class LocalInferenceManager:
    """本地推理管理器，统一管理所有本地模型"""

    _instance = None
    _llm: Optional[LocalLLM] = None
    _embedding: Optional[LocalEmbedding] = None
    _initialized: bool = False

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

    def initialize(self,
                   llm_model_path: str,
                   llm_tokenizer_path: str,
                   embedding_model_path: str,
                   embedding_tokenizer_path: str,
                   use_gpu: bool = False) -> None:
        """初始化本地推理引擎"""
        if self._initialized:
            return

        # 检查模型文件是否存在
        for path in [llm_model_path, llm_tokenizer_path, embedding_model_path, embedding_tokenizer_path]:
            if not os.path.exists(path):
                raise FileNotFoundError(f"模型文件不存在: {path}")

        # 初始化LLM
        llm_config = InferenceConfig(
            model_path=llm_model_path,
            tokenizer_path=llm_tokenizer_path,
            max_seq_len=2048,
            use_gpu=use_gpu
        )
        self._llm = LocalLLM(llm_config)

        # 初始化Embedding
        embedding_config = InferenceConfig(
            model_path=embedding_model_path,
            tokenizer_path=embedding_tokenizer_path,
            max_seq_len=512,
            use_gpu=use_gpu
        )
        self._embedding = LocalEmbedding(embedding_config)

        self._initialized = True
        logger.info("本地推理引擎初始化完成")

    @property
    def llm(self) -> LocalLLM:
        """获取本地LLM实例"""
        if not self._initialized or self._llm is None:
            raise RuntimeError("本地推理引擎未初始化，请先调用initialize()")
        return self._llm

    @property
    def embedding(self) -> LocalEmbedding:
        """获取本地Embedding实例"""
        if not self._initialized or self._embedding is None:
            raise RuntimeError("本地推理引擎未初始化，请先调用initialize()")
        return self._embedding

    def is_available(self) -> bool:
        """检查本地推理是否可用"""
        return self._initialized and self._llm is not None and self._embedding is not None


# 全局实例
local_inference = LocalInferenceManager()
