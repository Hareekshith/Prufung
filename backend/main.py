from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from ai_service import AIService, AIServiceError
from models import QuestionRequest, EvaluationRequest

app = FastAPI(title="DSARG_8 AI Exam Assistant")

# ENABLE CORS: Essential so your React App (App.tsx) can talk to this Backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In a hackathon, allow all; in production, restrict this
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()

@app.post("/generate-question")
async def generate_q(request: QuestionRequest):
    """
    Fulfills Prototype Objective: Generate practice questions.
    Uses Gemini-based generation.
    """
    try:
        return ai_service.generate_question(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/evaluate-answer")
async def evaluate_a(payload: dict = Body(...)):
    """
    Fulfills Prototype Objective: Evaluate student responses.
    Maps React key 'question' to Backend 'questionText' to prevent 422 errors.
    """
    try:
        # Manual mapping ensures compatibility with App.tsx
        request_data = EvaluationRequest(
            questionText=payload.get("question"),
            correctAnswer=payload.get("correctAnswer"),
            studentAnswer=payload.get("studentAnswer")
        )
        return ai_service.evaluate_answer(request_data)
    except Exception as e:
        print(f"Evaluation failed: {e}")
        # Return 422 if data is missing, 500 if AI fails
        raise HTTPException(status_code=422, detail="Missing fields or AI error")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
