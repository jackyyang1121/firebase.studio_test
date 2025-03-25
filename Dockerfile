FROM python:3.9-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY backend/ .

ENV PORT=8080

CMD ["gunicorn", "--bind", "0.0.0.0:$PORT", "app:app"]