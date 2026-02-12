---
description: Enhanced web search with advanced query generation. Analyzes images to generate sophisticated search queries for comprehensive web research.
---

# Vision Web Search (Enhanced)

Use this command for enhanced web search with AI-powered query generation and comprehensive result aggregation.

## Usage

```
/vision-web-search <path-to-image> [options]
```

## Options

- `--query-type <type>` - Query strategy: `information`, `shopping`, `academic`, or `comprehensive` (default: `comprehensive`)
- `--deep-search` - Enable deep search across multiple sources (default: true)
- `--max-results <count>` - Maximum results per source (default: 10)

## Examples

```bash
# Comprehensive web research
/vision-web-search diagram.png --query-type comprehensive

# Shopping-focused search
/vision-web-search product.jpg --query-type shopping --max-results 15

# Academic/informational search
/vision-web-search graph.jpg --query-type academic

# Quick search without deep analysis
/vision-web-search photo.png --deep-search false
```

## Query Types

- **information**: General knowledge and factual queries
- **shopping**: E-commerce and product research
- **academic**: Scientific and educational content
- **comprehensive**: All sources with full analysis

## Features

- **AI Query Generation**: Creates optimal search queries from image
- **Multi-Source Aggregation**: Combines results from multiple search engines
- **Contextual Analysis**: Understands image context for better queries
- **Result Deduplication**: Removes duplicate results across sources
- **Relevance Scoring**: Ranks results by relevance to image content

## Use Cases

- Research objects from photographs
- Find product information and reviews
- Academic research from diagrams/charts
- Identify landmarks, art, or locations
- Investigate unknown items
- Gather comprehensive information

## Environment Setup

```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
```

## Output

The enhanced search provides:
- Multiple generated search queries
- Aggregated results from various sources
- Relevance scores and rankings
- Source diversity metrics
- Deduplicated result set
