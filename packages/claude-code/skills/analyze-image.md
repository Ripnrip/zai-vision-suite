---
description: Analyze images with AI-powered scene understanding, object detection, and detailed visual analysis using Zhipu AI's GLM-4V model.
---

# Analyze Image

Use this command when you need to analyze images with AI-powered scene understanding and object detection.

## Usage

```
/analyze-image <path-to-image> [options]
```

## Options

- `--detail <level>` - Detail level: `low`, `high`, or `auto` (default: `high`)
- `--detect-objects` - Enable object detection (default: true)
- `--output <format>` - Output format: `json` or `text` (default: `text`)

## Examples

```bash
# Basic image analysis
/analyze-image photo.jpg

# High detail analysis with object detection
/analyze-image screenshot.png --detail high --detect-objects

# Quick analysis with low detail
/analyze-image image.webp --detail low

# JSON output for programmatic use
/analyze-image photo.jpg --output json
```

## Features

- **Scene Analysis**: Comprehensive description of the image content
- **Object Detection**: Identifies objects with confidence scores
- **Color & Mood**: Analyzes color palette and atmospheric qualities
- **Spatial Understanding**: Understands relationships between elements

## Environment Setup

```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
```

## Output

The command provides:
- Detailed scene description
- List of detected objects with confidence scores
- Color and mood analysis
- Contextual understanding of the image content
