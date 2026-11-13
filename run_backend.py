import sys
from pathlib import Path
import uvicorn

# Ensure backend directory is in sys.path
backend_path = Path(__file__).resolve().parent / "backend"
if str(backend_path) not in sys.path:
    sys.path.insert(0, str(backend_path))

if __name__ == "__main__":
    print("Starting Multilingual Mass Communication Platform Backend...")
    print("API available at: http://127.0.0.1:8000")
    print("API Docs: http://127.0.0.1:8000/docs")
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)

