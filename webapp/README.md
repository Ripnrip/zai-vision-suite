# Z.ai Vision Suite - Web App Deployment

## 🚀 Quick Deploy to Hugging Face Spaces (Recommended - Free!)

Hugging Face Spaces is the easiest way to deploy this app for free. It natively supports Gradio and Streamlit.

### Option A: Deploy Gradio App

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Choose:
   - **License**: MIT
   - **Hardware**: CPU basic (free)
   - **SDK**: Gradio
4. Clone your space and upload these files:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/zai-vision-suite
   cd zai-vision-suite
   cp ../app.py app.py
   cp ../requirements.txt requirements.txt
   cp ../README_spaces.md README.md
   git add .
   git commit -m "Initial deployment"
   git push
   ```

### Option B: Deploy Streamlit App

1. Go to [huggingface.co/spaces](https://huggingface.co/spaces)
2. Click **"Create new Space"**
3. Choose:
   - **License**: MIT
   - **Hardware**: CPU basic (free)
   - **SDK**: Streamlit
4. Clone your space and upload these files:
   ```bash
   git clone https://huggingface.co/spaces/YOUR_USERNAME/zai-vision-suite-streamlit
   cd zai-vision-suite-streamlit
   cp ../app_streamlit.py app.py
   cp ../requirements.txt requirements.txt
   cp .streamlit/config.toml .streamlit/config.toml
   git add .
   git commit -m "Initial deployment"
   git push
   ```

### Setting API Key Secret

After creating your Space:
1. Go to your Space's **Settings** tab
2. Click **"New Secret"**
3. Add a secret named `ZAI_API_KEY` with your API key value
4. The app will automatically use it, or users can enter their own via the UI

---

## 🌐 Other Free Deployment Options

### Streamlit Cloud (For Streamlit app only)

1. Fork the [GitHub repo](https://github.com/Ripnrip/zai-vision-suite)
2. Go to [streamlit.io/cloud](https://streamlit.io/cloud)
3. Click **"New app"**
4. Connect your GitHub account
5. Select the repository and `webapp/app_streamlit.py`
6. Add `ZAI_API_KEY` in Secrets

### Render (Gradio app)

1. Create `render.yaml`:
   ```yaml
   services:
     - type: web
       name: zai-vision-suite
       env: python
       buildCommand: pip install -r requirements.txt
       startCommand: python app.py
       envVars:
         - key: ZAI_API_KEY
           sync: false
   ```
2. Connect repo to [render.com](https://render.com)
3. Deploy automatically on push

### Railway

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Add `ZAI_API_KEY` in environment variables
4. Set start command: `python app.py`

---

## 🐳 Docker Deployment (Universal)

For any platform that supports Docker:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY app.py .

ENV PORT=7860
EXPOSE 7860

CMD ["python", "app.py"]
```

Build and run:
```bash
docker build -t zai-vision-suite .
docker run -p 7860:7860 -e ZAI_API_KEY=your-key zai-vision-suite
```

---

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `ZAI_API_KEY` | Your Zhipu AI API key | Optional (can enter via UI) |
| `ZAI_BASE_URL` | API base URL | Optional |
| `ZAI_MODEL_VISION` | Model name | Optional |
