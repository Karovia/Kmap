"""启动Kmap后端服务器"""
import sys
import os

# 添加项目路径到sys.path
project_dir = os.path.dirname(os.path.abspath(__file__))
if project_dir not in sys.path:
    sys.path.insert(0, project_dir)

# 设置PYTHONPATH环境变量
os.environ['PYTHONPATH'] = project_dir

try:
    print(f"工作目录: {os.getcwd()}")
    print(f"项目目录: {project_dir}")
    print(f"Python路径: {sys.path[:3]}")
    print("正在加载应用...")

    from app.main import app
    print("应用加载成功！")

    import uvicorn
    print("启动服务器...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

except Exception as e:
    print(f"启动失败: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
