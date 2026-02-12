FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app_streamlit.py .
COPY .streamlit/config.toml .streamlit/config.toml

# Streamlit environment
ENV LC_ALL=C.UTF-8
ENV LANG=C.UTF-8

# Expose port (Hugging Face Spaces uses 7860)
EXPOSE 7860

# Health check
HEALTHCHECK CMD curl --fail http://localhost:7860/_stcore/health || exit 1

# Run the application on port 7860 for Hugging Face Spaces
CMD streamlit run app_streamlit.py --server.port=7860 --server.address=0.0.0.0
