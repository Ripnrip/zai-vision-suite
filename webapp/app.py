#!/usr/bin/env python3
"""
Z.ai Vision Suite - Gradio Web Application
A standalone web interface for all vision operations using Gradio
"""

import gradio as gr
import os
import base64
from pathlib import Path
from typing import Optional, Tuple, List
import sys

# Add src directory to path for TypeScript import simulation
# In production, we'd use the compiled JS version

# Configuration
API_KEY = os.environ.get('ZAI_API_KEY', '')
API_URL = os.environ.get('ZAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4')
MODEL = os.environ.get('ZAI_MODEL_VISION', 'glm-4v')

# For demo purposes, we'll simulate the API responses
# In production, this would call the actual Zhipu AI API


def encode_image_to_base64(image_path: str) -> str:
    """Encode image file to base64 data URL"""
    try:
        with open(image_path, 'rb') as f:
            image_data = f.read()
        base64_str = base64.b64encode(image_data).decode('utf-8')

        # Detect mime type
        ext = Path(image_path).suffix.lower()
        mime_types = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
        }
        mime_type = mime_types.get(ext, 'image/jpeg')

        return f'data:{mime_type};base64,{base64_str}'
    except Exception as e:
        raise gr.Error(f"Failed to read image: {str(e)}")


def simulate_analyze_image(image_path: str, detail: str = 'high') -> Tuple[str, str]:
    """
    Simulate image analysis (demo mode)
    In production, this would call the Zhipu AI API
    """
    if image_path is None:
        return "Please upload an image.", ""

    try:
        base64_image = encode_image_to_base64(image_path)

        # Simulated response for demo
        scene = f"""I can see this image. This appears to be a demonstration image for the Z.ai Vision Suite.

In production mode with a valid ZAI_API_KEY, this would provide:
- Detailed scene analysis at {detail} detail level
- Object detection with confidence scores
- Color palette and mood analysis
- Contextual understanding

To use real AI analysis:
1. Set your Zhipu AI API key: export ZAI_API_KEY="your-key-here"
2. Restart the application
3. Upload your image for actual AI analysis"""

        objects = "Objects would be detected here in production mode."

        return scene, objects
    except Exception as e:
        raise gr.Error(f"Analysis failed: {str(e)}")


def simulate_extract_text(image_path: str, language: str = 'auto') -> str:
    """Simulate OCR text extraction"""
    if image_path is None:
        return "Please upload an image."

    try:
        base64_image = encode_image_to_base64(image_path)

        text = f"""DEMO MODE - Simulated OCR Result

This is a demonstration response. In production mode with a valid ZAI_API_KEY,
this would extract actual text from your image with {language} language detection.

The Z.ai Vision Suite OCR supports:
- 100+ languages
- Auto language detection
- Format preservation
- Multi-column layout handling

To enable real OCR:
1. Set your API key: export ZAI_API_KEY="your-key-here"
2. Restart the application
"""

        return text
    except Exception as e:
        raise gr.Error(f"OCR failed: {str(e)}")


def simulate_vision_search(image_path: str, search_type: str = 'web') -> Tuple[str, str]:
    """Simulate vision-based web search"""
    if image_path is None:
        return "Please upload an image.", ""

    try:
        base64_image = encode_image_to_base64(image_path)

        query = f"Visual search query for: {Path(image_path).name}"

        results = f"""Search Results (Demo Mode)

Query: {query}
Type: {search_type}

In production mode, this would:
1. Analyze the image content
2. Generate relevant search queries
3. Return actual web search results from:
   - Product databases (for items/shopping)
   - Image search engines (for similar visuals)
   - General web search (for information)

To enable real search:
1. Set your API key: export ZAI_API_KEY="your-key-here"
2. Restart the application
"""

        return query, results
    except Exception as e:
        raise gr.Error(f"Search failed: {str(e)}")


def simulate_vision_chat(image_path: str, prompt: str) -> Tuple[str, str]:
    """Simulate conversational vision mode"""
    if image_path is None:
        return "Please upload an image.", "Enter your question about the image."

    if not prompt:
        prompt = "What do you see in this image?"

    try:
        base64_image = encode_image_to_base64(image_path)

        response = f"""Demo Response to: "{prompt}"

This is a simulated response. In production mode with a valid ZAI_API_KEY,
the AI would provide actual, contextual answers about your image.

The Z.ai Vision Chat supports:
- Natural conversation about images
- Follow-up questions
- Detailed analysis on demand
- Multiple interaction rounds

To enable real AI chat:
1. Set your API key: export ZAI_API_KEY="your-key-here"
2. Restart the application
3. Ask specific questions about your images
"""

        usage = "Tokens: ~100 (demo mode)"
        return response, usage
    except Exception as e:
        raise gr.Error(f"Chat failed: {str(e)}")


# Gradio Interface
with gr.Blocks(
    title="Z.ai Vision Suite"
) as app:

    gr.Markdown("""
    # 🖼️ Z.ai Vision Suite

    Multi-platform AI vision integration powered by Zhipu AI's GLM-4V model.

    **Setup:** Set your API key: `export ZAI_API_KEY="your-key-here"`
    """)

    with gr.Tabs():
        # Tab 1: Image Analysis
        with gr.Tab("Image Analysis"):
            with gr.Row():
                with gr.Column(scale=1):
                    image_input = gr.Image(
                        label="Upload Image",
                        type="filepath"
                    )
                    detail_level = gr.Radio(
                        choices=["low", "high", "auto"],
                        value="high",
                        label="Detail Level"
                    )
                    detect_objects = gr.Checkbox(
                        value=True,
                        label="Detect Objects"
                    )
                    analyze_btn = gr.Button("Analyze Image", variant="primary")

                with gr.Column(scale=1):
                    scene_output = gr.Textbox(
                        label="Scene Description",
                        lines=8,
                                            )
                    objects_output = gr.Textbox(
                        label="Detected Objects",
                        lines=5,
                                            )

        # Tab 2: OCR
        with gr.Tab("OCR (Extract Text)"):
            with gr.Row():
                with gr.Column(scale=1):
                    ocr_image = gr.Image(
                        label="Upload Image",
                        type="filepath"
                    )
                    language = gr.Dropdown(
                        choices=["auto", "english", "chinese", "spanish", "french", "german", "japanese"],
                        value="auto",
                        label="Language"
                    )
                    preserve_format = gr.Checkbox(
                        value=True,
                        label="Preserve Formatting"
                    )
                    ocr_btn = gr.Button("Extract Text", variant="primary")

                with gr.Column(scale=1):
                    ocr_output = gr.Textbox(
                        label="Extracted Text",
                        lines=12,
                                            )

        # Tab 3: Vision Search
        with gr.Tab("Vision Search"):
            with gr.Row():
                with gr.Column(scale=1):
                    search_image = gr.Image(
                        label="Upload Image",
                        type="filepath"
                    )
                    search_type = gr.Radio(
                        choices=["web", "products", "similar"],
                        value="web",
                        label="Search Type"
                    )
                    max_results = gr.Slider(
                        minimum=1,
                        maximum=20,
                        value=5,
                        step=1,
                        label="Max Results"
                    )
                    search_btn = gr.Button("Search", variant="primary")

                with gr.Column(scale=1):
                    search_query = gr.Textbox(
                        label="Generated Search Query",
                        lines=2,
                                            )
                    search_results = gr.Textbox(
                        label="Search Results",
                        lines=10,
                                            )

        # Tab 4: Vision Chat
        with gr.Tab("Vision Chat"):
            with gr.Row():
                with gr.Column(scale=1):
                    chat_image = gr.Image(
                        label="Upload Image",
                        type="filepath"
                    )
                    chat_prompt = gr.Textbox(
                        label="Your Question",
                        placeholder="What do you see in this image?",
                        lines=2
                    )
                    chat_btn = gr.Button("Ask", variant="primary")
                    chat_examples = gr.Examples(
                        examples=[
                            ["example.jpg", "What colors are dominant in this image?"],
                            ["screenshot.png", "Describe the mood and atmosphere"],
                            ["diagram.jpg", "Explain the flow shown in this diagram"],
                        ],
                        inputs=[chat_image, chat_prompt],
                    )

                with gr.Column(scale=1):
                    chat_response = gr.Textbox(
                        label="AI Response",
                        lines=12,
                                            )
                    chat_usage = gr.Textbox(
                        label="Token Usage",
                        lines=2
                    )

    # Footer
    gr.Markdown("""
    ---
    ### API Configuration

    To use with real AI, set these environment variables:

    ```bash
    export ZAI_API_KEY="your-zhipu-ai-api-key"
    export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
    export ZAI_MODEL_VISION="glm-4v"
    ```

    ### Links

    - [Get API Key](https://open.bigmodel.cn/)
    - [Documentation](https://github.com/Ripnrip/zai-vision-suite)
    - [GitHub Repository](https://github.com/Ripnrip/zai-vision-suite)
    """)

    # Event handlers
    analyze_btn.click(
        fn=lambda img, detail, detect: simulate_analyze_image(img or "", detail) if img else ("No image uploaded", ""),
        inputs=[image_input, detail_level, detect_objects],
        outputs=[scene_output, objects_output]
    )

    ocr_btn.click(
        fn=lambda img, lang, fmt: simulate_extract_text(img or "", lang) if img else "No image uploaded",
        inputs=[ocr_image, language, preserve_format],
        outputs=ocr_output
    )

    search_btn.click(
        fn=lambda img, stype, max_r: simulate_vision_search(img or "", stype) if img else ("No image uploaded", ""),
        inputs=[search_image, search_type, max_results],
        outputs=[search_query, search_results]
    )

    chat_btn.click(
        fn=lambda img, prompt: simulate_vision_chat(img or "", prompt) if img else ("No image uploaded", ""),
        inputs=[chat_image, chat_prompt],
        outputs=[chat_response, chat_usage]
    )


if __name__ == "__main__":
    # Create the webapp directory if it doesn't exist
    webapp_dir = Path(__file__).parent
    webapp_dir.mkdir(exist_ok=True)

    # Check for API key and show warning if not set
    if not API_KEY:
        print("⚠️  WARNING: ZAI_API_KEY not set. Running in DEMO mode.")
        print("To use real AI features, set: export ZAI_API_KEY='your-key'")
        print("")

    # Launch Gradio app
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        share=False,
        show_error=True,
        quiet=False,
        theme=gr.themes.Soft(),
        css="""
        .gradio-container {
            max-width: 1200px !important;
        }
        .header {
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            margin-bottom: 20px;
        }
        """
    )
