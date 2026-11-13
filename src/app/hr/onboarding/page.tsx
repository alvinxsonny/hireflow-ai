"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  ShieldCheck,
  Building2,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
} from "lucide-react";

export default function HrOnboardingPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (data.success && data.profiles) {
        setProfiles(data.profiles);
        if (data.profiles.length > 0) {
          setActiveProfile(data.profiles[0]);
        }
      }
    } catch (e) {
      console.error("Failed to load onboarding", e);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDoc = async (docId: string, status: "VERIFIED" | "REJECTED") => {
    try {
      const res = await fetch(`/api/onboarding/documents/${docId}/review`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: activeProfile?.id,
          status,
          rejectionReason: status === "REJECTED" ? "Document is illegible or expired." : undefined,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setActiveProfile(data.profile);
        setProfiles((prev) =>
          prev.map((p) => (p.id === data.profile.id ? data.profile : p))
        );
        setSuccessMsg(`Document status updated to ${status}`);
      }
    } catch (e) {
      console.error("Review failed", e);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 mb-2">
            <Users2 className="w-3.5 h-3.5" />
            <span>Stage 7: Employee Onboarding & Verification</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            New Hire Onboarding Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Audit candidate document submissions, verify credentials with AI assistance, and track orientation completion.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Main Grid: Profiles List & Document Review Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Col: Profiles List */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-slate-900">Active New Hires ({profiles.length})</h2>

          {profiles.map((p) => {
            const isSelected = activeProfile?.id === p.id;
            return (
              <div
                key={p.id}
                onClick={() => setActiveProfile(p)}
                className={`p-5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? "bg-white border-blue-500 shadow-md ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                    {p.employeeCode}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {p.checklistProgress}% Ready
                  </span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm">{p.candidateName}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{p.jobTitle}</p>

                <div className="mt-3 pt-3 border-t flex items-center justify-between text-[11px] text-slate-400">
                  <span>Start: {p.joiningDate}</span>
                  <span className="font-semibold text-emerald-600 uppercase">
                    {p.orientationStatus.replace(/_/g, " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right 2 Cols: Selected Hire Document Verification Hub */}
        {activeProfile ? (
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b mb-6">
                <div>
                  <span className="text-xs font-bold text-blue-600 uppercase">
                    {activeProfile.department} Team
                  </span>
                  <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                    {activeProfile.candidateName}
                  </h2>
                  <p className="text-xs text-slate-500">{activeProfile.candidateEmail}</p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Orientation</span>
                  <div className="text-xl font-black text-slate-900">
                    {activeProfile.checklistProgress}%
                  </div>
                </div>
              </div>

              {/* Documents to Review */}
              <h3 className="text-sm font-bold text-slate-900 mb-4">Submitted Documents for Verification</h3>

              <div className="space-y-4">
                {activeProfile.documents.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-bold text-slate-900">{doc.title}</span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            doc.status === "VERIFIED"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : doc.status === "SUBMITTED"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-amber-50 text-amber-700 border-amber-200"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>

                      {doc.fileName ? (
                        <div className="text-xs text-slate-600 space-y-0.5">
                          <p className="font-semibold text-blue-700">{doc.fileName}</p>
                          {doc.aiValidationNotes && (
                            <p className="text-[11px] text-slate-500">
                              🤖 {doc.aiValidationNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Awaiting employee upload.</span>
                      )}
                    </div>

                    {doc.status === "SUBMITTED" && (
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => handleReviewDoc(doc.id, "REJECTED")}
                          className="px-3 py-1.5 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 transition"
                        >
                          Reject
                        </button>
                        <button
                          onClick={() => handleReviewDoc(doc.id, "VERIFIED")}
                          className="px-4 py-1.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
                        >
                          Approve Document
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 text-center py-20 text-slate-400">
            Select a new hire to review their onboarding documents.
          </div>
        )}
      </div>
    </div>
  );
}
