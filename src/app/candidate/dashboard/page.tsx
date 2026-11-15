"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Briefcase,
  Sparkles,
  ArrowRight,
  User,
  Phone,
  Globe,
  Plus,
  X,
  Save,
  Check,
  Edit2,
} from "lucide-react";

export default function CandidateDashboardPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [applications, setApplications] = useState<any[]>([]);
  const [loadingApps, setLoadingApps] = useState(true);

  // Candidate Profile State
  const [profile, setProfile] = useState<any>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [headline, setHeadline] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [bio, setBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  useEffect(() => {
    if (!userEmail) return;

    // 1. Fetch Candidate Applications for this specific logged-in user
    fetch(`/api/applications?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.applications) {
          setApplications(data.applications);
        }
      })
      .finally(() => setLoadingApps(false));

    // 2. Fetch Candidate Profile from DB
    fetch(`/api/candidate/profile?email=${encodeURIComponent(userEmail)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile) {
          const p = data.profile;
          setProfile(p);
          setFullName(p.fullName || session?.user?.name || "");
          setPhone(p.phone || "");
          setHeadline(p.headline || "");
          setPortfolioUrl(p.portfolioUrl || "");
          setSkills(p.skills || []);
          setBio(p.bio || "");

          // If phone is missing, open profile completion by default
          if (!p.isProfileComplete) {
            setIsEditingProfile(true);
          }
        }
      });
  }, [userEmail, session]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const res = await fetch("/api/candidate/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userEmail,
          fullName,
          phone,
          headline,
          portfolioUrl,
          skills,
          bio,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
        setIsEditingProfile(false);
        setProfileSuccessMsg("✅ Your candidate profile has been saved to the database!");
      }
    } catch (e) {
      console.error("Failed to save profile", e);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleAddSkill = () => {
    const val = skillInput.trim();
    if (val && !skills.includes(val)) {
      setSkills([...skills, val]);
      setSkillInput("");
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Banner */}
      <div className="bg-jade-dark rounded-3xl p-8 text-white shadow-md mb-8 relative overflow-hidden border border-jade-900/20">
        <div className="absolute inset-0 bg-tiny-grid-dark opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold mb-3 border border-emerald-400/20 text-emerald-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate Portal</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              Welcome, {session?.user?.name || "Applicant"}!
            </h1>
            <p className="mt-2 text-emerald-100/80 max-w-xl text-xs sm:text-sm leading-relaxed">
              Complete your profile details, apply for open positions with your resume, and track
              your assessment and onboarding stages.
            </p>
          </div>

          <Link
            href="/jobs"
            className="self-start sm:self-auto px-5 py-2.5 rounded-xl font-bold text-xs bg-white text-jade-dark hover:bg-emerald-50 shadow-sm transition flex items-center gap-1.5"
          >
            <span>Explore Open Jobs</span>
            <ArrowRight className="w-4 h-4 text-jade-800" />
          </Link>
        </div>
      </div>

      {profileSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{profileSuccessMsg}</span>
          </div>
          <button onClick={() => setProfileSuccessMsg("")} className="text-emerald-600 font-bold">✕</button>
        </div>
      )}

      {/* Primary Candidate Data Profile Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b mb-6">
          <div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-jade-700" />
              <h2 className="text-lg font-bold text-jade-dark">Candidate Primary Profile</h2>
              {profile?.isProfileComplete ? (
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Saved in Database
                </span>
              ) : (
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 text-amber-600" />
                  Setup Incomplete
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Your primary details are saved in the PostgreSQL database and automatically attached to your job applications.
            </p>
          </div>

          {!isEditingProfile && profile?.isProfileComplete && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="text-xs font-semibold text-jade-800 hover:text-jade-950 flex items-center gap-1.5 self-start sm:self-auto bg-jade-50 px-3 py-1.5 rounded-xl border border-jade-200/80"
            >
              <Edit2 className="w-3.5 h-3.5 text-jade-700" />
              <span>Edit Profile</span>
            </button>
          )}
        </div>

        {isEditingProfile ? (
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Role / Headline</label>
                <input
                  type="text"
                  value={headline}
                  onChange={(e) => setHeadline(e.target.value)}
                  placeholder="e.g. Senior Full-Stack Engineer"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Portfolio / LinkedIn URL</label>
                <input
                  type="url"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  placeholder="https://linkedin.com/in/..."
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Core Technical Skills</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddSkill();
                    }
                  }}
                  placeholder="Type a skill and press Enter (e.g. Next.js, Python, PostgreSQL)"
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1 text-xs font-medium bg-jade-50 text-jade-800 border border-jade-200/80 px-2.5 py-1 rounded-lg"
                  >
                    {skill}
                    <button type="button" onClick={() => handleRemoveSkill(skill)}>
                      <X className="w-3 h-3 hover:text-jade-950" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Summary / Bio</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Brief 2-3 sentence overview of your background and achievements..."
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-jade-700/20"
              />
            </div>

            <div className="pt-3 border-t flex items-center justify-end gap-3">
              {profile?.isProfileComplete && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="px-6 py-2.5 text-xs font-bold text-white bg-jade-dark hover:bg-jade-950 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center gap-1.5"
              >
                {savingProfile ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Saving to Database...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Save Candidate Profile</span>
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-600">
            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Candidate Name</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{profile?.fullName}</span>
              <span className="text-slate-500 mt-0.5 block">{profile?.headline || "Applicant"}</span>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Contact Info</span>
              <div className="mt-1 space-y-1">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile?.phone || "No phone provided"}</span>
                </div>
                {profile?.portfolioUrl && (
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <Globe className="w-3.5 h-3.5" />
                    <a href={profile.portfolioUrl} target="_blank" rel="noreferrer" className="hover:underline">
                      Portfolio Link
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-semibold block uppercase text-[10px]">Top Skills</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {profile?.skills && profile.skills.length > 0 ? (
                  profile.skills.map((s: string, idx: number) => (
                    <span key={idx} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium border">
                      {s}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400">No skills added yet.</span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Applications Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">My Job Applications</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live status tracking for positions you have applied to.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
            {applications.length} Active
          </span>
        </div>

        {loadingApps ? (
          <div className="text-center py-12 text-slate-400 text-xs">Loading your application records...</div>
        ) : applications.length === 0 ? (
          // Clean Empty State for new candidate
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">No applications submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              You haven't applied for any positions yet. Browse open roles, submit your resume, and
              our AI will analyze your profile in seconds.
            </p>
            <Link
              href="/jobs"
              className="mt-6 inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <span>Browse Open Positions</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {applications.map((app) => (
              <div
                key={app.id}
                className="bg-white rounded-2xl border p-6 hover:shadow-md transition border-slate-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-lg">{app.jobTitle}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                      <span>Applied on {new Date(app.createdAt).toLocaleDateString()}</span>
                      <span>•</span>
                      <span>Resume: {app.resumeFileName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-3 py-1 rounded-full border bg-blue-50 text-blue-700 border-blue-200">
                      {app.status}
                    </span>
                    {app.matchScore && (
                      <div className="px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-700">
                        {app.matchScore}% Match
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 border-t flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span>AI Resume screening verified</span>
                  </div>

                  {app.status === "ASSESSMENT_PENDING" ? (
                    <Link
                      href={`/candidate/assessments/${app.assessmentId || app.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 shadow-sm transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Take Proctored Assessment &rarr;</span>
                    </Link>
                  ) : app.status === "ASSESSMENT_COMPLETED" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Assessment Completed: {app.assessmentScore || 0}%
                      </span>
                      <span className="text-xs text-slate-400">Awaiting Interview</span>
                    </div>
                  ) : app.status === "INTERVIEW_SCHEDULED" ? (
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                        Interview Scheduled
                      </span>
                      <span className="text-xs text-slate-400">Check inbox for Google Meet link</span>
                    </div>
                  ) : app.status === "HR_REVIEW" ? (
                    <span className="text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                      Interview Done • HR Reviewing Offer
                    </span>
                  ) : app.status === "OFFER_PENDING" ? (
                    <Link
                      href={`/candidate/offers/${app.offerId || app.id}`}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition inline-flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Review & Sign Offer &rarr;</span>
                    </Link>
                  ) : app.status === "ONBOARDING" || app.status === "OFFER_ACCEPTED" || app.status === "HIRED" ? (
                    <Link
                      href="/candidate/onboarding"
                      className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-jade-800 hover:bg-jade-900 shadow-sm transition inline-flex items-center gap-1.5"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>View Employee ID & Onboarding &rarr;</span>
                    </Link>
                  ) : app.status === "REJECTED" ? (
                    <span className="text-xs text-red-600 font-medium">Application Not Selected</span>
                  ) : (
                    <span className="text-xs text-slate-400">Under Review</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
