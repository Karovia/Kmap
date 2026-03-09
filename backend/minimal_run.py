"""
最小化启动脚本 - 跳过有问题的依赖
"""
import sys
import os

# 添加项目路径到sys.path
project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)

# 设置PYTHONPATH环境变量
os.environ['PYTHONPATH'] = project_dir

print("开始启动Kmap后端服务...")
print(f"工作目录: {os.getcwd()}")
print(f"项目目录: {project_dir}")

try:
    # 直接运行uvicorn，让它来导入应用
    print("启动uvicorn服务器...")
    import uvicorn

    # 使用字符串导入避免预加载
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
except KeyboardInterrupt:
    print("\n服务器已停止")
except Exception as e:
    print(f"启动失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
