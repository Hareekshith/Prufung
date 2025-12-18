from __future__ import annotations

from typing import List, Literal

from pydantic import BaseModel, Field, conint, constr


Difficulty = Literal["easy", "medium", "hard"]
QuestionType = Literal["multiple-choice", "short-answer"]


class QuestionRequest(BaseModel):
    subject: constr(strip_whitespace=True, min_length=1)
    difficulty: Difficulty


class QuestionResponse(BaseModel):
    question: constr(strip_whitespace=True, min_length=1)
    type: QuestionType
    options: List[constr(strip_whitespace=True)] = Field(default_factory=list)
    correctAnswer: constr(strip_whitespace=True, min_length=1)
    explanation: constr(strip_whitespace=True, min_length=1)
    difficulty: Difficulty


class EvaluationRequest(BaseModel):
    question: constr(strip_whitespace=True, min_length=1)
    correctAnswer: constr(strip_whitespace=True, min_length=1)
    studentAnswer: constr(strip_whitespace=True, min_length=1)


class EvaluationResponse(BaseModel):
    isCorrect: bool
    score: conint(ge=0, le=100)
    feedback: constr(strip_whitespace=True, min_length=1)
    strengths: List[constr(strip_whitespace=True)] = Field(default_factory=list)
    improvements: List[constr(strip_whitespace=True)] = Field(default_factory=list)


