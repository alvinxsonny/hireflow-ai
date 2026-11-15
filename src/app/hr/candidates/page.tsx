"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  FileText,
  AlertTriangle,
  ChevronRight,
  ExternalLink,
  Wand2,
  ThumbsUp,
  ThumbsDown,
  Video,
  Calendar,
} from "lucide-react";

export default function HrCandidateScreeningPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedJob, setSelectedJob] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [minScore, setMinScore] = useState(0);

  // Selected candidate for AI Diagnostic Modal
  const [activeCandidate, setActiveCandidate] = useState<any | null>(null);
  const [isScreeningId, setIsScreeningId] = useState<string | null>(null);
  const [isGeneratingTest, setIsGeneratingTest] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState("");

  useEffect(() => {
    fetchCandidates();
  }, []);

  const fetchCandidates = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/applications");
      const data = await res.json();
      if (data.success && data.applications) {
        setCandidates(data.applications);
      }
    } catch (e) {
      console.error("Failed to fetch applications", e);
    } finally {
      setLoading(false);
    }
  };

  // Trigger Gemini AI screening on demand
  const handleRunScreening = async (applicationId: string) => {
    setIsScreeningId(applicationId);
    setActionSuccessMsg("");
    try {
      const res = await fetch("/api/screen-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === applicationId ? { ...c, ...data.data } : c))
        );
        setActiveCandidate(data.data);
        setActionSuccessMsg(`✨ Successfully screened ${data.data.candidateName} with Gemini AI!`);
      }
    } catch (e) {
      console.error("Screening failed", e);
    } finally {
      setIsScreeningId(null);
    }
  };

  // Generate Online Assessment with AI
  const handleGenerateAssessment = async (candidate: any) => {
    setIsGeneratingTest(true);
    setActionSuccessMsg("");
    try {
      const res = await fetch("/api/assessments/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ applicationId: candidate.id }),
      });
      const data = await res.json();
      if (data.success && data.assessment) {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id
              ? { ...c, status: "ASSESSMENT_PENDING", assessmentId: data.assessment.id }
              : c
          )
        );
        if (activeCandidate && activeCandidate.id === candidate.id) {
          setActiveCandidate({
            ...activeCandidate,
            status: "ASSESSMENT_PENDING",
            assessmentId: data.assessment.id,
          });
        }
        setActionSuccessMsg(`🎯 Proctored technical assessment generated & dispatched to ${candidate.candidateName}!`);
      } else {
        alert(data.error || "Failed to generate assessment");
      }
    } catch (e: any) {
      console.error("Assessment generation failed", e);
      alert(e.message || "Failed to generate assessment");
    } finally {
      setIsGeneratingTest(false);
    }
  };

  // Update candidate status (Shortlist, Assessment, Reject)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/applications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setCandidates((prev) =>
          prev.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
        );
        if (activeCandidate && activeCandidate.id === id) {
          setActiveCandidate({ ...activeCandidate, status: newStatus });
        }
        setActionSuccessMsg(`Status updated to ${newStatus}`);
      }
    } catch (e) {
      console.error("Failed to update status", e);
    }
  };

  // Filter and sort by Match Score descending
  const filteredCandidates = candidates
    .filter((c) => {
      if (selectedJob !== "All" && c.jobTitle !== selectedJob) return false;
      if (statusFilter !== "All" && c.status !== statusFilter) return false;
      if (minScore > 0 && (c.matchScore || 0) < minScore) return false;
      return true;
    })
    .sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0));

  const jobOptions = ["All", ...Array.from(new Set(candidates.map((c) => c.jobTitle)))];

  const getScoreBadge = (score?: number) => {
    if (score === undefined || score === null) {
      return (
        <span className="text-xs font-medium text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
          Not Screened
        </span>
      );
    }
    if (score >= 90) {
      return (
        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-600" />
          {score}% Excellent
        </span>
      );
    }
    if (score >= 75) {
      return (
        <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-blue-600" />
          {score}% Strong Match
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
          {score}% Moderate
        </span>
      );
    }
    return (
      <span className="text-xs font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-full">
        {score}% Low Fit
      </span>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Stage 2: AI Resume Screening & Ranking
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Candidate Pipeline
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Resumes parsed, matched, and ranked in real-time by the Gemini AI evaluation engine.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/hr/jobs"
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition"
          >
            Manage Job Openings
          </Link>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg("")} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Filter Role</label>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              {jobOptions.map((job) => (
                <option key={job} value={job}>
                  {job}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value="All">All Stages</option>
              <option value="APPLIED">Applied (Unscreened)</option>
              <option value="SCREENED">Screened</option>
              <option value="SHORTLISTED">Shortlisted</option>
              <option value="ASSESSMENT_PENDING">Assessment Pending</option>
              <option value="HR_REVIEW">HR Review</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Min Match Score</label>
            <select
              value={minScore}
              onChange={(e) => setMinScore(parseInt(e.target.value))}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700"
            >
              <option value={0}>Any Score</option>
              <option value={70}>70%+ (Acceptable)</option>
              <option value={80}>80%+ (Strong Match)</option>
              <option value={90}>90%+ (Top Tier)</option>
            </select>
          </div>
        </div>

        <span className="text-xs font-semibold text-slate-500 self-end">
          Showing {filteredCandidates.length} Candidates
        </span>
      </div>

      {/* Candidates Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading candidate applications...</div>
      ) : filteredCandidates.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No candidates match your filters</h3>
          <p className="text-xs text-slate-500 mt-1">Try resetting the role or score filters above.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Rank</th>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Applied Position</th>
                <th className="py-3.5 px-6">AI Fit Score</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((c, index) => (
                <tr key={c.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6">
                    <span className="text-xs font-bold text-slate-400">#{index + 1}</span>
                  </td>

                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900">{c.candidateName}</div>
                    <div className="text-xs text-slate-500">{c.candidateEmail}</div>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-600 font-medium">{c.jobTitle}</td>

                  <td className="py-4 px-6">{getScoreBadge(c.matchScore)}</td>

                  <td className="py-4 px-6">
                    <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border">
                      {c.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {c.matchScore === undefined ? (
                        <button
                          onClick={() => handleRunScreening(c.id)}
                          disabled={isScreeningId === c.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
                        >
                          {isScreeningId === c.id ? (
                            <>
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                              <span>Screening...</span>
                            </>
                          ) : (
                            <>
                              <Wand2 className="w-3 h-3" />
                              <span>Screen with AI</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveCandidate(c)}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                        >
                          <span>AI Diagnostics</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* AI Candidate Diagnostics Modal / Drawer */}
      {activeCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-start justify-between pb-4 border-b">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-xl font-bold text-slate-900">
                    {activeCandidate.candidateName}
                  </h3>
                  {getScoreBadge(activeCandidate.matchScore)}
                </div>
                <p className="text-xs text-slate-500">
                  Target: <strong>{activeCandidate.jobTitle}</strong> • {activeCandidate.candidateEmail}
                </p>
              </div>

              <button
                onClick={() => setActiveCandidate(null)}
                className="text-slate-400 hover:text-slate-600 p-1 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-6 space-y-6 max-h-[60vh] overflow-y-auto pr-2">
              {/* Executive AI Verdict */}
              {activeCandidate.aiSummary && (
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200">
                  <div className="flex items-center gap-2 mb-1 text-xs font-bold text-blue-900 uppercase">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    <span>Gemini AI Evaluation Verdict</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    {activeCandidate.aiSummary}
                  </p>
                </div>
              )}

              {/* Skills Analysis */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-emerald-800 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Matched Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCandidate.matchedSkills && activeCandidate.matchedSkills.length > 0 ? (
                      activeCandidate.matchedSkills.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] font-semibold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-lg border border-emerald-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">No exact skill matches parsed.</span>
                    )}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Missing / Unverified Skills</span>
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeCandidate.missingSkills && activeCandidate.missingSkills.length > 0 ? (
                      activeCandidate.missingSkills.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="text-[11px] font-medium bg-amber-100/60 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200"
                        >
                          {s}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600">All required skills matched!</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="space-y-3">
                {activeCandidate.strengths && activeCandidate.strengths.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <ThumbsUp className="w-3.5 h-3.5 text-blue-600" /> Key Candidate Strengths
                    </h5>
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                      {activeCandidate.strengths.map((str: string, idx: number) => (
                        <li key={idx}>{str}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {activeCandidate.weaknesses && activeCandidate.weaknesses.length > 0 && (
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <ThumbsDown className="w-3.5 h-3.5 text-amber-600" /> Areas to Investigate in Interview
                    </h5>
                    <ul className="list-disc pl-5 text-xs text-slate-600 space-y-1">
                      {activeCandidate.weaknesses.map((wk: string, idx: number) => (
                        <li key={idx}>{wk}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Resume File info */}
              <div className="pt-3 border-t flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-slate-400" />
                  <span>Resume: {activeCandidate.resumeFileName}</span>
                </div>
                {activeCandidate.resumeFileUrl && (
                  <a
                    href={activeCandidate.resumeFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download={activeCandidate.resumeFileName || "resume.pdf"}
                    className="text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Download File</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Recruiter Decision Bar */}
            <div className="mt-8 pt-4 border-t flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">
                  Current Status: <strong className="text-slate-700">{activeCandidate.status}</strong>
                </span>
                {(activeCandidate.assessmentId || activeCandidate.status === "ASSESSMENT_PENDING" || activeCandidate.status === "ASSESSMENT_COMPLETED") && (
                  <Link
                    href={`/hr/assessments/${activeCandidate.assessmentId || activeCandidate.id}`}
                    className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-lg hover:bg-indigo-100 transition flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Proctoring Audit</span>
                  </Link>
                )}
              </div>

              <div className="flex items-center gap-2">
                {activeCandidate.status !== "REJECTED" && (
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "REJECTED")}
                    className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                  >
                    Reject
                  </button>
                )}

                {(activeCandidate.status === "APPLIED" || activeCandidate.status === "SCREENED") && (
                  <button
                    onClick={() => handleUpdateStatus(activeCandidate.id, "SHORTLISTED")}
                    className="px-4 py-2 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition border border-blue-200"
                  >
                    Mark Shortlisted
                  </button>
                )}

                {/* Next Step Action Button */}
                {activeCandidate.status === "APPLIED" || activeCandidate.status === "SCREENED" || activeCandidate.status === "SHORTLISTED" ? (
                  <button
                    onClick={() => handleGenerateAssessment(activeCandidate)}
                    disabled={isGeneratingTest}
                    className="px-5 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {isGeneratingTest ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Generating Test with AI...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>Approve for Online Assessment &rarr;</span>
                      </>
                    )}
                  </button>
                ) : activeCandidate.status === "ASSESSMENT_PENDING" ? (
                  <span className="px-4 py-2 text-xs font-medium text-amber-700 bg-amber-50 rounded-xl border border-amber-200">
                    Assessment Sent • Awaiting Candidate Submission
                  </span>
                ) : activeCandidate.status === "ASSESSMENT_COMPLETED" ? (
                  <Link
                    href={`/hr/interviews?appId=${activeCandidate.id}`}
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Schedule Technical Interview &rarr;</span>
                  </Link>
                ) : activeCandidate.status === "INTERVIEW_SCHEDULED" ? (
                  <Link
                    href={`/hr/interviews/${activeCandidate.interviewId || ''}`}
                    className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Open Interview Room & Copilot &rarr;</span>
                  </Link>
                ) : activeCandidate.status === "HR_REVIEW" ? (
                  <Link
                    href={`/hr/approvals?appId=${activeCandidate.id}`}
                    className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Approve & Issue Offer Letter &rarr;</span>
                  </Link>
                ) : activeCandidate.status === "OFFER_PENDING" ? (
                  <Link
                    href={`/candidate/offers/${activeCandidate.offerId || activeCandidate.id}`}
                    target="_blank"
                    className="px-5 py-2 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 rounded-xl transition flex items-center gap-1.5"
                  >
                    <span>View Dispatched Offer &rarr;</span>
                  </Link>
                ) : activeCandidate.status === "ONBOARDING" || activeCandidate.status === "OFFER_ACCEPTED" ? (
                  <Link
                    href="/hr/onboarding"
                    className="px-5 py-2 text-xs font-semibold text-white bg-jade-800 hover:bg-jade-900 rounded-xl shadow-sm transition flex items-center gap-1.5"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Review Onboarding Documents &rarr;</span>
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

