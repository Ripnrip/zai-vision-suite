---
description: Search the web using images as queries. Find similar images, products, or related information based on visual content.
---

# Vision Search

Use this command when you want to search the web using an image as the query instead of text.

## Usage

```
/vision-search <path-to-image> [options]
```

## Options

- `--type <category>` - Search type: `web`, `products`, or `similar` (default: `web`)
- `--max-results <count>` - Maximum number of results (default: 5, max: 20)

## Examples

```bash
# General web search using image
/vision-search mysterious-object.jpg

# Find similar products for shopping
/vision-search furniture.png --type products --max-results 10

# Find visually similar images
/vision-search artwork.jpg --type similar

# Get comprehensive web results
/vision-search logo.png --type web --max-results 8
```

## Search Types

- **web**: General web search based on image content
- **products**: E-commerce and shopping-focused search
- **similar**: Find visually similar images across the web

## Features

- **Visual Query**: Uses image content as search query
- **Smart Categorization**: Automatically categorizes search intent
- **Multi-Source**: Aggregates results from multiple sources
- **Relevance Ranking**: Returns most relevant results first

## Use Cases

- Identify unknown objects from photos
- Find product sources and prices
- Locate original image sources
- Research visual content
- Find similar designs or artwork
- Verify image authenticity

## Environment Setup

```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
```

## Output

The command returns:
- Generated search query based on image
- Relevant search results with links
- Source attribution
- Confidence scores for matches
