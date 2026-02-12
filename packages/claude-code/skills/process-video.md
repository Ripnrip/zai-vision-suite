---
description: Process videos by extracting and analyzing key frames. Summarize video content, detect scenes, and analyze visual changes over time.
---

# Process Video

Use this command when you need to analyze video content by extracting and analyzing key frames.

## Usage

```
/process-video <path-to-video> [options]
```

## Options

- `--frames <count>` - Number of key frames to extract (default: 5)
- `--interval <seconds>` - Extract frames at regular intervals
- `--detect-scenes` - Enable scene change detection (default: true)
- `--summarize` - Generate video summary (default: true)

## Examples

```bash
# Extract 5 key frames for analysis
/process-video presentation.mp4 --frames 5

# Extract frame every 10 seconds
/process-video tutorial.avi --interval 10

# Analyze with scene detection
/process-video movie.mov --detect-scenes --frames 10

# Generate comprehensive summary
/process-video demo.mp4 --summarize --frames 8
```

## Features

- **Key Frame Extraction**: Intelligently selects representative frames
- **Scene Detection**: Identifies scene changes and transitions
- **Video Summary**: Generates textual summary of content
- **Temporal Analysis**: Tracks changes over time
- **Multi-Format Support**: Works with MP4, AVI, MOV, and more

## Use Cases

- Summarize video content quickly
- Extract key moments from long videos
- Analyze presentation slides
- Review tutorial content
- Monitor security footage
- Analyze product demos

## Environment Setup

```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
```

## Output

The command provides:
- List of extracted key frames with timestamps
- Summary of video content
- Detected scene changes
- Analysis of visual elements over time
