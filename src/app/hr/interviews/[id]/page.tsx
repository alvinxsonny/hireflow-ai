"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Sparkles,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock,
  ExternalLink,
  Star,
  User,
  ThumbsUp,
  ThumbsDown,
  AlertCircle,
  Send,
} from "lucide-react";

export default function HrInterviewRoomPage() {
  const params = useParams();
  const router = useRouter();
  const interviewId = params.id as string;

  const [interview, setInterview] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Scorecard state
  const [technicalRating, setTechnicalRating] = useState(4);
  const [problemSolvingRating, setProblemSolvingRating] = useState(4);
  const [communicationRating, setCommunicationRating] = useState(5);
  const [culturalFitRating, setCulturalFitRating] = useState(4);
  const [recommendation, setRecommendation] = useState<"STRONG_HIRE" | "HIRE" | "HOLD" | "REJECT">("HIRE");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/interviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.interviews) {
          const found = data.interviews.find((i: any) => i.id === interviewId);
          if (found) {
            setInterview(found);
            if (found.scorecard) {
              setTechnicalRating(found.scorecard.technicalRating);
              setProblemSolvingRating(found.scorecard.problemSolvingRating);
              setCommunicationRating(found.scorecard.communicationRating);
              setCulturalFitRating(found.scorecard.culturalFitRating);
              setRecommendation(found.scorecard.recommendation);
              setNotes(found.scorecard.notes);
              setSubmitSuccess(true);
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [interviewId]);

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/interviews/${interviewId}/scorecard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          technicalRating,
          problemSolvingRating,
          communicationRating,
          culturalFitRating,
          recommendation,
          notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setInterview(data.interview);
      }
    } catch (e) {
      console.error("Failed to submit scorecard", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (value: number, onChange: (val: number) => void) => {
    return (
      <div className="flex items-center gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className={`p-1 rounded-lg transition ${
              star <= value ? "text-amber-400 hover:text-amber-500" : "text-slate-300 hover:text-slate-400"
            }`}
          >
            <Star className={`w-5 h-5 ${star <= value ? "fill-amber-400" : ""}`} />
          </button>
        ))}
        <span className="text-xs font-bold text-slate-700 ml-2">{value}/5</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400">
        Loading interview workspace...
      </div>
    );
  }

  if (!interview) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Interview Session Not Found</h2>
        <Link href="/hr/interviews" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          &larr; Back to Interviews
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/hr/interviews"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Interview Schedule</span>
      </Link>

      {/* Header Info */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Interview Co-Pilot Active</span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Interview: {interview.candidateName}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Target Role: <strong>{interview.jobTitle}</strong> • Interviewer: {interview.interviewerName}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {interview.meetingLink && (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noreferrer"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <Video className="w-4 h-4" />
              <span>Join Video Meeting</span>
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: AI Question Prompts */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <h2 className="text-base font-bold text-slate-900">AI Tailored Question Prompts</h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                Gemini 1.5 Flash
              </span>
            </div>

            <p className="text-xs text-slate-500 mb-4">
              These questions are dynamically generated to probe specific weaknesses identified in the candidate's resume screening and assessment.
            </p>

            <div className="space-y-4">
              {interview.aiSuggestedQuestions.map((q: any, idx: number) => {
                const badgeColor =
                  q.category === "TECHNICAL_DEEP_DIVE"
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : q.category === "RESUME_GAP_VERIFICATION"
                    ? "bg-amber-50 text-amber-700 border-amber-200"
                    : q.category === "PROBLEM_SOLVING"
                    ? "bg-purple-50 text-purple-700 border-purple-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200";

                return (
                  <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${badgeColor}`}>
                      {q.category.replace(/_/g, " ")}
                    </span>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-2 leading-relaxed">
                      "{q.question}"
                    </h4>
                    <p className="text-[11px] text-slate-500 mt-2 pt-2 border-t border-slate-200/60">
                      <strong>AI Context:</strong> {q.context}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Structured Scorecard */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-1">Interviewer Scorecard</h2>
            <p className="text-xs text-slate-500 mb-6">
              Evaluate candidate competencies and submit your hiring recommendation.
            </p>

            {submitSuccess && (
              <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span className="font-semibold">Scorecard submitted! Candidate advanced to HR Final Approval stage.</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Link
                    href={`/hr/approvals?appId=${interview.applicationId}`}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition inline-flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Proceed to Issue Offer Letter &rarr;</span>
                  </Link>
                  <Link
                    href="/hr/candidates"
                    className="px-3.5 py-2 rounded-xl text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition"
                  >
                    <span>Candidates List</span>
                  </Link>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmitScorecard} className="space-y-5">
              {/* Star Rating Grid */}
              <div className="space-y-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Technical Depth & Architecture</span>
                  {renderStarRating(technicalRating, setTechnicalRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Problem Solving & Debugging</span>
                  {renderStarRating(problemSolvingRating, setProblemSolvingRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Communication & Clarity</span>
                  {renderStarRating(communicationRating, setCommunicationRating)}
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700">Culture Fit & Values</span>
                  {renderStarRating(culturalFitRating, setCulturalFitRating)}
                </div>
              </div>

              {/* Recommendation Choice */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Final Recommendation *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(["STRONG_HIRE", "HIRE", "HOLD", "REJECT"] as const).map((rec) => {
                    const isSelected = recommendation === rec;
                    const color =
                      rec === "STRONG_HIRE"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : rec === "HIRE"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : rec === "HOLD"
                        ? "border-amber-500 bg-amber-50 text-amber-700"
                        : "border-red-500 bg-red-50 text-red-700";

                    return (
                      <button
                        key={rec}
                        type="button"
                        onClick={() => setRecommendation(rec)}
                        className={`p-2.5 rounded-xl border text-xs font-bold transition text-center ${
                          isSelected ? color : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        {rec.replace(/_/g, " ")}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Feedback Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Interview Notes & Specific Observations
                </label>
                <textarea
                  rows={4}
                  required
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Strong explanations on React Server Components. Good problem-solving approach during system design question..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 border-t flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  Status: <strong>{interview.status}</strong>
                </span>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Submit Scorecard</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

