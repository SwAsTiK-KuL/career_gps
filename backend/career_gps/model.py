import os
from pathlib import Path
from dotenv import load_dotenv
from google import genai

load_dotenv(dotenv_path=Path(__file__).parent.parent / ".env")

class CareerPathModel:
    def __init__(self, model: str = "gemini-2.5-flash"):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("❌ GEMINI_API_KEY not found in .env file")
        try:
            self.client = genai.Client(api_key=api_key)
            print(f"✅ Connected to Gemini ({model}) — All set!")
        except Exception as e:
            raise ValueError(f"❌ Connection failed: {e}\n"
                             "Check your .env has GEMINI_API_KEY=your-key")
        self.model_name = model

    def generate(self, user_skills: list, job_description: str, designation: str = "") -> str:
        skills_str = ", ".join(user_skills) if user_skills else "None provided"
        designation_str = designation if designation else "Not specified"

        prompt = f"""You are an expert career coach for a professional in Mumbai, India.

CURRENT DESIGNATION: {designation_str}
CURRENT SKILLS: {skills_str}

TARGET JOB: {job_description}

Create a personalized **Career GPS Roadmap** in clean Markdown format:

# 🚀 Career GPS: From {designation_str} to Your Next Role

## 📊 Skill Match Assessment
(Estimate % match, list strengths and skill gaps)

## 🎯 Short-Term Goals (0–6 months)
(Quick wins, free courses, mini projects to build immediately)

## 🛤️ Medium-Term Goals (6–18 months)
(Hands-on experience, portfolio projects, certifications)

## 🌟 Long-Term Vision (18+ months)
(Senior roles, leadership, specialization paths)

## ⚠️ Potential Roadblocks & How to Overcome Them

## 📚 Top Resources
(Free & paid — prefer India-friendly: GeeksforGeeks, freeCodeCamp, Udemy, NPTEL, etc.)

Be motivating, realistic, and tailor advice to the Indian job market (Mumbai, Bengaluru startups, TCS, Infosys, Zomato, Flipkart, etc.)."""

        response = self.client.models.generate_content(
            model=self.model_name,
            contents=prompt
        )
        return response.text