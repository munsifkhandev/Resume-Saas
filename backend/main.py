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
    
    # --- PROMPT 1: ROAST MODE 🔥 (DESI & SAVAGE) ---
    if mode == "roast":
        prompt = f"""
        Act as a savage, ruthless Stand-up Comedian and a disappointed 'Desi' Brown Parent. 
        Your goal is to emotionally damage the candidate based on their resume.
        
        TONE INSTRUCTIONS:
        - Use a mix of English and Roman Urdu/Hindi (Hinglish).
        - Be brutal, sarcastic, and dark. No mercy.
        - Roast their layout, their vague skills (like 'Hardworking'), and their life choices.
        
        EXAMPLES OF STYLE:
        - "Bhai ne 'Microsoft Word' ko skill mein dala hai, wah bete mauj kardi."
        - "Ye resume hai ya kisi ki maut ka farman? Itna text kaun padhta hai?"
        - "4 years experience and still using Times New Roman? Sharam nahi aayi?"
        - "Project ke naam pe 'To-Do List' banayi hai? Google wale ghar aake marenge."

        RESUME TEXT: {text[:10000]}
        
        OUTPUT JSON ONLY:
        {{
            "roast_title": "A short, savage 1-liner title in Hinglish",
            "burns": [
                "Sarcastic comment 1 (Mix Urdu/English - focusing on Skills)",
                "Sarcastic comment 2 (Focusing on Projects/Experience)",
                "Sarcastic comment 3 (Personal attack on layout/formatting)",
                "Sarcastic comment 4 (General roast on their career choices)"
            ],
            "overall_verdict": "Final brutal closing statement in Hinglish"
        }}
        """

    # --- PROMPT 2: ATS BUILDER MODE 🛠️ (FAANG EXECUTIVE LEVEL) ---
    elif mode == "builder":
        prompt = f"""
        Act as a Top-Tier Executive Resume Writer for FAANG (Google, Amazon, Meta). 
        Your goal is to rewrite this resume to be 100% ATS Optimized and High-Impact.
        
        RULES FOR REWRITING:
        1. **Quantify Results:** Do not just say "Worked on API". Say "Engineered REST APIs handling 10k+ requests/day, reducing latency by 40%".
        2. **Strong Action Verbs:** Start every bullet with power words like 'Orchestrated', 'Spearheaded', 'Optimized', 'Architected'.
        3. **Remove Fluff:** Delete generic soft skills like "Hardworking" or "Team Player". Show it through projects instead.
        4. **Tailor to JD:** If Job Description is provided: {job_desc}, prioritize those keywords.
        
        RESUME TEXT: {text[:10000]}
        
        OUTPUT JSON ONLY (Strict Structure):
        {{
            "personal_info": {{ 
                "name": "Full Name", 
                "email": "Professional Email", 
                "phone": "Phone", 
                "linkedin": "LinkedIn URL", 
                "summary": "A powerful, 3-line executive summary focusing on years of exp, core stack, and major achievements." 
            }},
            "skills": ["List of only high-value technical skills (e.g., Docker, React, AWS, Python, Kubernetes)"],
            "experience": [ 
                {{ 
                    "role": "Job Title", 
                    "company": "Company Name", 
                    "duration": "Dates", 
                    "points": [
                        "Result-oriented bullet point 1 (using STAR method)",
                        "Result-oriented bullet point 2 (with numbers/metrics)",
                        "Result-oriented bullet point 3 (tech focused)"
                    ] 
                }} 
            ],
            "education": [ {{ "degree": "Degree", "university": "University", "year": "Year" }} ],
            "projects": [ 
                {{ 
                    "name": "Project Name", 
                    "tech_stack": "Tech Stack Used", 
                    "description": "One powerful sentence describing the problem solved and the tech impact." 
                }} 
            ]
        }}
        """

    # --- PROMPT 3: ANALYZER MODE 📊 (STRICT FAANG RECRUITER) ---
    else:
        prompt = f"""
        Act as a Strict Senior Technical Recruiter at a top tech company (like Google or Netflix). 
        Analyze this resume against the Job Description with extreme scrutiny.
        
        RESUME: {text[:10000]}
        TARGET JD: {job_desc if job_desc else "General Software Industry Standards"}
        
        GOAL:
        - Identify exact keyword gaps.
        - Criticize the depth of projects (e.g., "Too simple", "Lack of complexity").
        - Check if the candidate is actually qualified or just using buzzwords.
        
        OUTPUT JSON ONLY:
        {{
            "ats_score": 0-100 (Be strict. 100 is impossible. 70 is good. If bad, give 30-40),
            "missing_skills": ["Critical skill 1 from JD", "Critical skill 2 from JD"],
            "summary": "A professional but critical assessment of why they fit or don't fit.",
            "improvement_tips": [
                "Specific actionable advice (e.g., 'Add Docker to Project X')",
                "Advice on formatting or quantification",
                "Advice on keyword placement"
            ]
        }}
        """

    try:
        response = client.chat.completions.create(
            model="LongCat-Flash-Chat", 
            messages=[
                {"role": "system", "content": "You are a JSON-generating expert. You output ONLY valid JSON. No markdown, no explanations."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.8 if mode == "roast" else 0.4, # Roast mein zyada creativity chahiye
            max_tokens=2500
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