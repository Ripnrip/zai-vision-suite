<div align="center">

# Zai Vision Suite

### Multi-Platform AI Computer Vision

<img src="docs/images/zai-vision-suite-ghibli.png" width="800" alt="Zai Vision Suite — A Ghibli-style illustration of an enchanted workshop with an owl spirit" style="border-radius: 16px;">

<br />

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![GLM-4V](https://img.shields.io/badge/GLM--4V-Vision_Model-FF6B35?style=for-the-badge)](https://github.com/THUDM/GLM-4)
[![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Computer Vision](https://img.shields.io/badge/Computer_Vision-AI%2FML-9E7AFF?style=for-the-badge)](https://en.wikipedia.org/wiki/Computer_vision)

*An advanced multi-platform AI vision suite that leverages the GLM-4V model for visual understanding, image analysis, and multimodal reasoning. From object detection to scene description, Zai makes computer vision accessible through an elegant interface.*

</div>

---

## Overview

Zai Vision Suite is a full-stack application that democratizes access to cutting-edge computer vision capabilities. Built around the GLM-4V (General Language Model with Vision) architecture, it provides a clean, intuitive interface for performing complex visual AI tasks — image analysis, object detection, OCR, scene understanding, and multimodal Q&A.

The suite is designed for both developers exploring vision AI and end-users who need practical visual analysis tools without the complexity of managing ML infrastructure.

## Key Features

**GLM-4V Integration** — Deep integration with the GLM-4V model for state-of-the-art visual understanding, supporting image-to-text, visual Q&A, and scene analysis.

**Multi-Modal Reasoning** — Combine text prompts with images for nuanced analysis. Ask questions about images and receive contextual, detailed responses.

**Real-Time Processing** — Stream results as they're generated for immediate feedback on large or complex images.

**Cross-Platform UI** — React-based frontend that works across desktop and mobile browsers with drag-and-drop image upload.

**Extensible Pipeline** — Modular architecture allows plugging in additional vision models (YOLO, SAM, CLIP) alongside GLM-4V.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Vision Model** | GLM-4V (ZhipuAI) |
| **Backend** | Python, FastAPI, Pydantic |
| **Frontend** | React, Tailwind CSS |
| **ML Infra** | PyTorch, Transformers, ONNX |
| **API Layer** | RESTful + WebSocket streaming |

## Architecture

```
zai-vision-suite/
├── api/                  # FastAPI backend
│   ├── routes/           # Vision task endpoints
│   ├── models/           # ML model loaders
│   └── processing/       # Image preprocessing pipeline
├── frontend/             # React application
│   ├── components/       # Upload, analysis, results UI
│   └── hooks/            # API integration hooks
├── models/               # Model configs & weights
└── scripts/              # Training & evaluation tools
```

## Getting Started

```bash
# Clone the repository
git clone https://github.com/Ripnrip/zai-vision-suite.git
cd zai-vision-suite

# Set up Python environment
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt

# Configure API keys
cp .env.example .env
# Add your ZhipuAI API key to .env

# Start the backend
uvicorn api.main:app --reload

# In a new terminal, start the frontend
cd frontend && npm install && npm run dev
```

## Use Cases

**Content Moderation** — Analyze uploaded images for policy compliance with detailed visual reports.

**Accessibility** — Generate alt-text descriptions for images, improving web accessibility at scale.

**Document Analysis** — Extract text, tables, and structured data from photographs of documents.

**Creative Analysis** — Describe artistic style, composition, and color palette of visual works.

---

<div align="center">
  <br />
  <p>Built with ✨ by <a href="https://guriboycodes.com"><strong>GuriboyCodes</strong></a></p>
  <sub>Staff Software Engineer — Mobile & AI</sub>
  <br /><br />
  <a href="https://guriboycodes.com">Portfolio</a> · <a href="https://github.com/Ripnrip">GitHub</a> · <a href="https://linkedin.com/in/gurindersingh">LinkedIn</a>
</div>
