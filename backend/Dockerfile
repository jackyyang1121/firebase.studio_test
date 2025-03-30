# 使用官方 Python 3.9 輕量版作為基礎映像
FROM python:3.9-slim

# 設置工作目錄
WORKDIR /app

# 複製依賴清單並安裝
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 複製應用程式代碼
COPY . .

# 運行 Flask 應用，使用 gunicorn
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]