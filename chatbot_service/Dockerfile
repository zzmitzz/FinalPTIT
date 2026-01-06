FROM python:3.11-slim

WORKDIR /app

# # Install system dependencies
# RUN apt-get update && apt-get install -y \
#     gcc \
#     && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create data directory for SQLite
RUN mkdir -p /app/data

# Environment variables
# ENV PYTHONUNBUFFERED=1
# ENV DB_URL=sqlite:////app/data/app.db
# ENV GROQ_API_KEY=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
# ENV GROQ_MODEL=openai/gpt-oss-120b
# ENV DB_URL=postgresql://iec:123456789%40@localhost:5432/event_db

# Expose port for API
EXPOSE 5000

# Run the application
CMD ["python", "api.py"]
