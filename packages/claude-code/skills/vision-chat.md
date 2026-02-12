---
description: Interactive conversational AI for image analysis. Ask questions about images and receive detailed, contextual responses in natural language.
---

# Vision Chat

Use this command for interactive, conversational image analysis. Ask any question about an image and get detailed, contextual responses.

## Usage

```
/vision-chat <path-to-image> <your-question>
```

## Examples

```bash
# Ask about colors
/vision-chat painting.jpg "What colors are dominant in this image?"

# Request mood analysis
/vision-chat photo.png "Describe the mood and atmosphere"

# Explain technical diagrams
/vision-chat flowchart.jpg "Explain the process shown in this diagram"

# Identify objects
/vision-chat screenshot.png "What UI elements are visible?"

# Count items
/vision-chat crowd.jpg "Approximately how many people are in this image?"
```

## Features

- **Natural Conversation**: Interactive dialogue about images
- **Contextual Understanding**: Remembers conversation context
- **Follow-up Questions**: Support for multi-turn conversations
- **Detailed Analysis**: Provides thorough, specific answers
- **Multi-Purpose**: Works for any type of visual question

## Example Prompts

- "What do you see in this image?"
- "Describe the main subject and its surroundings"
- "What is the mood of this photograph?"
- "Explain the data shown in this chart"
- "What text is visible in this image?"
- "Describe the lighting conditions"
- "What style is this artwork in?"
- "Is there anything unusual in this image?"

## Use Cases

- Explain screenshots and UI elements
- Analyze artwork and photographs
- Understand diagrams and charts
- Describe scenes and settings
- Extract information from infographics
- Get detailed visual descriptions
- Ask specific questions about content

## Environment Setup

```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
```

## Output

The AI provides:
- Direct answer to your question
- Relevant context and details
- Follow-up suggestions
- Token usage information
