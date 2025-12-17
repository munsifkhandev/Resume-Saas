# 🚀 Resume AI Supertool (SaaS)

![Next.js](https://img.shields.io/badge/Next.js-14-black)
![Python](https://img.shields.io/badge/Python-FastAPI-blue)
![OpenAI](https://img.shields.io/badge/AI-Powered-green)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-orange)

An intelligent, full-stack AI Resume Coach that goes beyond generic feedback. It analyzes resumes against Job Descriptions, rewrites them for ATS systems, and features a viral **"Roast Mode"** that critiques resumes with a savage sense of humor.

🔗 **Live Demo:** [https://resume-saas-ten.vercel.app/](https://resume-saas-ten.vercel.app/)

---

## 📸 Screenshots

|          **Dashboard (Analyzer)**          |        **The Viral Roast Mode 🔥**        |
| :----------------------------------------: | :---------------------------------------: |
| ![Analyzer UI](PLACE_YOUR_IMAGE_LINK_HERE) | ![Roast Mode](PLACE_YOUR_IMAGE_LINK_HERE) |
|       _Clean metrics & gap analysis_       |       _Brutal feedback in Hinglish_       |

---

## ✨ Key Features

### 1. 📊 Smart ATS Analyzer

- Compares the Resume against a specific **Job Description (JD)**.
- Calculates a match score (0-100%) based on industry keywords.
- Identifies **Missing Skills** and provides actionable improvement tips.

### 2. 🔥 Savage Roast Mode (Viral Feature)

- Uses a custom-engineered prompt to act as a **"Disappointed Desi Parent/Comedian"**.
- Roasts layout, buzzwords, and career choices in **Hinglish (Hindi + English)**.
- Designed for social media shareability.

### 3. 🛠️ FAANG-Level Resume Builder

- Rewrites vague bullet points into **impactful, metric-driven statements** (Google X-Y-Z formula).
- Generates a clean, single-column **ATS-Friendly Architecture**.
- Tailors content specifically to the target JD.

---

## 🏗️ Tech Stack

This project is built using a modern Full-Stack architecture:

| Component           | Technology                  | Description                               |
| :------------------ | :-------------------------- | :---------------------------------------- |
| **Frontend**        | **Next.js 14** (App Router) | React framework for SEO and performance.  |
| **Styling**         | **Tailwind CSS**            | Responsive and modern UI components.      |
| **Backend**         | **Python (FastAPI)**        | High-performance async API server.        |
| **AI Engine**       | **OpenAI / LongCat API**    | LLM processing for analysis & generation. |
| **File Processing** | **PyPDF2**                  | Extracts text from PDF documents.         |
| **Deployment**      | **Vercel & Render**         | CI/CD pipeline for live production.       |

---

## 🚀 How to Run Locally

Follow these steps to set up the project on your local machine.

### Prerequisites

- Node.js (v18+)
- Python (v3.10+)

### 1. Clone the Repository

```bash
git clone [https://github.com/YOUR_USERNAME/resume-ai-saas.git](https://github.com/YOUR_USERNAME/resume-ai-saas.git)
cd resume-ai-saas
2. Backend Setup
Navigate to the backend folder and install dependencies:

Bash

cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
Create a .env file in the backend folder:

Code snippet

LONGCAT_API_KEY=your_api_key_here
Start the Server:

Bash

uvicorn main:app --reload
# Backend will run on [http://127.0.0.1:8000](http://127.0.0.1:8000)
3. Frontend Setup
Open a new terminal, navigate to the frontend folder:

Bash

cd ../frontend
npm install
Create a .env.local file in the frontend folder:

Code snippet

NEXT_PUBLIC_API_URL=[http://127.0.0.1:8000](http://127.0.0.1:8000)
Start the Frontend:

Bash

npm run dev
# Frontend will run on http://localhost:3000
📡 API Endpoints
The Backend exposes a single robust endpoint that handles multi-modal processing:

POST /process

Payload:

file: PDF File

job_description: String (Optional)

mode: String (analyze | roast | builder)

Response: Returns a strict JSON object structured based on the selected mode.

🤝 Contributing
Contributions are welcome!

Fork the Project

Create your Feature Branch (git checkout -b feature/AmazingFeature)

Commit your Changes (git commit -m 'Add some AmazingFeature')

Push to the Branch (git push origin feature/AmazingFeature)

Open a Pull Request

👨‍💻 Author
Munsif Khan

LinkedIn: [Your LinkedIn Profile Link]

GitHub: [Your GitHub Profile Link]

Built with ❤️ using Next.js & Python.
```
