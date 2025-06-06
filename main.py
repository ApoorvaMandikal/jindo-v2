from fastapi import FastAPI
import os
import requests  # Ensure you imported requests
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from fastapi import Request
import pdfplumber
from fastapi import APIRouter
import json





# Load environment variables
load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000","https://d38bqbwa18mjva.cloudfront.net","https://www.app1.jindolabs.com"],
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

@app.post("/insights")
async def generate_insights(request: Request):
    if not OPENAI_API_KEY:
        return {"error": "OpenAI API key is missing"}

    data = await request.json()
    text = data.get("text", "")

    if not text.strip():
        return {"error": "No text provided for insights"}

    headers = {
        "Authorization": f"Bearer {OPENAI_API_KEY}",
        "Content-Type": "application/json",
    }

    messages = [
        {"role": "system", "content": "Extract the age, location, and how long the person has been a client. Also summarize the file into 3 key points. Respond in this exact JSON format: {\"age\": int, \"location\": str, \"duration\": str, \"insights\": [str, str, str]}"},
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

        result = response.json()
        content = result["choices"][0]["message"]["content"]

        # Clean up triple backtick wrapping if present
        if content.startswith("```json"):
            content = content.strip("```json").strip("```").strip()
        elif content.startswith("```"):
            content = content.strip("```").strip()

        # Try parsing the content as JSON (in case GPT follows instructions)
        try:
            extracted = json.loads(content)
            return extracted
        except Exception as e:
            # Fallback: Return raw content if parsing fails
            return {"raw_insights": content}

    except Exception as e:
        return {"error": "Request failed", "details": str(e)}

#client_file
@app.get("/load-client-file/{client_id}")
async def load_client_file(client_id: str):
    file_path = f"./Clients/{client_id}.pdf"

    if not os.path.exists(file_path):
        return {"error": f"File for client '{client_id}' not found."}

    try:
        text = ""
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"

        return {"client_id": client_id, "file_text": text}

    except Exception as e:
        return {"error": "Failed to read PDF file", "details": str(e)}

#Client List
CLIENT_FILES_DIR = "./Clients/"

@app.get("/list-clients")
def list_clients():
    try:
        files = os.listdir(CLIENT_FILES_DIR)
        clients = [os.path.splitext(f)[0] for f in files if f.endswith(".pdf")]  # or .txt etc.
        return {"clients": clients}
    except Exception as e:
        return {"error": str(e)}
