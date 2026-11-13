"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Briefcase,
  DollarSign,
  Clock,
  Sparkles,
  ArrowLeft,
  UploadCloud,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Building2,
  Send,
} from "lucide-react";

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Application form state
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [candidatePhone, setCandidatePhone] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    fetch(`/api/jobs`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.jobs) {
          const found = data.jobs.find((j: any) => j.id === jobId);
          setJob(found || null);
        }
      })
      .finally(() => setLoading(false));
  }, [jobId]);

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeFile) {
      setErrorMessage("Please select your resume PDF or DOCX file.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("jobId", jobId);
      formData.append("candidateName", candidateName);
      formData.append("candidateEmail", candidateEmail);
      formData.append("candidatePhone", candidatePhone);
      formData.append("portfolioUrl", portfolioUrl);
      formData.append("coverLetter", coverLetter);
      formData.append("resume", resumeFile);

      const res = await fetch("/api/applications", {
        method: "POST",
        body: formData,
      });

      const result = await res.json();
      if (result.success) {
        setSubmissionSuccess(true);
      } else {
        setErrorMessage(result.error || "Failed to submit application");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Something went wrong.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-20 text-center text-slate-400">Loading position details...</div>;
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto py-20 text-center">
        <h2 className="text-xl font-bold text-slate-800">Job Not Found</h2>
        <Link href="/jobs" className="mt-4 inline-block text-sm text-blue-600 hover:underline">
          &larr; Return to all jobs
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Top Breadcrumb */}
      <Link
        href="/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to All Open Roles</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Job Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-full uppercase">
                {job.department}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {job.employmentType}
              </span>
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {job.experienceLevel} Level
              </span>
            </div>

            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>

            <div className="mt-4 flex flex-wrap gap-4 text-xs font-medium text-slate-600 border-y py-3 border-slate-100">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-slate-400" />
                <span>{job.location}</span>
              </div>
              {job.salaryRangeMin > 0 && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-600" />
                  <span>
                    ${job.salaryRangeMin.toLocaleString()} - ${job.salaryRangeMax.toLocaleString()} / year
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-slate-400" />
                <span>Min {job.minExperienceYears} Years Experience</span>
              </div>
            </div>

            {/* Description Body */}
            <div className="mt-8 prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-4">
              <div className="whitespace-pre-line text-sm">{job.description}</div>
            </div>

            {/* Required Skills */}
            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Required Technical Skills</h3>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.map((skill: string, idx: number) => (
                  <span
                    key={idx}
                    className="text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-3 py-1 rounded-lg"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Preferred Skills */}
            {job.preferredSkills && job.preferredSkills.length > 0 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Preferred Qualifications</h3>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map((skill: string, idx: number) => (
                    <span
                      key={idx}
                      className="text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 px-3 py-1 rounded-lg"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Application Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm sticky top-24">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Interested in this role?</h3>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Submit your resume today. Our AI matching system screens applications within seconds,
              giving you instant feedback on next steps.
            </p>

            <button
              onClick={() => setShowApplyModal(true)}
              className="w-full py-3.5 px-4 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-2 text-sm"
            >
              <Send className="w-4 h-4" />
              <span>Apply for this Position</span>
            </button>

            <div className="mt-6 pt-6 border-t border-slate-100 space-y-3 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI-powered automated skill matching</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Instant confirmation & tracking</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Proctored online assessment stage</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-8 shadow-2xl border border-slate-100 my-8">
            {submissionSuccess ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto mb-4 border border-emerald-200">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900">Application Submitted!</h3>
                <p className="text-sm text-slate-600 mt-2 max-w-sm mx-auto">
                  Thank you, <strong>{candidateName}</strong>! Your application for <strong>{job.title}</strong> has been received and queued for AI screening.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                  <Link
                    href="/candidate/dashboard"
                    className="px-5 py-2.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 text-xs shadow-sm transition"
                  >
                    Go to Candidate Dashboard
                  </Link>
                  <button
                    onClick={() => {
                      setShowApplyModal(false);
                      setSubmissionSuccess(false);
                    }}
                    className="px-5 py-2.5 rounded-xl font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 text-xs transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleApply} className="space-y-4">
                <div className="flex items-center justify-between pb-4 border-b">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Apply: {job.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Please fill out your details and upload your resume.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="text-slate-400 hover:text-slate-600 p-1"
                  >
                    ✕
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={candidateName}
                      onChange={(e) => setCandidateName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={candidateEmail}
                      onChange={(e) => setCandidateEmail(e.target.value)}
                      placeholder="jane@example.com"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      value={candidatePhone}
                      onChange={(e) => setCandidatePhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">LinkedIn / Portfolio URL</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Resume Upload Box */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Upload Resume (PDF or DOCX) *
                  </label>
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-5 text-center hover:border-blue-400 transition bg-slate-50/50">
                    <input
                      type="file"
                      id="resume-upload"
                      accept=".pdf,.docx"
                      required
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          setResumeFile(e.target.files[0]);
                        }
                      }}
                    />
                    <label htmlFor="resume-upload" className="cursor-pointer block">
                      {resumeFile ? (
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-blue-700 bg-blue-50 py-2 px-3 rounded-xl border border-blue-200">
                          <FileCheck2 className="w-4 h-4 text-blue-600" />
                          <span>{resumeFile.name} ({(resumeFile.size / 1024).toFixed(0)} KB)</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          <UploadCloud className="w-8 h-8 text-blue-500 mx-auto" />
                          <p className="text-xs font-semibold text-slate-700">Click to upload your resume</p>
                          <p className="text-[10px] text-slate-400">PDF, DOCX up to 10MB</p>
                        </div>
                      )}
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cover Letter or Brief Introduction (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    placeholder="Tell us why you are a great fit for this position..."
                    className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>

                <div className="pt-3 border-t flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowApplyModal(false)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Submitting Application...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

