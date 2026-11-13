"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  CheckCircle2,
  Clock,
  UploadCloud,
  FileCheck2,
  FileText,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  Building2,
  Calendar,
  ExternalLink,
} from "lucide-react";

export default function CandidateOnboardingPage() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingDocType, setUploadingDocType] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding");
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      } else if (data.profiles && data.profiles.length > 0) {
        setProfile(data.profiles[0]);
      }
    } catch (e) {
      console.error("Failed to load onboarding", e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (docType: string, file: File) => {
    setUploadingDocType(docType);
    setSuccessToast("");

    try {
      const formData = new FormData();
      formData.append("profileId", profile?.id || "onb-1");
      formData.append("docType", docType);
      formData.append("file", file);

      const res = await fetch("/api/onboarding/documents", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setSuccessToast(`✨ ${file.name} uploaded & verified!`);
      }
    } catch (e) {
      console.error("Upload failed", e);
    } finally {
      setUploadingDocType(null);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      const res = await fetch("/api/onboarding/checklist", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileId: profile?.id || "onb-1",
          taskId,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      }
    } catch (e) {
      console.error("Failed to toggle checklist", e);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-24 text-center text-slate-400">Loading onboarding portal...</div>;
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Onboarding Record Not Found</h2>
        <Link href="/candidate/dashboard" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          &larr; Return to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Hero Card */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Employee Onboarding Portal</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight">
              Welcome to the Team, {profile.candidateName}!
            </h1>
            <p className="mt-2 text-blue-100 text-xs sm:text-sm max-w-xl leading-relaxed">
              Congratulations on accepting your offer for <strong>{profile.jobTitle}</strong>. Please complete your required document uploads and new hire orientation checklist below.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 text-center shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
              Employee ID
            </span>
            <span className="text-xl font-black text-white font-mono mt-0.5 block">
              {profile.employeeCode}
            </span>
            <span className="text-[10px] text-blue-200 mt-1 block">
              Start: {profile.joiningDate}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-8 pt-6 border-t border-white/20">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span>Orientation Checklist Progress</span>
            <span>{profile.checklistProgress}% Completed</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-2.5 rounded-full transition-all duration-500"
              style={{ width: `${profile.checklistProgress}%` }}
            />
          </div>
        </div>
      </div>

      {successToast && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast("")} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Document Submission Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <div>
                <h2 className="text-base font-bold text-slate-900">Required Document Submissions</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Uploaded documents are automatically checked by AI and verified by HR.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {profile.documents.map((doc: any) => {
                const isUploaded = doc.status === "SUBMITTED" || doc.status === "VERIFIED";

                return (
                  <div
                    key={doc.id}
                    className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {doc.docType.replace(/_/g, " ")}
                        </span>
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

                      <h4 className="text-xs font-bold text-slate-900 mb-2">{doc.title}</h4>

                      {isUploaded ? (
                        <div className="space-y-1 text-[11px] text-slate-600">
                          <div className="flex items-center gap-1 font-semibold text-blue-700">
                            <FileCheck2 className="w-3.5 h-3.5" />
                            <span>{doc.fileName}</span>
                          </div>
                          {doc.aiValidationNotes && (
                            <p className="text-[10px] text-slate-500 bg-white p-2 rounded-lg border border-slate-200/60 mt-1">
                              <strong>AI Note:</strong> {doc.aiValidationNotes}
                            </p>
                          )}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400">
                          Awaiting file submission (PDF, PNG, JPG).
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <input
                        type="file"
                        id={`file-${doc.id}`}
                        accept=".pdf,.png,.jpg,.jpeg"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            handleFileUpload(doc.docType, e.target.files[0]);
                          }
                        }}
                      />
                      <label
                        htmlFor={`file-${doc.id}`}
                        className="w-full py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 transition text-xs font-semibold text-slate-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {uploadingDocType === doc.docType ? (
                          <>
                            <div className="w-3 h-3 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <>
                            <UploadCloud className="w-3.5 h-3.5 text-blue-600" />
                            <span>{isUploaded ? "Replace Document" : "Upload File"}</span>
                          </>
                        )}
                      </label>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Col: Orientation Checklist */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b">
              <h3 className="text-base font-bold text-slate-900">Orientation Checklist</h3>
              <span className="text-[11px] font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200">
                {profile.checklist.filter((t: any) => t.completed).length}/{profile.checklist.length} Done
              </span>
            </div>

            <div className="space-y-3">
              {profile.checklist.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-start gap-3 ${
                    task.completed
                      ? "bg-emerald-50/60 border-emerald-200 text-slate-700"
                      : "bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-800"
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5 border ${
                      task.completed
                        ? "bg-emerald-600 border-emerald-600 text-white"
                        : "bg-white border-slate-300"
                    }`}
                  >
                    {task.completed && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </div>

                  <div>
                    <h5 className={`text-xs font-bold leading-tight ${task.completed ? "line-through text-slate-500" : "text-slate-900"}`}>
                      {task.title}
                    </h5>
                    <p className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                      {task.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t text-center text-xs text-slate-400">
              Check all items to finish your formal onboarding orientation.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
