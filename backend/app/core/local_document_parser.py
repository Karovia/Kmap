import os
from typing import List, Dict, Any, Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

try:
    import PyPDF2
except ImportError:
    PyPDF2 = None
    logger.warning("PyPDF2 未安装，PDF解析功能不可用")

try:
    from docx import Document
except ImportError:
    Document = None
    logger.warning("python-docx 未安装，Word解析功能不可用")

try:
    import openpyxl
except ImportError:
    openpyxl = None
    logger.warning("openpyxl 未安装，Excel解析功能不可用")

try:
    import pandas as pd
except ImportError:
    pd = None
    logger.warning("pandas 未安装，Excel解析功能不可用")


class LocalDocumentParser:
    """本地文档解析器，支持PDF/Word/Excel/TXT等格式"""

    SUPPORTED_EXTENSIONS = {".txt", ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".md", ".json", ".csv"}

    def __init__(self):
        self._check_dependencies()

    def _check_dependencies(self) -> Dict[str, bool]:
        """检查依赖库是否安装"""
        dependencies = {
            "pdf": PyPDF2 is not None,
            "word": Document is not None,
            "excel": openpyxl is not None and pd is not None,
        }
        return dependencies

    def get_supported_formats(self) -> List[str]:
        """获取支持的文件格式"""
        supported = []
        deps = self._check_dependencies()

        if deps["pdf"]:
            supported.extend([".pdf"])
        if deps["word"]:
            supported.extend([".doc", ".docx"])
        if deps["excel"]:
            supported.extend([".xls", ".xlsx", ".csv"])
        supported.extend([".txt", ".md", ".json"])

        return supported

    def parse(self, file_path: str) -> List[Dict[str, Any]]:
        """
        解析文档
        :param file_path: 文件路径
        :return: 解析后的元素列表，每个元素包含content、page_number等信息
        """
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"文件不存在: {file_path}")

        file_ext = Path(file_path).suffix.lower()
        if file_ext not in self.SUPPORTED_EXTENSIONS:
            raise ValueError(f"不支持的文件格式: {file_ext}")

        parser_map = {
            ".txt": self._parse_txt,
            ".md": self._parse_txt,
            ".pdf": self._parse_pdf,
            ".doc": self._parse_word,
            ".docx": self._parse_word,
            ".xls": self._parse_excel,
            ".xlsx": self._parse_excel,
            ".csv": self._parse_csv,
            ".json": self._parse_json,
        }

        parser = parser_map.get(file_ext)
        if not parser:
            raise ValueError(f"没有对应的解析器: {file_ext}")

        try:
            elements = parser(file_path)
            logger.info(f"文档 {file_path} 解析完成，共 {len(elements)} 个元素")
            return elements
        except Exception as e:
            logger.error(f"解析文档 {file_path} 失败: {str(e)}", exc_info=True)
            raise

    def _parse_txt(self, file_path: str) -> List[Dict[str, Any]]:
        """解析TXT/MD文件"""
        elements = []
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            # 按段落分割
            paragraphs = content.split("\n\n")
            for i, para in enumerate(paragraphs):
                para = para.strip()
                if para:
                    elements.append({
                        "content": para,
                        "page_number": 1,
                        "type": "text",
                        "index": i
                    })

            return elements
        except UnicodeDecodeError:
            # 尝试其他编码
            with open(file_path, "r", encoding="gbk") as f:
                content = f.read()

            paragraphs = content.split("\n\n")
            for i, para in enumerate(paragraphs):
                para = para.strip()
                if para:
                    elements.append({
                        "content": para,
                        "page_number": 1,
                        "type": "text",
                        "index": i
                    })
            return elements

    def _parse_pdf(self, file_path: str) -> List[Dict[str, Any]]:
        """解析PDF文件"""
        if PyPDF2 is None:
            raise RuntimeError("请先安装 PyPDF2 库: pip install pypdf2")

        elements = []
        with open(file_path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            total_pages = len(reader.pages)

            for page_num in range(total_pages):
                page = reader.pages[page_num]
                text = page.extract_text()

                if text.strip():
                    # 按段落分割
                    paragraphs = text.split("\n\n")
                    for para in paragraphs:
                        para = para.strip()
                        if para:
                            elements.append({
                                "content": para,
                                "page_number": page_num + 1,
                                "type": "text",
                                "index": len(elements)
                            })

        return elements

    def _parse_word(self, file_path: str) -> List[Dict[str, Any]]:
        """解析Word文档"""
        if Document is None:
            raise RuntimeError("请先安装 python-docx 库: pip install python-docx")

        elements = []
        doc = Document(file_path)

        # 处理段落
        for para in doc.paragraphs:
            text = para.text.strip()
            if text:
                elements.append({
                    "content": text,
                    "page_number": 1,  # Word解析难以获取准确页码，统一设为1
                    "type": "text",
                    "index": len(elements),
                    "style": para.style.name if para.style else "Normal"
                })

        # 处理表格
        for table in doc.tables:
            table_content = []
            for row in table.rows:
                row_content = []
                for cell in row.cells:
                    row_content.append(cell.text.strip())
                if any(row_content):
                    table_content.append(" | ".join(row_content))

            if table_content:
                elements.append({
                    "content": "\n".join(table_content),
                    "page_number": 1,
                    "type": "table",
                    "index": len(elements)
                })

        return elements

    def _parse_excel(self, file_path: str) -> List[Dict[str, Any]]:
        """解析Excel文件"""
        if openpyxl is None or pd is None:
            raise RuntimeError("请先安装 openpyxl 和 pandas 库: pip install openpyxl pandas")

        elements = []
        xls = pd.ExcelFile(file_path)

        for sheet_name in xls.sheet_names:
            df = pd.read_excel(xls, sheet_name=sheet_name)

            # 转换为CSV格式文本
            csv_content = df.to_csv(sep="\t", na_rep="", index=False)

            if csv_content.strip():
                elements.append({
                    "content": f"Sheet: {sheet_name}\n{csv_content}",
                    "page_number": 1,
                    "type": "table",
                    "index": len(elements),
                    "sheet_name": sheet_name
                })

        return elements

    def _parse_csv(self, file_path: str) -> List[Dict[str, Any]]:
        """解析CSV文件"""
        if pd is None:
            raise RuntimeError("请先安装 pandas 库: pip install pandas")

        elements = []
        df = pd.read_csv(file_path)
        csv_content = df.to_csv(sep="\t", na_rep="", index=False)

        if csv_content.strip():
            elements.append({
                "content": csv_content,
                "page_number": 1,
                "type": "table",
                "index": 0
            })

        return elements

    def _parse_json(self, file_path: str) -> List[Dict[str, Any]]:
        """解析JSON文件"""
        import json
        elements = []

        with open(file_path, "r", encoding="utf-8") as f:
            data = json.load(f)

        # 格式化JSON为可读性好的文本
        formatted_json = json.dumps(data, ensure_ascii=False, indent=2)
        elements.append({
            "content": formatted_json,
            "page_number": 1,
            "type": "json",
            "index": 0
        })

        return elements


# 全局实例
local_parser = LocalDocumentParser()
