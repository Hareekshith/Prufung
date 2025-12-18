from __future__ import annotations

import json
import os
import random
from typing import Any, Dict, List

from dotenv import load_dotenv

from models import (
    EvaluationRequest,
    EvaluationResponse,
    QuestionRequest,
    QuestionResponse,
)


load_dotenv()


class AIServiceError(Exception):
    """Custom exception for AI service related issues."""


class AIService:
    """
    Abstraction around the underlying AI provider.

    For hackathon/demo purposes this implementation:
    - Uses a simple deterministic generator when no external API key is set.
    - Provides a hook where you can integrate a real LLM.
    - Ensures that any AI responses are valid JSON and conform to our schemas.
    """

    def __init__(self) -> None:
        # Placeholder for real API configuration (e.g. OpenAI)
        self.api_key = os.getenv("AI_API_KEY")

    # ----------------------
    # Public API
    # ----------------------
    def generate_question(self, payload: QuestionRequest) -> QuestionResponse:
        """
        Generate a question using either:
        - Real AI provider (if configured), or
        - Fallback deterministic logic.
        """
        if self.api_key:
            raw = self._call_real_ai_for_question(payload)
        else:
            raw = self._fallback_generate_question(payload)

        data = self._parse_and_validate_json(raw, "QuestionResponse")
        return QuestionResponse(**data)

    def evaluate_answer(self, payload: EvaluationRequest) -> EvaluationResponse:
        """
        Evaluate an answer using either:
        - Real AI provider (if configured), or
        - Fallback deterministic logic.
        """
        if self.api_key:
            raw = self._call_real_ai_for_evaluation(payload)
        else:
            raw = self._fallback_evaluate_answer(payload)

        data = self._parse_and_validate_json(raw, "EvaluationResponse")
        return EvaluationResponse(**data)

    # ----------------------
    # JSON Handling
    # ----------------------
    @staticmethod
    def _parse_and_validate_json(raw: str | Dict[str, Any], kind: str) -> Dict[str, Any]:
        """
        Ensure the AI returns ONLY valid JSON, no markdown, no extra text.

        - If `raw` is already a dict, it is returned after a shallow check.
        - If `raw` is a string, we attempt to parse it as JSON.
        - If parsing fails or structure is clearly wrong, raise AIServiceError.
        """
        if isinstance(raw, dict):
            return raw

        text = raw.strip()

        # Guard against markdown or surrounding text
        if text.startswith("```"):
            # Common pattern: ```json { ... } ```
            text = text.strip("`")
            # remove optional leading `json`
            if text.startswith("json"):
                text = text[4:]
            text = text.strip()

        try:
            data = json.loads(text)
        except json.JSONDecodeError as exc:
            raise AIServiceError(f"AI returned malformed JSON for {kind}: {exc}") from exc

        if not isinstance(data, dict):
            raise AIServiceError(f"AI returned non-object JSON for {kind}")

        return data

    # ----------------------
    # Real AI hooks (stubbed)
    # ----------------------
    def _call_real_ai_for_question(self, payload: QuestionRequest) -> str:
        """
        Hook to call a real AI provider.

        You can implement this with your preferred LLM SDK.
        The model **must** be instructed to output ONLY a single JSON object
        matching the QuestionResponse schema, with no markdown or extra text.
        """
        # NOTE: Deliberately left as a stub to keep this template provider-agnostic.
        # You can integrate OpenAI / Anthropic / etc. here.
        return json.dumps(self._fallback_generate_question(payload))

    def _call_real_ai_for_evaluation(self, payload: EvaluationRequest) -> str:
        """
        Hook to call a real AI provider for evaluation.
        """
        return json.dumps(self._fallback_evaluate_answer(payload))

    # ----------------------
    # Fallback deterministic behavior
    # ----------------------
    @staticmethod
    def _fallback_generate_question(payload: QuestionRequest) -> Dict[str, Any]:
        """
        Simple rule-based generator used when no external AI key is configured.
        Randomly selects from a small pool so that subsequent questions differ.
        """
        subject = payload.subject.lower()
        difficulty = payload.difficulty

        questions: List[Dict[str, Any]] = []

        if subject in {"math", "mathematics"}:
            if difficulty == "easy":
                questions = [
                    {
                        "question": "What is 7 + 5?",
                        "type": "multiple-choice",
                        "options": ["10", "11", "12", "13"],
                        "correctAnswer": "12",
                        "explanation": "Add 7 and 5 to get 12.",
                        "difficulty": difficulty,
                    },
                    {
                        "question": "What is 9 - 4?",
                        "type": "multiple-choice",
                        "options": ["3", "4", "5", "6"],
                        "correctAnswer": "5",
                        "explanation": "Subtract 4 from 9 to get 5.",
                        "difficulty": difficulty,
                    },
                ]
            elif difficulty == "medium":
                questions = [
                    {
                        "question": "Solve for x: 3x - 5 = 16",
                        "type": "short-answer",
                        "options": [],
                        "correctAnswer": "7",
                        "explanation": "Add 5 to both sides (3x = 21) then divide by 3 (x = 7).",
                        "difficulty": difficulty,
                    },
                    {
                        "question": "Solve for x: 5x + 2 = 27",
                        "type": "short-answer",
                        "options": [],
                        "correctAnswer": "5",
                        "explanation": "Subtract 2 (5x = 25) then divide by 5 (x = 5).",
                        "difficulty": difficulty,
                    },
                ]
            else:
                questions = [
                    {
                        "question": "What is the derivative of f(x) = 3x^3 - 4x^2 + 7?",
                        "type": "short-answer",
                        "options": [],
                        "correctAnswer": "9x^2 - 8x",
                        "explanation": "Use the power rule term by term.",
                        "difficulty": difficulty,
                    },
                    {
                        "question": "Evaluate the limit: lim (x→0) (sin x) / x",
                        "type": "short-answer",
                        "options": [],
                        "correctAnswer": "1",
                        "explanation": "This is a standard trigonometric limit equal to 1.",
                        "difficulty": difficulty,
                    },
                ]
        else:
            # Generic pool for non-math subjects
            questions = [
                {
                    "question": f"In {payload.subject.title()}, which option best matches the definition of 'hypothesis'?",
                    "type": "multiple-choice",
                    "options": [
                        "A proven fact that cannot be changed",
                        "An educated guess that can be tested",
                        "A random assumption without evidence",
                        "A collection of unrelated observations",
                    ],
                    "correctAnswer": "An educated guess that can be tested",
                    "explanation": "A hypothesis is a testable, educated guess that explains an observation or predicts an outcome.",
                    "difficulty": difficulty,
                },
                {
                    "question": f"In {payload.subject.title()}, what is the main goal of revision before an exam?",
                    "type": "multiple-choice",
                    "options": [
                        "Memorize every word from the textbook",
                        "Identify and strengthen weak areas",
                        "Avoid practicing past questions",
                        "Only focus on new topics",
                    ],
                    "correctAnswer": "Identify and strengthen weak areas",
                    "explanation": "Effective revision focuses on consolidating knowledge and improving on weaker topics.",
                    "difficulty": difficulty,
                },
            ]

        return random.choice(questions)

    @staticmethod
    def _fallback_evaluate_answer(payload: EvaluationRequest) -> Dict[str, Any]:
        """
        Simple evaluation based on string comparison with partial credit.
        """
        correct = payload.correctAnswer.strip().lower()
        student = payload.studentAnswer.strip().lower()

        is_correct = correct == student

        if is_correct:
            score = 100
            feedback = "Excellent! Your answer is correct."
            strengths = [
                "Strong recall of key facts",
                "Good attention to detail",
            ]
            improvements = ["Continue practicing to maintain your performance."]
        else:
            # naive partial scoring heuristic
            overlap = len(set(correct.split()) & set(student.split()))
            total = max(len(correct.split()), 1)
            ratio = overlap / total
            score = int(40 + 50 * ratio)
            score = max(0, min(score, 90))

            feedback = "Not quite. Review the correct answer and explanation to strengthen your understanding."
            strengths = []
            if overlap > 0:
                strengths.append("You captured some relevant keywords.")
            else:
                strengths.append("You attempted the question, which is the first step to improvement.")

            improvements = [
                "Compare your answer with the correct one and note the differences.",
                "Focus on the key concepts highlighted in the explanation.",
            ]

        return {
            "isCorrect": is_correct,
            "score": score,
            "feedback": feedback,
            "strengths": strengths,
            "improvements": improvements,
        }


