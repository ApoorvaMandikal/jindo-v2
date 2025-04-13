from fastapi import FastAPI
import os
import requests  # Ensure you imported requests
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import Request


# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://d38bqbwa18mjva.cloudfront.net",],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")  

# Live Transcription
@app.get("/generate-token")
async def generate_token():
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key is missing"}

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    data = {
    "input_audio_format": "pcm16",  # ✅ Required for audio input
    "input_audio_transcription": { "model": "whisper-1" },  # ✅ Move model inside
    "turn_detection": {  # ✅ Improve transcription accuracy
        "type": "server_vad",
        "threshold": 0.5,
        "prefix_padding_ms": 300,
        "silence_duration_ms": 200
    },
    "include": ["item.input_audio_transcription.logprobs"]  # ✅ Explicitly request transcription
}




    try:
        response = requests.post(
            "https://api.openai.com/v1/realtime/transcription_sessions",
            headers=headers,
             json=data  # No "model" parameter
        )

        if response.status_code != 200:
            return {"error": "Failed to generate token", "details": response.text}

        return response.json()

    except Exception as e:
        return {"error": "Request failed", "details": str(e)}

#Chatbot
@app.post("/chat")
async def chat_completion(request_data: dict):
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key is missing"}

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json=request_data,  # Send user messages to OpenAI
        )

        if response.status_code != 200:
            return {"error": "Failed to get chat response", "details": response.text}

        return response.json()  # Return OpenAI's response to the frontend

    except Exception as e:
        return {"error": "Request failed", "details": str(e)}

#Summary
@app.post("/summary")
async def generate_summary(request: Request):
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key is missing"}

    data = await request.json()
    text = data.get("text", "")
    
    if not text.strip():
        return {"error": "No text provided for summary"}

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "system", "content": "Summarize this conversation."},
        {"role": "user", "content": text}
    ]

    try:
        response = requests.post(
            "https://api.openai.com/v1/chat/completions",
            headers=headers,
            json={
                "model": "gpt-4o",
                "messages": messages,
            },
        )

        if response.status_code != 200:
            return {"error": "Failed to generate summary", "details": response.text}

        result = response.json()
        summary = result["choices"][0]["message"]["content"]
        return {"summary": summary}

    except Exception as e:
        return {"error": "Request failed", "details": str(e)}