---
description: Extract text from images using advanced OCR capabilities. Supports 100+ languages with automatic language detection and format preservation.
---

# Extract Text (OCR)

Use this command when you need to extract text from images, screenshots, scanned documents, or any visual content containing text.

## Usage

```
/extract-text <path-to-image> [options]
```

## Options

- `--language <code>` - Language code: `auto`, `english`, `chinese`, `spanish`, `french`, `german`, `japanese` (default: `auto`)
- `--preserve-format` - Preserve original formatting and structure (default: true)
- `--output <file>` - Save extracted text to file

## Examples

```bash
# Basic text extraction with auto language detection
/extract-text receipt.png

# Extract specific language
/extract-text document.jpg --language english

# Extract and save to file
/extract-text screenshot.png --output extracted.txt

# Extract without preserving formatting (plain text)
/extract-text form.png --preserve-format false
```

## Features

- **Multi-Language Support**: 100+ languages supported
- **Auto Detection**: Automatically detects text language
- **Format Preservation**: Maintains original structure and layout
- **Multi-Column Handling**: Correctly processes complex layouts
- **High Accuracy**: Advanced OCR with state-of-the-art accuracy

## Use Cases

- Extract text from receipts and invoices
- Digitize scanned documents
- Convert screenshots to editable text
- Extract text from infographics
- Process forms and applications

## Environment Setup

```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
```

## Output

The extracted text is returned as:
- Formatted text with structure preserved
- Language detection result
- Character count and confidence metrics
