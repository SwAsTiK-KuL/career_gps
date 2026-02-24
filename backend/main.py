from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from career_gps.model import CareerPathModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Career GPS API",
    description="AI Career Path Generator - Mumbai Edition",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class RoadmapRequest(BaseModel):
    skills: list[str]
    designation: str = ""          # ← NEW: user's current job title
    job_description: str
    model: str = "gemini-2.5-flash"

@app.post("/api/generate-roadmap")
async def generate_roadmap(request: RoadmapRequest):
    try:
        model = CareerPathModel(model=request.model)
        roadmap = model.generate(
            user_skills=request.skills,
            job_description=request.job_description,
            designation=request.designation     # ← passed to model
        )
        return {"success": True, "roadmap": roadmap}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
def health():
    return {"status": "ok", "message": "Career GPS Backend Running 🚀"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)