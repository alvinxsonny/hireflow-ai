"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Video,
  Calendar,
  Clock,
  Sparkles,
  User,
  Plus,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
} from "lucide-react";

export default function HrInterviewsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto py-20 text-center text-slate-400">Loading interviews...</div>}>
      <HrInterviewsContent />
    </Suspense>
  );
}

function HrInterviewsContent() {
  const searchParams = useSearchParams();
  const urlAppId = searchParams.get("appId");

  const [interviews, setInterviews] = useState<any[]>([]);
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Scheduling modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState("");
  const [interviewerName, setInterviewerName] = useState("");
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("14:00");
  const [meetingLink, setMeetingLink] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const tmrw = new Date();
    tmrw.setDate(tmrw.getDate() + 1);
    setScheduledDate(tmrw.toISOString().split("T")[0]);
    fetchData();
  }, [urlAppId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [intRes, candRes, profRes] = await Promise.all([
        fetch("/api/interviews"),
        fetch("/api/applications"),
        fetch("/api/hr/profile"),
      ]);
      const [intData, candData, profData] = await Promise.all([
        intRes.json(),
        candRes.json(),
        profRes.json().catch(() => ({})),
      ]);

      if (intData.success) setInterviews(intData.interviews || []);
      if (candData.success) {
        setCandidates(candData.applications || []);
        if (urlAppId) {
          setSelectedAppId(urlAppId);
          setShowScheduleModal(true);
        } else if (candData.applications && candData.applications.length > 0) {
          setSelectedAppId(candData.applications[0].id);
        }
      }
      if (profData?.profile) {
        const p = profData.profile;
        const formatted = p.designation ? `${p.fullName} (${p.designation})` : p.fullName;
        if (formatted) setInterviewerName(formatted);
      }
    } catch (e) {
      console.error("Failed to load interview data", e);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const scheduledAt = new Date(`${scheduledDate}T${scheduledTime}:00`).toISOString();
      const res = await fetch("/api/interviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedAppId,
          interviewerName,
          scheduledAt,
          meetingLink,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setInterviews((prev) => [data.interview, ...prev]);
        setShowScheduleModal(false);
      }
    } catch (e) {
      console.error("Failed to schedule interview", e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Video className="w-3.5 h-3.5" />
            <span>Stage 4: Interview Management & AI Co-Pilot</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Interviews & Scorecards
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Conduct live panel sessions with AI-generated tailored questions and structured competency scorecards.
          </p>
        </div>

        <button
          onClick={() => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            setScheduledDate(tomorrow.toISOString().split("T")[0]);
            setShowScheduleModal(true);
          }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Schedule New Interview</span>
        </button>
      </div>

      {/* Interviews Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading interview schedule...</div>
      ) : interviews.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No interviews scheduled</h3>
          <p className="text-xs text-slate-500 mt-1">Click "Schedule New Interview" to invite shortlisted candidates.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Role</th>
                <th className="py-3.5 px-6">Date & Time</th>
                <th className="py-3.5 px-6">Interviewer</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {interviews.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 block">{item.candidateName}</span>
                    <span className="text-xs text-slate-500">{item.candidateEmail}</span>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-600 font-medium">{item.jobTitle}</td>

                  <td className="py-4 px-6 text-xs text-slate-600">
                    <div className="flex items-center gap-1 font-semibold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{new Date(item.scheduledAt).toLocaleDateString()}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      {new Date(item.scheduledAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </td>

                  <td className="py-4 px-6 text-xs text-slate-700 font-medium">
                    {item.interviewerName}
                  </td>

                  <td className="py-4 px-6">
                    {item.status === "COMPLETED" ? (
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        Completed ({item.scorecard?.recommendation})
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full inline-flex items-center gap-1">
                        <Clock className="w-3 h-3 text-blue-600" />
                        Scheduled
                      </span>
                    )}
                  </td>

                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/hr/interviews/${item.id}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 transition"
                    >
                      <span>AI Co-Pilot & Scorecard</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Schedule Interview</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gemini AI will generate tailored interview questions based on resume gaps.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Candidate *</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                >
                  {candidates.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.candidateName} — {c.jobTitle} ({c.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Interviewer Name *</label>
                <input
                  type="text"
                  required
                  value={interviewerName}
                  onChange={(e) => setInterviewerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Time *</label>
                  <input
                    type="time"
                    required
                    value={scheduledTime}
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Meeting Link</label>
                <input
                  type="url"
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Generating AI Questions & Scheduling...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Confirm & Generate Co-Pilot Prompts</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

