import React, { useMemo, useState } from "react";
import axios from "axios";
import { BookOpen, Brain, Sparkles, BarChart3, ChevronRight, Loader2 } from "lucide-react";
import { AnalyticsPanel } from "./components/AnalyticsPanel";
import {
  Difficulty,
  EvaluationResponse,
  QuestionResponse,
} from "./types/api";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ?? "http://localhost:8000";

type AnswerMode = "idle" | "submitting" | "evaluated";

const difficultyLabels: Record<Difficulty, string> = {
  easy: "Easy",
  medium: "Medium",
  hard: "Hard",
};

const subjects = ["Mathematics", "Physics", "Biology", "Chemistry", "History", "Computer Science"];

const App: React.FC = () => {
  const [subject, setSubject] = useState<string>("Mathematics");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [currentQuestion, setCurrentQuestion] = useState<QuestionResponse | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [textAnswer, setTextAnswer] = useState<string>("");
  const [answerMode, setAnswerMode] = useState<AnswerMode>("idle");
  const [evaluation, setEvaluation] = useState<EvaluationResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [showAnalytics, setShowAnalytics] = useState<boolean>(true);

  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [correctAnswers, setCorrectAnswers] = useState<number>(0);
  const [cumulativeScore, setCumulativeScore] = useState<number>(0);

  const averageScore = useMemo(
    () => (totalQuestions > 0 ? cumulativeScore / totalQuestions : 0),
    [cumulativeScore, totalQuestions],
  );

  const handleGenerateQuestion = async () => {
    setIsGenerating(true);
    setError(null);
    setEvaluation(null);
    setSelectedOption(null);
    setTextAnswer("");
    setAnswerMode("idle");

    try {
      const response = await axios.post<QuestionResponse>(`${API_BASE_URL}/generate-question`, {
        subject,
        difficulty,
      });
      setCurrentQuestion(response.data);
    } catch (err) {
      console.error(err);
      setError("Unable to generate a question right now. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSubmitAnswer = async () => {
    if (!currentQuestion) return;

    const studentAnswer =
      currentQuestion.type === "multiple-choice"
        ? selectedOption ?? ""
        : textAnswer.trim();

    if (!studentAnswer) {
      setError("Please provide an answer before submitting.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setAnswerMode("submitting");

    try {
      const response = await axios.post<EvaluationResponse>(`${API_BASE_URL}/evaluate-answer`, {
        question: currentQuestion.question,
        correctAnswer: currentQuestion.correctAnswer,
        studentAnswer,
      });

      setEvaluation(response.data);
      setAnswerMode("evaluated");

      const newTotal = totalQuestions + 1;
      const newCorrect = response.data.isCorrect ? correctAnswers + 1 : correctAnswers;
      const newCumulative = cumulativeScore + response.data.score;

      setTotalQuestions(newTotal);
      setCorrectAnswers(newCorrect);
      setCumulativeScore(newCumulative);
    } catch (err) {
      console.error(err);
      setError("Unable to evaluate your answer right now. Please try again.");
      setAnswerMode("idle");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setCurrentQuestion(null);
    setSelectedOption(null);
    setTextAnswer("");
    setEvaluation(null);
    setAnswerMode("idle");
    setError(null);
    void handleGenerateQuestion();
  };

  const isMCQ = currentQuestion?.type === "multiple-choice";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Header */}
        <header className="mb-6 sm:mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center shadow-lg shadow-primary-500/40">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-50">
                AI Exam Prep Assistant
              </h1>
              <p className="text-sm sm:text-base text-slate-300">
                Generate smart questions, practice actively, and get instant feedback powered by AI.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 border border-slate-700 px-3 py-1">
              <Sparkles className="w-3 h-3 text-primary-400" />
              Adaptive learning insights
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-900/70 border border-slate-700 px-3 py-1">
              <BookOpen className="w-3 h-3 text-accent-400" />
              Multiple subjects & difficulties
            </span>
          </div>
        </header>

        <main className="grid lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] gap-5">
          {/* Left: controls + question */}
          <section className="flex flex-col gap-4">
            {/* Control panel */}
            <div className="rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg shadow-slate-900/40 p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Session Controls
                  </p>
                  <p className="text-sm text-slate-300">
                    Choose your subject and difficulty, then generate tailored questions.
                  </p>
                </div>
                <BarChart3
                  className="w-5 h-5 text-slate-400 cursor-pointer hover:text-primary-300 transition"
                  onClick={() => setShowAnalytics((prev) => !prev)}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {/* Subject */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Subject
                  </label>
                  <div className="relative">
                    <select
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-3 py-2.5 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-400 transition"
                    >
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    <ChevronRight className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                {/* Difficulty */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                    Difficulty
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as Difficulty[]).map((level) => {
                      const isActive = difficulty === level;
                      return (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={[
                            "text-xs font-medium rounded-xl px-2.5 py-2 border transition flex items-center justify-center",
                            isActive
                              ? "bg-primary-600 text-white border-primary-400 shadow-md shadow-primary-500/40"
                              : "bg-slate-950/60 text-slate-300 border-slate-700 hover:border-primary-500/60 hover:text-primary-100",
                          ].join(" ")}
                        >
                          {difficultyLabels[level]}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <p className="text-xs text-slate-400">
                  Questions are generated dynamically based on your selected subject and difficulty.
                </p>
                <button
                  type="button"
                  onClick={handleGenerateQuestion}
                  disabled={isGenerating}
                  className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-sm font-semibold px-4 py-2.5 text-white shadow-lg shadow-primary-500/40 hover:from-primary-400 hover:to-primary-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate Question
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Question & answer panel */}
            <div className="rounded-2xl bg-slate-950/70 border border-slate-800 shadow-xl shadow-slate-950/40 p-4 sm:p-5 flex flex-col gap-4">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                    Active Question
                  </p>
                  <p className="text-sm text-slate-300">
                    Answer the question, then submit to see how you performed.
                  </p>
                </div>
                <span className="text-[11px] rounded-full border border-slate-700/80 px-2 py-1 text-slate-300 bg-slate-900/70">
                  {currentQuestion ? (
                    <>
                      {currentQuestion.type === "multiple-choice" ? "Multiple Choice" : "Short Answer"} •{" "}
                      <span className="capitalize">{currentQuestion.difficulty}</span>
                    </>
                  ) : (
                    "No question generated"
                  )}
                </span>
              </div>

              {error && (
                <div className="rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-2 text-xs text-red-200">
                  {error}
                </div>
              )}

              {!currentQuestion ? (
                <div className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-900/40 p-4 flex flex-col items-center justify-center text-center gap-3">
                  <BookOpen className="w-9 h-9 text-slate-500" />
                  <p className="text-sm font-medium text-slate-200">
                    Ready to start practicing?
                  </p>
                  <p className="text-xs text-slate-400 max-w-md">
                    Select a subject and difficulty, then click{" "}
                    <span className="font-semibold text-primary-300">Generate Question</span> to begin your
                    personalized exam prep session.
                  </p>
                </div>
              ) : (
                <>
                  {/* Question */}
                  <div className="rounded-2xl bg-slate-900/70 border border-slate-800 p-4 flex flex-col gap-2">
                    <p className="text-xs font-semibold text-primary-300 uppercase tracking-wide">
                      Question
                    </p>
                    <p className="text-sm sm:text-base text-slate-50 leading-relaxed">
                      {currentQuestion.question}
                    </p>
                  </div>

                  {/* Answer */}
                  <div className="flex flex-col gap-3">
                    <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                      Your Answer
                    </p>
                    {isMCQ ? (
                      <div className="grid sm:grid-cols-2 gap-2">
                        {currentQuestion.options.map((opt) => {
                          const isSelected = selectedOption === opt;
                          const isCorrectSelected =
                            answerMode === "evaluated" &&
                            isSelected &&
                            opt === currentQuestion.correctAnswer;
                          const isIncorrectSelected =
                            answerMode === "evaluated" &&
                            isSelected &&
                            opt !== currentQuestion.correctAnswer;

                          return (
                            <button
                              key={opt}
                              type="button"
                              onClick={() => setSelectedOption(opt)}
                              className={[
                                "w-full text-left rounded-xl border px-3 py-2.5 text-sm transition",
                                isCorrectSelected
                                  ? "border-emerald-400 bg-emerald-950/50 text-emerald-100"
                                  : isIncorrectSelected
                                  ? "border-red-400 bg-red-950/40 text-red-100"
                                  : isSelected
                                  ? "border-primary-400 bg-primary-950/40 text-primary-100 shadow-md shadow-primary-500/30"
                                  : "border-slate-700 bg-slate-950/40 text-slate-100 hover:border-primary-400/80 hover:bg-slate-900/80",
                              ].join(" ")}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <textarea
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        rows={4}
                        className="w-full rounded-xl bg-slate-950/70 border border-slate-700/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/70 focus:border-primary-400 transition resize-none"
                        placeholder="Explain your answer clearly and concisely..."
                      />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleSubmitAnswer}
                      disabled={isSubmitting || !currentQuestion}
                      className="inline-flex items-center justify-center rounded-xl bg-accent-600 text-sm font-semibold px-4 py-2.5 text-white shadow-lg shadow-emerald-500/40 hover:bg-accent-500 transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Evaluating...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Submit Answer
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={isGenerating || !currentQuestion}
                      className="inline-flex items-center justify-center rounded-xl border border-slate-700 bg-slate-900/70 text-sm font-medium px-4 py-2.5 text-slate-100 hover:border-primary-400/80 hover:text-primary-100 hover:bg-slate-900 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next Question
                    </button>
                  </div>

                  {/* Evaluation */}
                  {evaluation && (
                    <div className="mt-1 grid md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] gap-3">
                      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 sm:p-4 flex flex-col gap-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                            Evaluation
                          </p>
                          <span
                            className={[
                              "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold border",
                              evaluation.isCorrect
                                ? "bg-emerald-950/60 border-emerald-500/70 text-emerald-100"
                                : "bg-red-950/60 border-red-500/70 text-red-100",
                            ].join(" ")}
                          >
                            {evaluation.isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        </div>
                        <p className="text-sm text-slate-200">{evaluation.feedback}</p>
                        <p className="text-xs text-slate-400">
                          Score:{" "}
                          <span className="font-semibold text-primary-300">
                            {evaluation.score}/100
                          </span>
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-900/80 border border-slate-800 p-3 sm:p-4 flex flex-col gap-2">
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          Insights
                        </p>
                        {evaluation.strengths.length > 0 && (
                          <div className="text-xs text-slate-200">
                            <p className="font-semibold text-emerald-300 mb-1">Strengths</p>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {evaluation.strengths.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        {evaluation.improvements.length > 0 && (
                          <div className="text-xs text-slate-200">
                            <p className="font-semibold text-amber-300 mb-1">Focus Areas</p>
                            <ul className="list-disc list-inside space-y-0.5 text-slate-300">
                              {evaluation.improvements.map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>

                      <div className="md:col-span-2 rounded-2xl bg-slate-950/80 border border-slate-800 p-3 sm:p-4 flex flex-col gap-1.5">
                        <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">
                          Correct Answer & Explanation
                        </p>
                        <p className="text-xs text-slate-200">
                          <span className="font-semibold text-emerald-300">Correct Answer:</span>{" "}
                          {currentQuestion.correctAnswer}
                        </p>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          <span className="font-semibold text-primary-300">Explanation:</span>{" "}
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>

          {/* Right: analytics */}
          <aside className="lg:block">
            {showAnalytics && (
              <AnalyticsPanel
                totalQuestions={totalQuestions}
                correctAnswers={correctAnswers}
                averageScore={averageScore}
              />
            )}
          </aside>
        </main>
      </div>
    </div>
  );
};

export default App;


