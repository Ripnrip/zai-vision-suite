# Z.ai Vision Suite

Multi-platform AI vision integration for Claude Code CLI, Cursor IDE, JetBrains IDEs, and Sublime Text - powered by Zhipu AI's GLM-4.6V model.

## Features

- **Image Analysis**: Detailed scene understanding with object detection
- **OCR**: Multi-language text extraction from images with format preservation
- **Video Understanding**: Frame extraction, scene segmentation, and summarization
- **Vision Search**: Image-to-web search for products, places, and similar content
- **Web Search**: Enhanced query-based search with visual context
- **Rate Limiting**: Built-in retry logic with exponential backoff
- **6 CLI Commands**: Complete skill suite ready for Claude Code

## Installation

```bash
# Install globally for Claude Code CLI
pnpm install -g zai-vision-suite

# Or install locally
pnpm install zai-vision-suite
```

## Configuration

Set your Zhipu AI API key:

```bash
export ZAI_API_KEY="your-api-key"
```

Or create a `.env` file:

```
ZAI_API_KEY=your-api-key
ZAI_BASE_URL=https://api.z.ai/v1
ZAI_MODEL_VISION=glm-4.6v
```

## Usage

### Claude Code CLI

The suite provides 6 slash commands to Claude Code:

| Command | Description |
|---------|-------------|
| `analyze-image` | Analyze images with scene descriptions and object detection |
| `process-video` | Extract frames, segment scenes, and summarize videos |
| `extract-text` | Perform OCR on images with multi-language support |
| `vision-search` | Search the web using images as queries |
| `vision-web-search` | Enhanced web search with visual context |
| `vision-chat` | Interactive conversational vision mode |

### Examples

```bash
# Analyze an image
analyze-image ~/Pictures/screenshot.jpg

# Extract text from a document
extract-text ~/Documents/scan.jpg --language english

# Process video with 10 frames
process-video ~/Movies/clip.mp4 --frames 10

# Search for similar products
vision-search ~/Pictures/product.jpg --type shopping

# Web search with query type
vision-web-search ~/Pictures/view.jpg --query-type information
```

## Project Structure

```
zai-vision-suite/
├── src/
│   ├── shared/          # Shared core library
│   │   ├── env.ts      # Environment config
│   │   ├── encoder.ts   # Image encoding utilities
│   │   ├── client.ts    # Z.ai API client
│   │   └── errors.ts   # Error types
│   └── adapters/        # Platform adapters
├── packages/
│   └── claude-code/    # Claude Code CLI adapter
│       ├── src/
│       │   └── index.ts   # Main adapter
│       ├── skills/          # Individual command files
│       │   ├── analyze-image.md
│       │   ├── extract-text.md
│       │   ├── process-video.md
│       │   ├── vision-chat.md
│       │   ├── vision-search.md
│       │   └── vision-web-search.md
│       ├── skill.md         # Main skill manifest
│       ├── package.json
│       └── tsconfig.json
├── tsconfig.json
├── package.json
├── .gitignore
└── README.md
```

## Architecture

- **Shared Core**: TypeScript library (`src/shared/`) with reusable API client, image encoding, and configuration
- **Platform Adapters**: Package-specific adapters that import shared core
- **Skills**: Individual markdown files for each command with usage examples
- **Unified API**: Consistent interface across all platforms

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Watch mode for development
pnpm run watch
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ZAI_API_KEY` | Your Zhipu AI API key | *required* |
| `ZAI_BASE_URL` | API base URL | `https://api.z.ai/v1` |
| `ZAI_MODEL_VISION` | Vision model to use | `glm-4.6v` |

## API Features

Based on Zhipu AI's GLM-4.6V model capabilities:

- **Vision Analysis**: Understand scenes, detect objects, analyze compositions
- **OCR**: Extract text from 100+ languages with auto-detection
- **Video Understanding**: Process video frames and identify key moments
- **Web Search**: Find related content on the internet using visual queries

## Rate Limiting

The suite automatically handles rate limit errors (code 1302) by:

1. Waiting 60 seconds after first rate limit
2. Retrying the request
3. Using exponential backoff for subsequent failures

## Requirements

- Node.js >= 20.0.0
- pnpm for package management
- Valid Zhipu AI API key
- Claude Code CLI (for using the skill)

## License

MIT
