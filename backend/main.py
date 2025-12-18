from __future__ import annotations

from typing import Any, Dict

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from ai_service import AIService, AIServiceError
from models import (
    EvaluationRequest,
    EvaluationResponse,
    QuestionRequest,
    QuestionResponse,
)


app = FastAPI(title="AI Exam Preparation Assistant API")

# Configure CORS for development; adjust in production as needed.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, set to specific frontend origin.
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()


@app.post("/generate-question", response_model=QuestionResponse)
async def generate_question(request: QuestionRequest) -> QuestionResponse:
    try:
        question = ai_service.generate_question(request)
        return question
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - safety net
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@app.post("/evaluate-answer", response_model=EvaluationResponse)
async def evaluate_answer(request: EvaluationRequest) -> EvaluationResponse:
    try:
        evaluation = ai_service.evaluate_answer(request)
        return evaluation
    except AIServiceError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    except Exception as exc:  # pragma: no cover - safety net
        raise HTTPException(status_code=500, detail="Internal server error") from exc


@app.get("/health", response_model=Dict[str, Any])
async def health_check() -> Dict[str, Any]:
    return {"status": "ok"}


