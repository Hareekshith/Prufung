import { Brain, BarChart3, Target, Activity } from "lucide-react";
import React, { useMemo } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";

interface AnalyticsPanelProps {
  totalQuestions: number;
  correctAnswers: number;
  averageScore: number;
  subjectStats: Record<string, { total: number; correct: number }>;
}

export const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({
  totalQuestions,
  correctAnswers,
  averageScore,
  subjectStats,
}) => {
  const accuracy = totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;

  const radarData = useMemo(
    () =>
      Object.entries(subjectStats).map(([subject, stats]) => ({
        subject,
        accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
      })),
    [subjectStats],
  );

  let adaptiveRecommendation = "Keep practicing at your current level.";
  if (accuracy > 85 && averageScore > 85) {
    adaptiveRecommendation = "Increase difficulty for a stronger challenge.";
  } else if (accuracy < 60 || averageScore < 60) {
    adaptiveRecommendation = "Focus on easier questions to solidify your foundations.";
  }

  return (
    <div className="h-full rounded-2xl bg-gradient-to-br from-violet-50 via-purple-50/50 to-fuchsia-50/50 dark:from-slate-900/90 dark:via-purple-950/30 dark:to-slate-900/90 border-2 border-purple-200/50 dark:border-slate-800 shadow-lg shadow-purple-200/30 dark:shadow-slate-900/40 p-4 sm:p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          <h2 className="text-sm font-semibold text-purple-900 dark:text-purple-100 tracking-wide uppercase">
            Performance Analytics
          </h2>
        </div>
        <Brain className="w-5 h-5 text-fuchsia-600 dark:text-fuchsia-400" />
      </div>

      <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/40 dark:to-cyan-950/40 border-2 border-blue-200 dark:border-blue-800/50 px-3 py-2.5 flex flex-col gap-1 shadow-sm">
          <span className="text-blue-700 dark:text-blue-400 flex items-center gap-1 font-semibold">
            <Activity className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            Total Questions
          </span>
          <span className="text-xl font-bold text-blue-900 dark:text-blue-50">{totalQuestions}</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 border-2 border-emerald-200 dark:border-emerald-800/50 px-3 py-2.5 flex flex-col gap-1 shadow-sm">
          <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
            <Target className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Correct
          </span>
          <span className="text-xl font-bold text-emerald-900 dark:text-emerald-50">{correctAnswers}</span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/40 dark:to-pink-950/40 border-2 border-purple-200 dark:border-purple-800/50 px-3 py-2.5 flex flex-col gap-1 shadow-sm">
          <span className="text-purple-700 dark:text-purple-400 flex items-center gap-1 font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Accuracy
          </span>
          <span className="text-xl font-bold text-purple-900 dark:text-purple-50">
            {accuracy.toFixed(0)}
            <span className="text-sm text-purple-600 dark:text-purple-400 ml-1">%</span>
          </span>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/40 dark:to-orange-950/40 border-2 border-amber-200 dark:border-amber-800/50 px-3 py-2.5 flex flex-col gap-1 shadow-sm">
          <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1 font-semibold">
            <BarChart3 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            Avg. Score
          </span>
          <span className="text-xl font-bold text-amber-900 dark:text-amber-50">
            {averageScore.toFixed(0)}
            <span className="text-sm text-amber-600 dark:text-amber-400 ml-1">/100</span>
          </span>
        </div>
      </div>

      <div className="mt-1 rounded-xl bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 dark:from-indigo-950/60 dark:via-purple-950/60 dark:to-pink-950/60 border-2 border-indigo-300/50 dark:border-purple-800/50 px-3 py-3 shadow-md">
        <div className="flex items-start gap-2">
          <Brain className="w-4 h-4 text-indigo-700 dark:text-indigo-300 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-indigo-900 dark:text-indigo-100 tracking-wide uppercase">
              Adaptive Difficulty
            </p>
            <p className="text-xs text-indigo-800 dark:text-indigo-300 mt-1 leading-relaxed font-medium">
              {adaptiveRecommendation}
            </p>
          </div>
        </div>
      </div>

      {/* Subject-wise accuracy radar chart */}
      <div className="mt-2 rounded-xl bg-gradient-to-br from-slate-900/5 via-purple-100/60 to-sky-100/60 dark:from-slate-950/80 dark:via-slate-900/80 dark:to-slate-950/80 border-2 border-slate-200/60 dark:border-slate-800 px-3 py-3 shadow-md">
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 tracking-wide uppercase mb-2 flex items-center gap-1">
          <BarChart3 className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          Subject Accuracy Radar
        </p>
        {radarData.every((d) => d.accuracy === 0) ? (
          <p className="text-[11px] text-slate-700 dark:text-slate-400">
            Answer a few questions in different subjects to see your subject-wise strengths visualized here.
          </p>
        ) : (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid strokeOpacity={0.4} />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <PolarRadiusAxis
                  angle={30}
                  domain={[0, 100]}
                  tick={{ fontSize: 9 }}
                  tickFormatter={(v) => `${v}%`}
                />
                <Radar
                  name="Accuracy"
                  dataKey="accuracy"
                  stroke="#6366f1"
                  fill="#6366f1"
                  fillOpacity={0.45}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};


