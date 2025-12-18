export type Difficulty = "easy" | "medium" | "hard";

export type QuestionType = "multiple-choice" | "short-answer";

export interface QuestionRequest {
  subject: string;
  difficulty: Difficulty;
}

export interface QuestionResponse {
  question: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  explanation: string;
  difficulty: Difficulty;
}

export interface EvaluationRequest {
  question: string;
  correctAnswer: string;
  studentAnswer: string;
}

export interface EvaluationResponse {
  isCorrect: boolean;
  score: number;
  feedback: string;
  strengths: string[];
  improvements: string[];
}


