import gradio as gr
import os
import base64
from PIL import Image as PILImage
from io import BytesIO

API_URL = os.environ.get('ZAI_BASE_URL', 'https://open.bigmodel.cn/api/paas/v4')
MODEL = os.environ.get('ZAI_MODEL_VISION', 'glm-4v')


def encode_image(img):
    if img is None: return None
    buffered = BytesIO()
    PILImage.open(img).save(buffered, "PNG")
    return f"data:image/png;base64,{base64.b64encode(buffered.getvalue()).decode()}"


def call_api(img, prompt, api_key):
    if not img:
        return "Please upload an image."
    if not api_key:
        return "**Demo Mode** - Enter your Zhipu AI API key above for real AI.\n\nUpload an image and enter your key to use real AI."
    
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


with gr.Blocks(title="Z.ai Vision Suite") as demo:
    gr.Markdown("# 🖼️ Z.ai Vision Suite\n\nAI-Powered Visual Intelligence powered by Zhipu AI\'s GLM-4V")
    
    api_key = gr.Textbox(
        label="🔑 Zhipu AI API Key (get it from https://open.bigmodel.cn/)",
        type="password",
        placeholder="Enter your API key here...",
        value=os.environ.get('ZAI_API_KEY', '')
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
    
    gr.Markdown("---\n### 🔑 Get Your API Key\n\nVisit [Zhipu AI](https://open.bigmodel.cn/) to sign up and get your free API key.")

if __name__ == "__main__":
    demo.launch()
