"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowLeft,
  Video,
  FileText,
  User,
  ExternalLink,
} from "lucide-react";

export default function HrAssessmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState("");

  useEffect(() => {
    fetch(`/api/assessments/${testId}?role=hr`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.assessment) {
          setAssessment(data.assessment);
        }
      })
      .finally(() => setLoading(false));
  }, [testId]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400">
        Loading assessment telemetry and proctoring logs...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Assessment Record Not Found</h2>
        <Link href="/hr/candidates" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          &larr; Back to Candidates
        </Link>
      </div>
    );
  }

  const isHighTrust = (assessment.proctoringScore || 100) >= 80;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/hr/candidates"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Candidate Pipeline</span>
      </Link>

      {/* Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assessment & Proctoring Telemetry</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {assessment.candidateName}
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Role: <strong>{assessment.jobTitle}</strong> • {assessment.candidateEmail}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Test Result</span>
              <div className="text-2xl font-black text-slate-900">
                {assessment.totalScore !== undefined ? `${assessment.totalScore}%` : "Pending"}
              </div>
            </div>

            <div className="text-right pl-4 border-l">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Integrity Score</span>
              <div className={`text-2xl font-black ${isHighTrust ? "text-emerald-600" : "text-amber-600"}`}>
                {assessment.proctoringScore}%
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Question & Answer Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <h2 className="text-base font-bold text-slate-900 mb-4">Question Breakdown</h2>

            <div className="space-y-6">
              {assessment.questions.map((q: any, idx: number) => {
                const candidateChoice = assessment.candidateAnswers
                  ? assessment.candidateAnswers[q.id]
                  : undefined;
                const isCorrect = candidateChoice === q.correctAnswer;

                return (
                  <div key={q.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
                      <span className="font-bold text-slate-700">Question {idx + 1} ({q.type})</span>
                      {candidateChoice !== undefined ? (
                        isCorrect ? (
                          <span className="text-emerald-600 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct (+20 pts)
                          </span>
                        ) : (
                          <span className="text-red-500 font-semibold flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        )
                      ) : (
                        <span className="text-slate-400">Unanswered</span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 mb-3">{q.question}</h4>

                    <div className="space-y-1.5">
                      {q.options.map((opt: string, optIdx: number) => {
                        const isSelectedByCandidate = candidateChoice === optIdx;
                        const isActualCorrect = q.correctAnswer === optIdx;

                        return (
                          <div
                            key={optIdx}
                            className={`p-2.5 rounded-xl text-xs font-medium flex items-center justify-between ${
                              isActualCorrect
                                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                : isSelectedByCandidate
                                ? "bg-red-50 text-red-800 border border-red-200"
                                : "bg-white text-slate-600 border border-slate-100"
                            }`}
                          >
                            <span>
                              <strong>{String.fromCharCode(65 + optIdx)}.</strong> {opt}
                            </span>
                            {isSelectedByCandidate && (
                              <span className="text-[10px] font-bold uppercase tracking-wider">Candidate Choice</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {q.explanation && (
                      <p className="mt-3 text-[11px] text-slate-500 border-t pt-2 border-slate-200/60">
                        <strong>Explanation:</strong> {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Proctoring Audit Log */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-2 text-xs font-bold text-indigo-700 uppercase">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Proctoring Audit Log</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Session Integrity</h3>
            <p className="text-xs text-slate-500 mb-4">
              Real-time infractions captured during examination.
            </p>

            {assessment.violations && assessment.violations.length > 0 ? (
              <div className="space-y-3">
                {assessment.violations.map((v: any) => (
                  <div
                    key={v.id}
                    className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900"
                  >
                    <div className="flex items-center justify-between font-bold text-[11px] mb-1">
                      <span className="text-amber-800">{v.type}</span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {new Date(v.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90">{v.message}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs text-center border border-emerald-200">
                <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-600" />
                <span className="font-bold">Zero Violations Flagged</span>
                <p className="text-[11px] text-emerald-700 mt-0.5">Candidate maintained 100% focus and adherence to proctoring rules.</p>
              </div>
            )}

            {/* HR Decision Action */}
            <div className="mt-8 pt-6 border-t border-slate-100 space-y-2">
              <Link
                href="/hr/candidates"
                className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center justify-center gap-1.5"
              >
                <span>Advance to Interview Stage &rarr;</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
