import streamlit as st
import os
import base64
import tempfile
import cv
import numpy as np
from PIL import Image as PILImage
from io import BytesIO
import requests

# Configuration
API_URL = os.environ.get("ZAI_BASE_URL", "https://open.bigmodel.cn/api/paas/v4")
MODEL = os.environ.get("ZAI_MODEL_VISION", "glm-4v")


def encode_image(img_path):
    """Encode image to base64 for API transmission."""
    if img_path is None:
        return None
    buffered = BytesIO()
    PILImage.open(img_path).save(buffered, "PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"


def call_api(img_path, prompt, api_key):
    """Make API call to Zhipu AI."""
    if not img_path:
        return "Please upload an image."

    if not api_key:
        return "**Demo Mode** - Enter your Zhipu AI API key above for real AI.\n\nUpload an image and enter your key to use real AI."

    try:
        resp = requests.post(
            f"{API_URL}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": encode_image(img_path)}},
                        {"type": "text", "text": prompt}
                    ]
                }],
                "max_tokens": 2048
            },
            timeout=60
        )
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"


def analyze_image(img_path, api_key):
    """Analyze a single image using AI API."""
    if not api_key:
        return "**Demo Mode** - Enter your Zhipu AI API key above for real AI."

    try:
        resp = requests.post(
            f"{API_URL}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": MODEL,
                "messages": [{
                    "role": "user",
                    "content": [
                        {"type": "image_url", "image_url": {"url": encode_image(img_path)}},
                        {"type": "text", "text": "Analyze this video frame. Describe what you see in detail including objects, people, actions, setting, and any notable elements."}
                    ]
                }],
                "max_tokens": 1024
            },
            timeout=60
        )
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"


def extract_frames_from_video(video_path, num_frames=10):
    """Extract frames from video using OpenCV."""
    try:
        cap = cv.VideoCapture(video_path)
        if not cap.isOpened():
            return None, "Could not open video file."

        total_frames = int(cap.get(cv.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0

        # Calculate frame indices to extract
        if total_frames <= num_frames:
            frame_indices = list(range(total_frames))
        else:
            # Extract evenly distributed frames
            frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]

        frames = []
        for idx in frame_indices:
            cap.set(cv.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                # Convert BGR to RGB
                frame_rgb = cv.cvtColor(frame, cv.COLOR_BGR2RGB)
                frames.append(frame_rgb)

        cap.release()
        return frames, f"Extracted {len(frames)} frames from {duration:.2f}s video ({total_frames} total frames at {fps:.2f} fps)"
    except Exception as e:
        return None, f"Error extracting frames: {str(e)}"


def process_video(video_file, num_frames, api_key):
    """Process video: extract frames and analyze each with AI."""
    if video_file is None:
        return None, "Please upload a video file.", []

    if not api_key:
        return None, "**Demo Mode** - Enter your Zhipu AI API key above for real AI.\n\nUpload a video and enter your key to use real AI.", []

    try:
        # Extract frames from video
        frames, extraction_info = extract_frames_from_video(video_file, num_frames)

        if frames is None:
            return None, extraction_info, []

        # Analyze each frame
        frame_analyses = []
        for i, frame in enumerate(frames):
            # Convert numpy array to PIL Image
            img_pil = PILImage.fromarray(frame)

            # Save to temp file
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                img_pil.save(tmp.name)
                tmp_path = tmp.name

            # Analyze frame
            analysis = analyze_image(tmp_path, api_key)
            frame_analyses.append({
                'frame_number': i + 1,
                'analysis': analysis,
                'image_path': tmp_path,
                'pil_image': img_pil
            })

        # Return first frame and analyses
        first_frame_pil = frame_analyses[0]['pil_image'] if frame_analyses else None
        return first_frame_pil, extraction_info, frame_analyses

    except Exception as e:
        return None, f"Error processing video: {str(e)}", []


# Page config
st.set_page_config(
    page_title="Z.ai Vision Suite",
    page_icon="🖼️",
    layout="wide"
)

# Header
st.title("🖼️ Z.ai Vision Suite")
st.markdown("AI-Powered Visual Intelligence powered by Zhipu AI's GLM-4V")

# API Key input
api_key = st.text_input(
    "🔑 Zhipu AI API Key (get it from https://open.bigmodel.cn/)",
    type="password",
    placeholder="Enter your API key here...",
    value=os.environ.get("ZAI_API_KEY", "")
)

# Tabs
tab1, tab2, tab3, tab4, tab5 = st.tabs([
    "🔍 Image Analysis",
    "📝 OCR (Extract Text)",
    "🔎 Vision Search",
    "💬 Vision Chat",
    "🎬 Video Processing"
])

# Tab 1: Image Analysis
with tab1:
    st.subheader("Image Analysis")
    col1, col2 = st.columns(2)
    with col1:
        img1 = st.file_uploader("Upload Image", type=['png', 'jpg', 'jpeg', 'gif', 'webp'])
        detail1 = st.radio("Detail Level", ["low", "high", "auto"], index=1)
        btn1 = st.button("Analyze Image", type="primary")
    with col2:
        if btn1 and img1:
            result = call_api(img1, f"Analyze this image in {detail1} detail. Describe the scene, objects, colors, and mood.", api_key)
            st.text_area("Analysis Result", result, height=300)

# Tab 2: OCR
with tab2:
    st.subheader("OCR (Extract Text)")
    col1, col2 = st.columns(2)
    with col1:
        img2 = st.file_uploader("Upload Image", type=['png', 'jpg', 'jpeg', 'gif', 'webp'])
        lang2 = st.selectbox("Language", ["auto", "english", "chinese", "spanish", "french", "german"], index=0)
        btn2 = st.button("Extract Text", type="primary")
    with col2:
        if btn2 and img2:
            result = call_api(img2, f"Extract all text from this image. Language: {lang2}. Preserve original formatting and structure.", api_key)
            st.text_area("Extracted Text", result, height=350)

# Tab 3: Vision Search
with tab3:
    st.subheader("Vision Search")
    col1, col2 = st.columns(2)
    with col1:
        img3 = st.file_uploader("Upload Image", type=['png', 'jpg', 'jpeg', 'gif', 'webp'])
        stype3 = st.radio("Search Type", ["web", "products", "similar"], index=0)
        btn3 = st.button("Search", type="primary")
    with col2:
        if btn3 and img3:
            result = call_api(img3, f"Describe this image. What search terms would find this on the web for {stype3}?", api_key)
            st.text_area("Search Results", result, height=300)

# Tab 4: Vision Chat
with tab4:
    st.subheader("Vision Chat")
    col1, col2 = st.columns(2)
    with col1:
        img4 = st.file_uploader("Upload Image", type=['png', 'jpg', 'jpeg', 'gif', 'webp'])
        prompt4 = st.text_input("Your Question", placeholder="What do you see in this image?")
        btn4 = st.button("Ask", type="primary")
    with col2:
        if btn4 and img4:
            result = call_api(img4, prompt4 or "What do you see in this image?", api_key)
            st.text_area("AI Response", result, height=300)

# Tab 5: Video Processing
with tab5:
    st.subheader("Video Processing")

    col1, col2 = st.columns(2)

    with col1:
        video5 = st.file_uploader("Upload Video", type=['mp4', 'webm', 'mov'])
        num_frames5 = st.slider("Number of Frames to Extract", min_value=1, max_value=50, value=10, step=1)
        btn5 = st.button("Process Video", type="primary")

    with col2:
        if btn5 and video5:
            with st.spinner("Processing video..."):
                first_frame, extraction_info, frame_analyses = process_video(video5, num_frames5, api_key)

                if first_frame is not None:
                    st.success("Video processed successfully!")

                    # Display extraction info
                    st.info(extraction_info)

                    # Frame viewer
                    st.subheader("Frame Viewer")

                    # Frame slider
                    frame_idx = st.slider(
                        "Select Frame",
                        min_value=1,
                        max_value=len(frame_analyses),
                        value=1,
                        step=1
                    )

                    # Display selected frame
                    if frame_analyses and 1 <= frame_idx <= len(frame_analyses):
                        fa = frame_analyses[frame_idx - 1]
                        st.image(fa['pil_image'], caption=f"Frame {fa['frame_number']}", use_container_width=True)
                        st.markdown(f"**Frame {fa['frame_number']} Analysis:**")
                        st.write(fa['analysis'])

                    # Summary
                    st.subheader("Video Summary")
                    summary = f"## Video Processing Summary\n\n{extraction_info}\n\n### Frame Analysis Results:\n\n"
                    for fa in frame_analyses:
                        summary += f"**Frame {fa['frame_number']}:**\n{fa['analysis']}\n\n"
                    st.markdown(summary)

# Footer
st.markdown("---\n### 🔑 Get Your API Key\n\nVisit [Zhipu AI](https://open.bigmodel.cn/) to sign up and get your free API key.")
