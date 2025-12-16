import os
import json
import io
from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

# Client Setup
client = OpenAI(
    api_key=os.getenv("LONGCAT_API_KEY"), 
    base_url="https://api.longcat.chat/openai/v1" 
)

app = FastAPI(title="Resume AI Supertool")

# CORS Setup (Frontend Connection)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_ai_response(text, mode, job_desc=None):
    
    # --- PROMPT 1: ROAST MODE 🔥 ---
    if mode == "roast":
        prompt = f"""
        Act as a ruthless Stand-up Comedian. ROAST this resume! 
        Be sarcastic, funny, and brutal about the layout, buzzwords, and vague skills.
        RESUME: {text[:10000]}
        
        OUTPUT JSON ONLY:
        {{
            "roast_title": "A funny 1-liner title",
            "burns": ["Sarcastic comment 1", "Sarcastic comment 2", "Sarcastic comment 3"],
            "overall_verdict": "Funny closing statement"
        }}
        """

    # --- PROMPT 2: ATS BUILDER MODE 🛠️ ---
    elif mode == "builder":
        prompt = f"""
        Act as a Professional Resume Writer. Extract data from the resume and REWRITE it for ATS.
        If Job Description is provided: {job_desc}, tailor the content to it.
        
        RESUME: {text[:10000]}
        
        OUTPUT JSON ONLY:
        {{
            "personal_info": {{ "name": "Name", "email": "Email", "phone": "Phone", "linkedin": "LinkedIn", "summary": "Professional Summary" }},
            "skills": ["Skill1", "Skill2", "Skill3", "Skill4"],
            "experience": [ {{ "role": "Job Title", "company": "Company", "duration": "Dates", "points": ["Action verb bullet point 1", "Action verb bullet point 2"] }} ],
            "education": [ {{ "degree": "Degree", "university": "Uni", "year": "Year" }} ],
            "projects": [ {{ "name": "Project Name", "tech_stack": "Tech used", "description": "Short description" }} ]
        }}
        """

    # --- PROMPT 3: ANALYZER MODE 📊 (Default) ---
    else:
        prompt = f"""
        Act as an ATS Scanner. Compare Resume vs Job Description.
        RESUME: {text[:10000]}
        JD: {job_desc if job_desc else "General Industry Standards"}
        
        OUTPUT JSON ONLY:
        {{
            "ats_score": 0-100,
            "missing_skills": ["Skill1", "Skill2"],
            "summary": "Professional Feedback",
            "improvement_tips": ["Tip1", "Tip2"]
        }}
        """

    try:
        response = client.chat.completions.create(
            model="LongCat-Flash-Chat", 
            messages=[
                {"role": "system", "content": "You are a helpful assistant that outputs strictly valid JSON. No markdown."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8 if mode == "roast" else 0.5,
            max_tokens=2000
        )
        
        # Clean Output
        clean_text = response.choices[0].message.content.replace("```json", "").replace("```", "").strip()
        return json.loads(clean_text)
        
    except Exception as e:
        print(f"AI Error: {e}")
        return {"error": str(e)}

@app.post("/process")
async def process_resume(
    file: UploadFile = File(...), 
    job_description: str = Form(""),
    mode: str = Form("analyze") 
):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF allowed")
    
    try:
        content = await file.read()
        reader = PyPDF2.PdfReader(io.BytesIO(content))
        text = "".join([page.extract_text() for page in reader.pages]) or ""
        
        # AI Logic Call
        result = get_ai_response(text, mode, job_description)
        return {"mode": mode, "data": result}
        
    except Exception as e:
        return {"error": str(e)}