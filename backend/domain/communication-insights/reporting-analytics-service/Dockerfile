FROM python:3.11-slim

# --- System deps (minimal) ---
WORKDIR /app

# Install python deps
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app
COPY app ./app

# Expose service port
EXPOSE 8010

# Run
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8010"]
