#!/usr/bin/env python3
"""
Z.ai Vision Suite - Streamlit Web Application
A modern web interface for all vision operations using Streamlit
"""

import streamlit as st
import os
import base64
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
API_KEY = os.environ.get('ZAI_API_KEY', '')
API_URL = os.environ.get('ZAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4')
MODEL = os.environ.get('ZAI_MODEL_VISION', 'glm-4v')

# Demo mode warning
if not API_KEY:
    st.warning("⚠️ **DEMO MODE**: ZAI_API_KEY not set. Running with simulated responses. Set your key with `export ZAI_API_KEY='your-key'`")


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


def simulate_api_call(feature: str, image_base64: str, **kwargs):
    """Simulate API responses in demo mode"""
    responses = {
        "analyze": {
            "scene": f"""**Scene Analysis ({kwargs.get('detail', 'high')} detail)**

This is a demonstration response for the Z.ai Vision Suite.

In production mode with a valid API key, this would provide:
- Comprehensive scene description
- Object detection with confidence scores
- Color palette and mood analysis
- Spatial relationships understanding

**Setup instructions:**
```bash
export ZAI_API_KEY="your-zhipu-ai-api-key"
streamlit run webapp/app_streamlit.py
```""",
            "objects": "**Detected Objects**\n\nObjects would be listed here with confidence percentages in production mode."
        },
        "ocr": {
            "text": f"""**OCR Result ({kwargs.get('language', 'auto')} language)**

This is simulated OCR text for demonstration.

In production mode, the Z.ai Vision Suite would:
- Extract all visible text from your image
- Preserve original formatting and structure
- Auto-detect language if not specified
- Handle multi-column layouts
- Support 100+ languages

**Setup:**
```bash
export ZAI_API_KEY="your-key"
```""",
        },
        "search": {
            "query": f"Visual search query for uploaded image",
            "results": """**Search Results** (Demo Mode)

In production, this would return:
- Actual search queries based on image content
- Product listings (for shopping searches)
- Similar images (for visual matching)
- Information sources (for web searches)

**Setup:**
```bash
export ZAI_API_KEY="your-key"
```"""
        },
        "chat": {
            "response": f"""**Demo Response to: {kwargs.get('prompt', 'What do you see?')}**

This is a simulated conversational response.

In production mode with a valid API key, the AI would:
- Understand visual context from your image
- Answer specific questions about content
- Provide detailed, contextual responses
- Support follow-up questions

**Setup:**
```bash
export ZAI_API_KEY="your-key"
```""",
            "usage": "~100 tokens (demo mode)"
        }
    }
    return responses.get(feature, {})


# Main app
st.markdown('<div class="main-header">')
st.markdown("# 🖼️ Z.ai Vision Suite")
st.markdown("### Multi-platform AI vision powered by Zhipu AI GLM-4V")
st.markdown('</div>', unsafe_allow_html=True)

# API Key info in sidebar
with st.sidebar:
    st.markdown("### ⚙️ Configuration")

    st.markdown("**Environment Variables:**")
    st.code("""
export ZAI_API_KEY="your-key"
export ZAI_BASE_URL="https://open.bigmodel.cn/api/paas/v4"
export ZAI_MODEL_VISION="glm-4v"
    """)

    st.markdown("**Get API Key:** [Zhipu AI Platform](https://open.bigmodel.cn/)")

    st.markdown("---")
    st.markdown("**Links:**")
    st.markdown("- [Documentation](https://github.com/Ripnrip/zai-vision-suite)")
    st.markdown("- [GitHub](https://github.com/Ripnrip/zai-vision-suite)")

# Feature tabs
tab1, tab2, tab3, tab4 = st.tabs([
    "🔍 Image Analysis",
    "📄 OCR (Extract Text)",
    "🌐 Vision Search",
    "💬 Vision Chat"
])

# Tab 1: Image Analysis
with tab1:
    st.subheader("Analyze images with AI-powered scene understanding")

    col1, col2 = st.columns(2)

    with col1:
        uploaded_file = st.file uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if uploaded_file:
            st.image(uploaded_file)

        detail = st.select_slider("Detail Level", ["low", "high", "auto"], value="high")
        detect_objects = st.checkbox("Detect Objects", value=True)

    with col2:
        if st.button("🔍 Analyze Image", type="primary", use_container_width=True):
            if uploaded_file:
                with st.spinner("Analyzing..."):
                    image_base64 = encode_image(uploaded_file)
                    result = simulate_api_call("analyze", image_base64, detail=detail, detect_objects=detect_objects)

                    st.markdown("### Scene Description")
                    st.markdown(result["scene"])

                    st.markdown("### Objects")
                    st.markdown(result["objects"])
            else:
                st.warning("Please upload an image first")

# Tab 2: OCR
with tab2:
    st.subheader("Extract text from images using OCR")

    col1, col2 = st.columns(2)

    with col1:
        ocr_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if ocr_file:
            st.image(ocr_file)

        language = st.selectbox("Language", ["auto", "english", "chinese", "spanish", "french", "german", "japanese"], index=0)
        preserve_format = st.checkbox("Preserve Formatting", value=True)

    with col2:
        if st.button("📄 Extract Text", type="primary", use_container_width=True):
            if ocr_file:
                with st.spinner("Extracting text..."):
                    image_base64 = encode_image(ocr_file)
                    result = simulate_api_call("ocr", image_base64, language=language, preserve_format=preserve_format)

                    st.markdown("### Extracted Text")
                    st.text_area("Extracted text", result["text"], height=300)

                    st.download_button(
                        "Download Text",
                        result["text"],
                        "extracted_text.txt",
                        mime="text/plain"
                    )
            else:
                st.warning("Please upload an image first")

# Tab 3: Vision Search
with tab3:
    st.subheader("Search the web using images as queries")

    col1, col2 = st.columns(2)

    with col1:
        search_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if search_file:
            st.image(search_file)

        search_type = st.radio("Search Type", ["web", "products", "similar"], horizontal=True)
        max_results = st.slider("Max Results", 1, 20, 5)

    with col2:
        if st.button("🌐 Search", type="primary", use_container_width=True):
            if search_file:
                with st.spinner("Searching..."):
                    image_base64 = encode_image(search_file)
                    result = simulate_api_call("search", image_base64, search_type=search_type, max_results=max_results)

                    st.markdown("### Search Query")
                    st.info(result["query"])

                    st.markdown("### Results")
                    st.markdown(result["results"])
            else:
                st.warning("Please upload an image first")

# Tab 4: Vision Chat
with tab4:
    st.subheader("Interactive conversational AI mode for image analysis")

    col1, col2 = st.columns(2)

    with col1:
        chat_file = st.file_uploader("Upload an image", type=["jpg", "jpeg", "png", "gif", "webp"])

        if chat_file:
            st.image(chat_file)

        prompt = st.text_input("Your question about the image:", placeholder="What do you see in this image?")

        # Example prompts
        st.markdown("**Example Prompts:**")
        if st.button("What colors are dominant?"):
            prompt = "What colors are dominant in this image?"
        if st.button("Describe the mood"):
            prompt = "Describe the mood and atmosphere of this image."

    with col2:
        if st.button("💬 Ask", type="primary", use_container_width=True):
            if chat_file and prompt:
                with st.spinner("Processing..."):
                    image_base64 = encode_image(chat_file)
                    result = simulate_api_call("chat", image_base64, prompt=prompt)

                    st.markdown("### AI Response")
                    st.markdown(result["response"])

                    if "usage" in result:
                        st.caption(result["usage"])
            else:
                if not chat_file:
                    st.warning("Please upload an image first")
                elif not prompt:
                    st.warning("Please enter a question")

# Footer
st.markdown("---")
st.markdown("### 📦 Installation")

st.markdown("**Install dependencies:**")
st.code("""
pip install -r webapp/requirements.txt
""")

st.markdown("**Run Gradio app:**")
st.code("""
python webapp/app.py
""")

st.markdown("**Run Streamlit app:**")
st.code("""
streamlit run webapp/app_streamlit.py
""")

st.markdown("---")
st.markdown("Made with ❤️ by Z.ai Vision Suite")
