#!/usr/bin/env python3
"""
Z.ai Vision Suite - Gradio Web Application
A standalone web interface for all vision operations using Gradio
"""

import gradio as gr
import os
import base64
import json
import requests
from pathlib import Path
from typing import Optional, Tuple, List

# Configuration
API_URL = os.environ.get('ZAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4')
MODEL = os.environ.get('ZAI_MODEL_VISION', 'glm-4v')


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


def call_zhipu_api(api_key: str, messages: List, max_tokens: int = 1024) -> dict:
    """Make actual API call to Zhipu AI"""
    if not api_key:
        return None

    url = f"{API_URL}/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": MODEL,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7
    }

    try:
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        response.raise_for_status()
        return response.json()
    except Exception as e:
        raise gr.Error(f"API call failed: {str(e)}")


def analyze_image_real(image_path: str, detail: str = 'high', api_key: str = '') -> Tuple[str, str]:
    """Analyze image with real API or demo mode"""
    if image_path is None:
        return "Please upload an image.", ""

    try:
        base64_image = encode_image_to_base64(image_path)

        if api_key:
            # Real API call
            messages = [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": base64_image}},
                    {"type": "text", "text": f"Analyze this image in {detail} detail. Describe the scene, main objects, colors, mood, and any notable features."}
                ]
            }]

            result = call_zhipu_api(api_key, messages, max_tokens=2048)

            if result and 'choices' in result:
                content = result['choices'][0]['message']['content']

                # Parse response into scene and objects
                scene = content

                objects_info = ""
                if 'usage' in result:
                    objects_info = f"\n\n*Tokens used: {result['usage']['total_tokens']}*"

                return scene, objects_info

        # Demo mode fallback
        scene = f"""**Demo Mode - No API Key Provided**

This is a simulated analysis. Enter your Zhipu AI API key above for real AI analysis.

**What real AI would provide:**
- Detailed scene understanding at {detail} detail level
- Object detection with confidence scores
- Color palette and mood analysis
- Contextual information

**To enable real AI:**
1. Enter your Zhipu AI API key in the field above
2. Upload your image again
3. Get actual AI-powered analysis"""

        objects = "Enter API key above for real AI analysis →"
        return scene, objects

    except Exception as e:
        raise gr.Error(f"Analysis failed: {str(e)}")


def extract_text_real(image_path: str, language: str = 'auto', api_key: str = '') -> str:
    """Extract text with real API or demo mode"""
    if image_path is None:
        return "Please upload an image."

    try:
        base64_image = encode_image_to_base64(image_path)

        if api_key:
            prompt = "Extract all text from this image. Preserve the original formatting, line breaks, and structure. Return only the extracted text."
            if language != 'auto':
                prompt += f" The text is in {language}."

            messages = [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": base64_image}},
                    {"type": "text", "text": prompt}
                ]
            }]

            result = call_zhipu_api(api_key, messages, max_tokens=4096)

            if result and 'choices' in result:
                text = result['choices'][0]['message']['content']
                tokens = f"\n\n*Tokens: {result['usage']['total_tokens']}*" if 'usage' in result else ""
                return text + tokens

        # Demo mode fallback
        return f"""**Demo Mode - No API Key Provided**

This is simulated OCR output. Enter your Zhipu AI API key above for real text extraction.

**Supported Languages:**
{language} (auto-detected in real mode)

**To enable real OCR:**
1. Enter your Zhipu AI API key in the field above
2. Upload your document again
3. Get accurate text extraction with 100+ language support"""

    except Exception as e:
        raise gr.Error(f"OCR failed: {str(e)}")


def vision_search_real(image_path: str, search_type: str = 'web', api_key: str = '') -> Tuple[str, str]:
    """Vision search with real API or demo mode"""
    if image_path is None:
        return "Please upload an image.", ""

    try:
        base64_image = encode_image_to_base64(image_path)

        if api_key:
            prompts = {
                'web': 'Describe this image in detail. What search terms would find this on the web?',
                'products': 'Identify any products in this image. What are they and where might someone buy them?',
                'similar': 'Describe this image. What search terms would find similar images?'
            }

            messages = [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": base64_image}},
                    {"type": "text", "text": prompts.get(search_type, prompts['web'])}
                ]
            }]

            result = call_zhipu_api(api_key, messages)

            if result and 'choices' in result:
                query = result['choices'][0]['message']['content']
                tokens = f"\n*Tokens: {result['usage']['total_tokens']}*" if 'usage' in result else ""
                return query, f"**Search Type:** {search_type}\n\n{query}{tokens}"

        # Demo mode fallback
        query = f"Visual search for: {Path(image_path).name}"
        results = f"""**Demo Mode - No API Key Provided**

Enter your Zhipu AI API key above for real vision search.

**What would happen:**
1. AI analyzes your image content
2. Generates optimal search queries
3. Returns relevant web results

**Search Type:** {search_type}

To enable real search, enter your API key above!"""
        return query, results

    except Exception as e:
        raise gr.Error(f"Search failed: {str(e)}")


def vision_chat_real(image_path: str, prompt: str, api_key: str = '') -> Tuple[str, str]:
    """Vision chat with real API or demo mode"""
    if image_path is None:
        return "Please upload an image.", "Enter your question."

    if not prompt:
        prompt = "What do you see in this image?"

    try:
        base64_image = encode_image_to_base64(image_path)

        if api_key:
            messages = [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": base64_image}},
                    {"type": "text", "text": prompt}
                ]
            }]

            result = call_zhipu_api(api_key, messages, max_tokens=2048)

            if result and 'choices' in result:
                response = result['choices'][0]['message']['content']
                usage = f"Tokens: {result['usage'].get('total_tokens', 'N/A')}" if 'usage' in result else "Tokens: N/A"
                return response, usage

        # Demo mode fallback
        response = f"""**Demo Mode - No API Key Provided**

This is a simulated response to: "{prompt}"

**Enter your API key above** to get real AI responses about your images!

**Vision Chat supports:**
- Natural conversation about images
- Follow-up questions
- Detailed analysis on demand
- Multi-language support"""

        return response, "Tokens: ~100 (demo mode)"

    except Exception as e:
        raise gr.Error(f"Chat failed: {str(e)}")


# Gradio Interface
with gr.Blocks(
    title="Z.ai Vision Suite"
) as app:

    gr.Markdown("""
    # 🖼️ Z.ai Vision Suite

    Multi-platform AI vision integration powered by Zhipu AI's GLM-4V model.
    """)

    # API Key Input at the top
    with gr.Row():
        api_key_input = gr.Textbox(
            label="🔑 Zhipu AI API Key",
            placeholder="Enter your API key here (or set ZAI_API_KEY environment variable)",
            type="password",
            value=os.environ.get('ZAI_API_KEY', ''),
            container=True,
            scale=4
        )
        api_status = gr.Markdown(
            "✅ **API Key Set**" if os.environ.get('ZAI_API_KEY') else "⚠️ **Enter API key for real AI**",
            scale=1
        )

    with gr.Tabs():
        # Tab 1: Image Analysis
        with gr.Tab("🔍 Image Analysis"):
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
                    analyze_btn = gr.Button("Analyze Image", variant="primary")

                with gr.Column(scale=1):
                    scene_output = gr.Textbox(
                        label="Scene Description",
                        lines=10
                    )
                    objects_output = gr.Textbox(
                        label="Objects & Details",
                        lines=5
                    )

        # Tab 2: OCR
        with gr.Tab("📝 OCR (Extract Text)"):
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
                    ocr_btn = gr.Button("Extract Text", variant="primary")

                with gr.Column(scale=1):
                    ocr_output = gr.Textbox(
                        label="Extracted Text",
                        lines=15
                    )

        # Tab 3: Vision Search
        with gr.Tab("🔎 Vision Search"):
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
                    search_btn = gr.Button("Search", variant="primary")

                with gr.Column(scale=1):
                    search_query = gr.Textbox(
                        label="Generated Search Query",
                        lines=3
                    )
                    search_results = gr.Textbox(
                        label="Search Results",
                        lines=12
                    )

        # Tab 4: Vision Chat
        with gr.Tab("💬 Vision Chat"):
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
                    gr.Examples(
                        examples=[
                            ["What colors are dominant in this image?"],
                            ["Describe the mood and atmosphere"],
                            ["What text is visible in this image?"],
                            ["Count the number of people"],
                        ],
                        inputs=chat_prompt,
                    )

                with gr.Column(scale=1):
                    chat_response = gr.Textbox(
                        label="AI Response",
                        lines=15
                    )
                    chat_usage = gr.Textbox(
                        label="Token Usage",
                        lines=2
                    )

    # Footer
    gr.Markdown("""
    ---
    ### 🔑 Get Your API Key

    1. Visit [Zhipu AI Open Platform](https://open.bigmodel.cn/)
    2. Sign up and get your API key
    3. Enter it in the field above to enable real AI features

    ### 📚 Resources

    - [GitHub Repository](https://github.com/Ripnrip/zai-vision-suite)
    - [Zhipu AI Documentation](https://open.bigmodel.cn/dev/api)
    """)

    # Event handlers
    def update_api_status(key):
        if key:
            return "✅ **API Key Ready**"
        return "⚠️ **Enter API key for real AI**"

    api_key_input.change(
        fn=update_api_status,
        inputs=api_key_input,
        outputs=api_status
    )

    analyze_btn.click(
        fn=lambda img, detail, key: analyze_image_real(img, detail, key) if img else ("Please upload an image.", ""),
        inputs=[image_input, detail_level, api_key_input],
        outputs=[scene_output, objects_output]
    )

    ocr_btn.click(
        fn=lambda img, lang, key: extract_text_real(img, lang, key) if img else "Please upload an image.",
        inputs=[ocr_image, language, api_key_input],
        outputs=ocr_output
    )

    search_btn.click(
        fn=lambda img, stype, key: vision_search_real(img, stype, key) if img else ("Please upload an image.", ""),
        inputs=[search_image, search_type, api_key_input],
        outputs=[search_query, search_results]
    )

    chat_btn.click(
        fn=lambda img, prompt, key: vision_chat_real(img, prompt, key) if img else ("Please upload an image.", ""),
        inputs=[chat_image, chat_prompt, api_key_input],
        outputs=[chat_response, chat_usage]
    )


if __name__ == "__main__":
    import uvicorn

    # Check for API key and show warning if not set
    if not os.environ.get('ZAI_API_KEY'):
        print("⚠️  WARNING: ZAI_API_KEY not set in environment.")
        print("Users can enter their API key via the web UI.")
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
            max-width: 1400px !important;
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
