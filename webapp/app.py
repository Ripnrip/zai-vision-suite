import gradio as gr
import os
import base64
import tempfile
import cv2
import numpy as np
from PIL import Image as PILImage
from io import BytesIO

API_URL = os.environ.get("ZAI_BASE_URL", "https://api.z.ai/api/paas/v4")
MODEL = os.environ.get("ZAI_MODEL_VISION", "glm-4.6v")


def encode_image(img):
    if img is None: return None
    buffered = BytesIO()
    PILImage.open(img).save(buffered, "PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"


def call_api(img, prompt, api_key):
    if not img:
        return "Please upload an image."
    if not api_key:
        return "**Demo Mode** - Enter your Z AI API key above for real AI.\n\nUpload an image and enter your key to use real AI."

    import requests
    try:
        resp = requests.post(
            f"{API_URL}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": MODEL, "messages": [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": encode_image(img)}},
                    {"type": "text", "text": prompt}
                ]
            }], "max_tokens": 2048},
            timeout=60
        )
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"


def analyze_image(img, api_key):
    """Analyze a single image using the AI API."""
    if not api_key:
        return "**Demo Mode** - Enter your Z AI API key above for real AI."

    import requests
    try:
        resp = requests.post(
            f"{API_URL}/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={"model": MODEL, "messages": [{
                "role": "user",
                "content": [
                    {"type": "image_url", "image_url": {"url": encode_image(img)}},
                    {"type": "text", "text": "Analyze this video frame. Describe what you see in detail including objects, people, actions, setting, and any notable elements."}
                ]
            }], "max_tokens": 1024},
            timeout=60
        )
        resp.raise_for_status()
        return resp.json()['choices'][0]['message']['content']
    except Exception as e:
        return f"Error: {str(e)}"


def extract_frames_from_video(video_path, num_frames=10):
    """Extract frames from video using OpenCV."""
    try:
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            return None, "Could not open video file."

        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        fps = cap.get(cv2.CAP_PROP_FPS)
        duration = total_frames / fps if fps > 0 else 0

        # Calculate frame indices to extract
        if total_frames <= num_frames:
            frame_indices = list(range(total_frames))
        else:
            # Extract evenly distributed frames
            frame_indices = [int(i * total_frames / num_frames) for i in range(num_frames)]

        frames = []
        for idx in frame_indices:
            cap.set(cv2.CAP_PROP_POS_FRAMES, idx)
            ret, frame = cap.read()
            if ret:
                # Convert BGR to RGB
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                frames.append(frame_rgb)

        cap.release()
        return frames, f"Extracted {len(frames)} frames from {duration:.2f}s video ({total_frames} total frames at {fps:.2f} fps)"
    except Exception as e:
        return None, f"Error extracting frames: {str(e)}"


def process_video(video, num_frames, api_key):
    """Process video: extract frames and analyze each with AI."""
    if video is None:
        return None, "Please upload a video file.", ""

    if not api_key:
        return None, "**Demo Mode** - Enter your Z AI API key above for real AI.\n\nUpload a video and enter your key to use real AI.", ""

    try:
        # Extract frames from video
        frames, extraction_info = extract_frames_from_video(video, num_frames)

        if frames is None:
            return None, extraction_info, ""

        # Analyze each frame
        frame_analyses = []
        for i, frame in enumerate(frames):
            # Convert numpy array to PIL Image
            from PIL import Image as PIL
            img_pil = PIL.fromarray(frame)

            # Save to temp file for Gradio
            with tempfile.NamedTemporaryFile(suffix=".png", delete=False) as tmp:
                img_pil.save(tmp.name)
                tmp_path = tmp.name

            # Analyze frame
            analysis = analyze_image(tmp_path, api_key)
            frame_analyses.append({
                'frame_number': i + 1,
                'analysis': analysis,
                'image_path': tmp_path
            })

        # Generate summary
        summary = f"## Video Processing Summary\n\n{extraction_info}\n\n### Frame Analysis Results:\n\n"
        for fa in frame_analyses:
            summary += f"**Frame {fa['frame_number']}:**\n{fa['analysis']}\n\n"

        # Return first frame as preview and analyses
        first_frame_path = frame_analyses[0]['image_path'] if frame_analyses else None
        return first_frame_path, frame_analyses, summary

    except Exception as e:
        return None, f"Error processing video: {str(e)}", ""


def show_frame_analysis(frame_analyses, frame_idx):
    """Show analysis for a specific frame."""
    if frame_analyses is None or len(frame_analyses) == 0:
        return None, "No analysis available. Process a video first."
    if frame_idx < 0 or frame_idx >= len(frame_analyses):
        return None, f"Frame index out of range. Total frames: {len(frame_analyses)}"

    fa = frame_analyses[frame_idx]
    return fa['image_path'], f"**Frame {fa['frame_number']} Analysis:**\n\n{fa['analysis']}"


with gr.Blocks(title="Z.ai Vision Suite") as demo:
    gr.Markdown("# 🖼️ Z.ai Vision Suite\n\nAI-Powered Visual Intelligence powered by Z AI\'s GLM-4V")
    
    api_key = gr.Textbox(
        label="🔑 Z AI API Key (get it from https://z.ai/)",
        type="password",
        placeholder="Enter your API key here...",
        value=os.environ.get("ZAI_API_KEY", "")
    )
    
    with gr.Tabs():
        with gr.Tab("🔍 Image Analysis"):
            with gr.Row():
                with gr.Column():
                    img1 = gr.Image(label="Upload Image")
                    detail1 = gr.Radio(["low", "high", "auto"], value="high", label="Detail Level")
                    btn1 = gr.Button("Analyze Image", variant="primary")
                with gr.Column():
                    out1 = gr.Textbox(label="Analysis Result", lines=12)
            btn1.click(
                lambda i, d, k: call_api(i, f"Analyze this image in {d} detail. Describe the scene, objects, colors, and mood.", k),
                inputs=[img1, detail1, api_key],
                outputs=out1
            )
        
        with gr.Tab("📝 OCR (Extract Text)"):
            with gr.Row():
                with gr.Column():
                    img2 = gr.Image(label="Upload Image")
                    lang2 = gr.Dropdown(["auto", "english", "chinese", "spanish", "french", "german"], value="auto", label="Language")
                    btn2 = gr.Button("Extract Text", variant="primary")
                with gr.Column():
                    out2 = gr.Textbox(label="Extracted Text", lines=15)
            btn2.click(
                lambda i, l, k: call_api(i, f"Extract all text from this image. Language: {l}. Preserve original formatting and structure.", k),
                inputs=[img2, lang2, api_key],
                outputs=out2
            )
        
        with gr.Tab("🔎 Vision Search"):
            with gr.Row():
                with gr.Column():
                    img3 = gr.Image(label="Upload Image")
                    stype3 = gr.Radio(["web", "products", "similar"], value="web", label="Search Type")
                    btn3 = gr.Button("Search", variant="primary")
                with gr.Column():
                    out3 = gr.Textbox(label="Search Results", lines=12)
            btn3.click(
                lambda i, t, k: call_api(i, f"Describe this image. What search terms would find this on the web for {t}?", k),
                inputs=[img3, stype3, api_key],
                outputs=out3
            )
        
        with gr.Tab("💬 Vision Chat"):
            with gr.Row():
                with gr.Column():
                    img4 = gr.Image(label="Upload Image")
                    prompt4 = gr.Textbox(label="Your Question", placeholder="What do you see in this image?", lines=2)
                    btn4 = gr.Button("Ask", variant="primary")
                with gr.Column():
                    out4 = gr.Textbox(label="AI Response", lines=12)
            btn4.click(
                lambda i, p, k: call_api(i, p or "What do you see in this image?", k),
                inputs=[img4, prompt4, api_key],
                outputs=out4
            )

        with gr.Tab("🎬 Video Processing"):
            with gr.Row():
                with gr.Column():
                    video5 = gr.File(label="Upload Video", file_types=[".mp4", ".webm", ".mov"])
                    num_frames5 = gr.Slider(minimum=1, maximum=50, value=10, step=1, label="Number of Frames to Extract")
                    btn5 = gr.Button("Process Video", variant="primary")

                with gr.Column():
                    with gr.Row():
                        frame_preview = gr.Image(label="Frame Preview")
                        frame_slider = gr.Slider(minimum=1, maximum=10, value=1, step=1, label="Select Frame", interactive=True)
                    frame_analysis = gr.Textbox(label="Frame Analysis", lines=10)

            with gr.Row():
                video_summary = gr.Markdown(label="Video Summary")

            # Store frame analyses as hidden state
            frame_analyses_state = gr.State(None)

            # Process video button
            btn5.click(
                fn=process_video,
                inputs=[video5, num_frames5, api_key],
                outputs=[frame_preview, frame_analyses_state, video_summary]
            ).then(
                lambda fa: gr.Slider.update(
                    minimum=1,
                    maximum=len(fa) if fa and len(fa) > 0 else 1,
                    value=1,
                    step=1,
                    label="Select Frame (1-" + str(len(fa) if fa and len(fa) > 0 else 1) + ")",
                    interactive=True
                ),
                inputs=[frame_analyses_state],
                outputs=[frame_slider]
            ).then(
                lambda fa: (fa[0]['image_path'] if fa and len(fa) > 0 else None,
                           fa[0]['analysis'] if fa and len(fa) > 0 else "No analysis available."),
                inputs=[frame_analyses_state],
                outputs=[frame_preview, frame_analysis]
            )

            # Frame slider change
            frame_slider.change(
                fn=lambda fa, idx: show_frame_analysis(fa, idx - 1),
                inputs=[frame_analyses_state, frame_slider],
                outputs=[frame_preview, frame_analysis]
            )

    gr.Markdown("---\n### 🔑 Get Your API Key\n\nVisit [Z AI](https://z.ai/) to sign up and get your free API key.")

if __name__ == "__main__":
    demo.launch()
