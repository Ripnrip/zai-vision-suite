#!/usr/bin/env python3
"""
Z.ai Vision Suite - Streamlit Web Application
A modern web interface for all vision operations using Streamlit
"""

import streamlit as st
import os
import base64
import requests
from pathlib import Path
from typing import Optional
from io import BytesIO
from PIL import Image as PILImage

# Page configuration
st.set_page_config(
    page_title="Z.ai Vision Suite",
    page_icon="🖼️",
    layout="wide",
    initial_sidebar_state="expanded",
)

# Custom CSS
st.markdown("""
<style>
    .main-header {
        text-align: center;
        padding: 1.5rem;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        border-radius: 10px;
        margin-bottom: 2rem;
    }
    .stButton>button {
        width: 100%;
    }
</style>
""", unsafe_allow_html=True)

# Configuration
API_URL = os.environ.get('ZAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4')
MODEL = os.environ.get('ZAI_MODEL_VISION', 'glm-4v')

# Initialize session state for API key
if 'api_key' not in st.session_state:
    st.session_state.api_key = os.environ.get('ZAI_API_KEY', '')


def encode_image(image):
    """Convert uploaded file to base64"""
    if image is None:
        return None

    # Convert to PIL Image
    img = PILImage.open(image)
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()

    return f"data:image/png;base64,{img_str}"


def call_zhipu_api(api_key: str, messages: list, max_tokens: int = 1024):
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
        st.error(f"API call failed: {str(e)}")
        return None


def analyze_image(image_base64, detail='high', api_key=''):
    """Analyze image with real API or demo mode"""
    if api_key:
        messages = [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": image_base64}},
                {"type": "text", "text": f"Analyze this image in {detail} detail. Describe the scene, main objects, colors, mood, and any notable features."}
            ]
        }]

        result = call_zhipu_api(api_key, messages, max_tokens=2048)

        if result and 'choices' in result:
            content = result['choices'][0]['message']['content']
            tokens = result['usage'].get('total_tokens', 'N/A')
            return content, f"Tokens: {tokens}"

    # Demo mode
    return f"""**Demo Mode - No API Key**

Enter your Zhipu AI API key in the sidebar for real AI analysis.

**What would be provided with an API key:**
- Scene understanding at {detail} detail
- Object detection with confidence scores
- Color palette and mood analysis
- Contextual information""", "Tokens: N/A (demo mode)"


def extract_text(image_base64, language='auto', api_key=''):
    """Extract text with real API or demo mode"""
    if api_key:
        prompt = "Extract all text from this image. Preserve the original formatting, line breaks, and structure."
        if language != 'auto':
            prompt += f" The text is in {language}."

        messages = [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": image_base64}},
                {"type": "text", "text": prompt}
            ]
        }]

        result = call_zhipu_api(api_key, messages, max_tokens=4096)

        if result and 'choices' in result:
            text = result['choices'][0]['message']['content']
            tokens = result['usage'].get('total_tokens', 'N/A')
            return text + f"\n\n*Tokens: {tokens}*"

    # Demo mode
    return f"""**Demo Mode - No API Key**

Enter your Zhipu AI API key in the sidebar for real OCR.

**Supported Languages:** {language} (auto-detected with API key)
- 100+ languages supported
- Format preservation
- Multi-column layout handling"""


def vision_search(image_base64, search_type='web', api_key=''):
    """Vision search with real API or demo mode"""
    if api_key:
        prompts = {
            'web': 'Describe this image in detail. What search terms would find this on the web?',
            'products': 'Identify any products in this image. What are they and where might someone buy them?',
            'similar': 'Describe this image. What search terms would find similar images?'
        }

        messages = [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": image_base64}},
                {"type": "text", "text": prompts.get(search_type, prompts['web'])}
            ]
        }]

        result = call_zhipu_api(api_key, messages)

        if result and 'choices' in result:
            query = result['choices'][0]['message']['content']
            tokens = result['usage'].get('total_tokens', 'N/A')
            return query, f"**Search Type:** {search_type}\n\n{query}\n\n*Tokens: {tokens}*"

    # Demo mode
    return "Visual search query (demo mode)", f"""**Demo Mode - No API Key**

Enter your Zhipu AI API key in the sidebar for real vision search.

**Search Type:** {search_type}

**What would happen:**
1. AI analyzes your image content
2. Generates optimal search queries
3. Returns relevant web results"""


def vision_chat(image_base64, prompt, api_key=''):
    """Vision chat with real API or demo mode"""
    if not prompt:
        prompt = "What do you see in this image?"

    if api_key:
        messages = [{
            "role": "user",
            "content": [
                {"type": "image_url", "image_url": {"url": image_base64}},
                {"type": "text", "text": prompt}
            ]
        }]

        result = call_zhipu_api(api_key, messages, max_tokens=2048)

        if result and 'choices' in result:
            response = result['choices'][0]['message']['content']
            tokens = result['usage'].get('total_tokens', 'N/A')
            return response, f"Tokens: {tokens}"

    # Demo mode
    return f"""**Demo Mode - No API Key**

This is a simulated response to: "{prompt}"

Enter your Zhipu AI API key in the sidebar for real AI responses!""", "Tokens: N/A (demo mode)"


# Sidebar with API key input
with st.sidebar:
    st.markdown("# 🔑 Configuration")

    # API Key input
    api_key_input = st.text_input(
        "Zhipu AI API Key",
        value=st.session_state.api_key,
        type="password",
        placeholder="Enter your API key here",
        help="Get your key from https://open.bigmodel.cn/"
    )

    # Update session state when key changes
    if api_key_input != st.session_state.api_key:
        st.session_state.api_key = api_key_input

    # Show status
    if st.session_state.api_key:
        st.success("✅ API Key Ready")
    else:
        st.warning("⚠️ Demo Mode - Enter API key for real AI")

    st.markdown("---")
    st.markdown("### 📚 Resources")
    st.markdown("- [Get API Key](https://open.bigmodel.cn/)")
    st.markdown("- [Documentation](https://github.com/Ripnrip/zai-vision-suite)")
    st.markdown("- [GitHub Repo](https://github.com/Ripnrip/zai-vision-suite)")

# Main content
st.markdown("""
<div class="main-header">
    <h1>🖼️ Z.ai Vision Suite</h1>
    <p>AI-Powered Visual Intelligence powered by Zhipu AI's GLM-4V</p>
</div>
""", unsafe_allow_html=True)

# Tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "🔍 Image Analysis", "📝 OCR (Extract Text)",
    "🔎 Vision Search", "💬 Vision Chat"
])

# Tab 1: Image Analysis
with tab1:
    st.subheader("Analyze images with AI-powered scene understanding")

    col1, col2 = st.columns(2)

    with col1:
        uploaded_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if uploaded_file:
            st.image(uploaded_file, caption="Uploaded Image")

        detail = st.radio("Detail Level", ["high", "low", "auto"], horizontal=True)

        if st.button("Analyze Image", type="primary"):
            if uploaded_file:
                with st.spinner("Analyzing..."):
                    image_base64 = encode_image(uploaded_file)
                    scene, tokens = analyze_image(image_base64, detail, st.session_state.api_key)
                    st.markdown(f"### Scene Description")
                    st.markdown(scene)
                    st.caption(tokens)

    with col2:
        if uploaded_file and st.session_state.api_key:
            st.info("👆 Upload an image and click Analyze to get AI-powered insights")
        else:
            st.info("👆 Upload an image to test (Demo Mode)")

# Tab 2: OCR
with tab2:
    st.subheader("Extract text from images using OCR")

    col1, col2 = st.columns(2)

    with col1:
        ocr_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if ocr_file:
            st.image(ocr_file, caption="Uploaded Image")

        language = st.selectbox(
            "Language",
            ["auto", "english", "chinese", "spanish", "french", "german", "japanese"]
        )

        if st.button("Extract Text", type="primary"):
            if ocr_file:
                with st.spinner("Extracting text..."):
                    image_base64 = encode_image(ocr_file)
                    text = extract_text(image_base64, language, st.session_state.api_key)
                    st.markdown(f"### Extracted Text")
                    st.markdown(text)

    with col2:
        if ocr_file:
            if st.session_state.api_key:
                st.success("👆 Upload an image with text to extract")
            else:
                st.info("👆 Upload an image to test (Demo Mode)")

# Tab 3: Vision Search
with tab3:
    st.subheader("Search the web using images as queries")

    col1, col2 = st.columns(2)

    with col1:
        search_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if search_file:
            st.image(search_file, caption="Uploaded Image")

        search_type = st.radio("Search Type", ["web", "products", "similar"], horizontal=True)

        if st.button("Search", type="primary"):
            if search_file:
                with st.spinner("Generating search query..."):
                    image_base64 = encode_image(search_file)
                    query, results = vision_search(image_base64, search_type, st.session_state.api_key)
                    st.markdown(f"### Generated Query")
                    st.markdown(query)
                    st.markdown("---")
                    st.markdown(results)

# Tab 4: Vision Chat
with tab4:
    st.subheader("Interactive conversational AI mode for image analysis")

    col1, col2 = st.columns(2)

    with col1:
        chat_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if chat_file:
            st.image(chat_file, caption="Uploaded Image")

        prompt = st.text_input("Your question about the image:", placeholder="What do you see in this image?")

        # Example prompts
        st.markdown("**Example Prompts:**")
        col_a, col_b = st.columns(2)
        with col_a:
            if st.button("What colors are dominant?"):
                prompt = "What colors are dominant in this image?"
        with col_b:
            if st.button("Describe the mood"):
                prompt = "Describe the mood and atmosphere of this image."

        if st.button("Ask", type="primary"):
            if chat_file and prompt:
                with st.spinner("Thinking..."):
                    image_base64 = encode_image(chat_file)
                    response, tokens = vision_chat(image_base64, prompt, st.session_state.api_key)
                    st.markdown(f"### AI Response")
                    st.markdown(response)
                    st.caption(tokens)

    with col2:
        if chat_file:
            if st.session_state.api_key:
                st.success("👆 Upload an image and ask questions")
            else:
                st.info("👆 Upload an image to test (Demo Mode)")
