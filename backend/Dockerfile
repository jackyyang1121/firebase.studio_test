# 使用官方 Python 3.9 輕量版作為基礎映像
FROM python:3.9-slim
# 設置工作目錄
WORKDIR /app
# 複製應用程式代碼
COPY . .
# 安裝依賴
RUN pip install -r requirements.txt
# 運行 Flask 應用
CMD ["gunicorn", "--bind", "0.0.0.0:8080", "app:app"]