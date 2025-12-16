import os
import json
import io
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

# 1. Env Variables Load
load_dotenv()

# 2. LongCat Client Configuration (According to Docs)
# Docs: "Compatible with OpenAI API specification"
# Docs Example: base_url="https://api.longcat.chat/openai"
client = OpenAI(
    api_key=os.getenv("LONGCAT_API_KEY"), 
    base_url="https://api.longcat.chat/openai" 
)

app = FastAPI(title="Resume Improver SaaS (LongCat Powered)")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"], # Saare methods (GET, POST, etc.) allow karo
    allow_headers=["*"],
)

def get_longcat_response(text):
    # Prompt Engineering: Hum AI ko strict instruction denge JSON ke liye
    prompt = f"""
    You are an expert AI Resume Coach. Analyze the resume text below against industry standards.
    
    RESUME TEXT:
    {text}
    
    REQUIRED OUTPUT:
    Respond ONLY with a valid JSON object. Do not add markdown like ```json or any text outside the JSON.
    
    Structure:
    {{
        "ats_score": 0-100 (integer),
        "missing_skills": ["skill1", "skill2"],
        "summary": "Professional summary (max 2 lines)",
        "improvement_tips": ["Specific tip 1", "Specific tip 2"]
    }}
    """
    
    try:
        # Docs: Supported Model is "LongCat-Flash-Chat"
        response = client.chat.completions.create(
            model="LongCat-Flash-Chat", 
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs only strict JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7, # Docs example uses 0.7
            max_tokens=1000  # Docs example limit
        )
        
        # Response Cleaning
        raw_content = response.choices[0].message.content
        
        # Kabhi kabhi AI ```json code block laga deta hai, usse safai karna zaroori hai
        clean_text = raw_content.replace("```json", "").replace("```", "").strip()
        
        return json.loads(clean_text)
        
    except json.JSONDecodeError:
        return {"error": "AI response was not valid JSON", "raw_output": raw_content}
    except Exception as e:
        print(f"LongCat API Error: {e}")
        return {"error": "AI Service unavailable", "details": str(e)}

@app.get("/")
def home():
    return {"message": "LongCat Powered Backend is Running!"}

@app.post("/analyze")
async def analyze_resume(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files allowed")

    try:
        # 1. PDF Parsing
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        text_content = ""
        for page in pdf_reader.pages:
            text_content += page.extract_text() or ""

        # Validation
        if len(text_content) < 50:
            return {"error": "Resume text too short or unreadable"}

        # 2. AI Analysis via LongCat
        # Hum text ko truncate kar rahe hain taaki token limit cross na ho (Safety)
        analysis = get_longcat_response(text_content[:15000]) 

        return {
            "filename": file.filename,
            "analysis": analysis
        }

    except Exception as e:
        return {"error": str(e)}