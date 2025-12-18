import { Brain, BarChart3, Target, Activity } from "lucide-react";
import React from "react";

interface AnalyticsPanelProps {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  totalQuestions,
  correctAnswers,
  averageScore,
}) => {
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  let adaptiveRecommendation = "Keep practicing at your current level.";
  if (accuracy > 85 && averageScore > 85) {
    adaptiveRecommendation = "Increase difficulty for a stronger challenge.";
  } else if (accuracy < 60 || averageScore < 60) {
    adaptiveRecommendation = "Focus on easier questions to solidify your foundations.";
  }

  return (
    <div className="h-full rounded-2xl bg-slate-900/70 border border-slate-800 shadow-lg shadow-slate-900/40 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-primary-400" />
          <h2 className="text-sm font-semibold text-slate-100 tracking-wide uppercase">
            Performance Analytics
          </h2>
        </div>
        <Brain className="w-5 h-5 text-accent-500" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2.5 flex flex-col gap-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-primary-400" />
            Total Questions
          </span>
          <span className="text-xl font-semibold text-slate-50">{totalQuestions}</span>
        </div>
        <div className="rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2.5 flex flex-col gap-1">
          <span className="text-slate-400 flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-accent-500" />
            Correct
          </span>
          <span className="text-xl font-semibold text-slate-50">{correctAnswers}</span>
        </div>
        <div className="rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2.5 flex flex-col gap-1">
          <span className="text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-primary-400" />
            Accuracy
          </span>
          <span className="text-xl font-semibold text-slate-50">
            {accuracy.toFixed(0)}
            <span className="text-sm text-slate-400 ml-1">%</span>
          </span>
        </div>
        <div className="rounded-xl bg-slate-950/40 border border-slate-800 px-3 py-2.5 flex flex-col gap-1">
          <span className="text-slate-400 flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-primary-400" />
            Avg. Score
          </span>
          <span className="text-xl font-semibold text-slate-50">
            {averageScore.toFixed(0)}
            <span className="text-sm text-slate-400 ml-1">/100</span>
          </span>
        </div>
      </div>

      <div className="mt-1 rounded-xl bg-gradient-to-br from-primary-500/15 via-slate-900/80 to-accent-500/10 border border-slate-700/80 px-3 py-3">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-primary-300 mt-0.5" />
          <div>
            <p className="text-xs font-semibold text-slate-100 tracking-wide uppercase">
              Adaptive Difficulty
            </p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              {adaptiveRecommendation}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


