"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Briefcase,
  Users,
  Clock,
  Sparkles,
  ShieldCheck,
  Plus,
  RefreshCw,
  Building2,
  Globe,
  MapPin,
  Building,
  User,
  Phone,
  Edit3,
  CheckCircle2,
  Save,
  X,
  ExternalLink,
} from "lucide-react";
import { HrProfileData } from "@/lib/hr-profile-store";

export default function HrDashboardPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    activeJobsCount: 0,
    screenedCount: 0,
    assessmentsCount: 0,
    pendingApprovalsCount: 0,
    interviewsCount: 0,
    offersCount: 0,
    onboardingCount: 0,
  });
  const [recentCandidates, setRecentCandidates] = useState<any[]>([]);

  // HR Profile State
  const [hrProfile, setHrProfile] = useState<HrProfileData | null>(null);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileFullName, setProfileFullName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileDesignation, setProfileDesignation] = useState("");
  const [profileCompanyName, setProfileCompanyName] = useState("");
  const [profileCompanyWebsite, setProfileCompanyWebsite] = useState("");
  const [profileCompanySize, setProfileCompanySize] = useState("51-200 Employees");
  const [profileIndustry, setProfileIndustry] = useState("Software & Technology");
  const [profileOfficeLocation, setProfileOfficeLocation] = useState("");
  const [profileCompanyBio, setProfileCompanyBio] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState("");

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [dashRes, profileRes] = await Promise.all([
        fetch("/api/hr/dashboard"),
        fetch(`/api/hr/profile${session?.user?.email ? `?email=${encodeURIComponent(session.user.email)}` : ""}`),
      ]);

      const [dashData, profileData] = await Promise.all([dashRes.json(), profileRes.json()]);

      if (dashData.success) {
        setStats(dashData.stats);
        setRecentCandidates(dashData.recentCandidates || []);
      }

      if (profileData.success && profileData.profile) {
        const p = profileData.profile;
        setHrProfile(p);
        setProfileFullName(p.fullName || session?.user?.name || "");
        setProfilePhone(p.phone || "");
        setProfileDesignation(p.designation || "");
        setProfileCompanyName(p.companyName || "");
        setProfileCompanyWebsite(p.companyWebsite || "");
        setProfileCompanySize(p.companySize || "51-200 Employees");
        setProfileIndustry(p.industry || "Software & Technology");
        setProfileOfficeLocation(p.officeLocation || "");
        setProfileCompanyBio(p.companyBio || "");

        // Auto-open edit mode if profile is fresh and incomplete
        if (!p.isProfileComplete) {
          setIsEditingProfile(true);
        }
      }
    } catch (e) {
      console.error("Failed to load HR dashboard data", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [session?.user?.email]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccessMsg("");

    try {
      const res = await fetch("/api/hr/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: session?.user?.email,
          fullName: profileFullName,
          phone: profilePhone,
          designation: profileDesignation,
          companyName: profileCompanyName,
          companyWebsite: profileCompanyWebsite,
          companySize: profileCompanySize,
          industry: profileIndustry,
          officeLocation: profileOfficeLocation,
          companyBio: profileCompanyBio,
        }),
      });

      const data = await res.json();
      if (data.success && data.profile) {
        setHrProfile(data.profile);
        setIsEditingProfile(false);
        setProfileSuccessMsg("HR & Company Profile saved successfully!");
        setTimeout(() => setProfileSuccessMsg(""), 4000);
      }
    } catch (e) {
      console.error("Failed to save HR profile", e);
    } finally {
      setSavingProfile(false);
    }
  };

  const metricCards = [
    {
      label: "Active Job Openings",
      value: stats.activeJobsCount,
      change: stats.activeJobsCount === 0 ? "No active listings" : `${stats.activeJobsCount} published`,
      icon: Briefcase,
      color: "text-blue-600 bg-blue-50 border-blue-200",
      link: "/hr/jobs",
    },
    {
      label: "Screened Resumes",
      value: stats.screenedCount,
      change: stats.screenedCount === 0 ? "Awaiting applicants" : "AI evaluated",
      icon: Users,
      color: "text-indigo-600 bg-indigo-50 border-indigo-200",
      link: "/hr/candidates",
    },
    {
      label: "Proctored Tests",
      value: stats.assessmentsCount,
      change: stats.assessmentsCount === 0 ? "None completed" : "Integrity audited",
      icon: ShieldCheck,
      color: "text-cyan-600 bg-cyan-50 border-cyan-200",
      link: "/hr/candidates",
    },
    {
      label: "Pending HR Approvals",
      value: stats.pendingApprovalsCount,
      change: stats.pendingApprovalsCount === 0 ? "All caught up" : "Action required",
      icon: Clock,
      color: "text-amber-600 bg-amber-50 border-amber-200",
      link: "/hr/approvals",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recruiter Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Recruitment Overview
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your company profile, post openings, review AI rubrics, and approve candidate offers.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
            title="Refresh statistics"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-blue-600" : ""}`} />
          </button>
          <Link
            href="/hr/jobs/new"
            className="px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Job Posting</span>
          </Link>
        </div>
      </div>

      {/* Success Notification */}
      {profileSuccessMsg && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-medium">{profileSuccessMsg}</span>
        </div>
      )}

      {/* Recruiter & Company Profile Card */}
      <div className="mb-8 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {!isEditingProfile ? (
          // View Mode
          <div className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 shrink-0 font-bold text-xl">
                  {hrProfile?.companyName
                    ? hrProfile.companyName.charAt(0).toUpperCase()
                    : <Building2 className="w-7 h-7" />}
                </div>
                <div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <h2 className="text-xl font-bold text-slate-900">
                      {hrProfile?.companyName || "Company Name Pending"}
                    </h2>
                    {hrProfile?.isProfileComplete ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3 h-3" />
                        Profile Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Setup Incomplete
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-600 mt-1">
                    <span className="font-semibold text-slate-800">
                      {hrProfile?.fullName || session?.user?.name || "HR Recruiter"}
                    </span>
                    {hrProfile?.designation && ` • ${hrProfile.designation}`}
                    <span className="text-slate-400"> ({session?.user?.email})</span>
                  </p>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-3 flex-wrap">
                    {hrProfile?.officeLocation && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hrProfile.officeLocation}</span>
                      </div>
                    )}
                    {hrProfile?.companySize && (
                      <div className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hrProfile.companySize}</span>
                      </div>
                    )}
                    {hrProfile?.industry && (
                      <div className="flex items-center gap-1">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{hrProfile.industry}</span>
                      </div>
                    )}
                    {hrProfile?.companyWebsite && (
                      <a
                        href={hrProfile.companyWebsite.startsWith("http") ? hrProfile.companyWebsite : `https://${hrProfile.companyWebsite}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 text-blue-600 hover:underline"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        <span>{hrProfile.companyWebsite.replace(/^https?:\/\//, "")}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    )}
                  </div>

                  {hrProfile?.companyBio && (
                    <p className="text-xs text-slate-500 mt-3 line-clamp-2 max-w-3xl">
                      {hrProfile.companyBio}
                    </p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setIsEditingProfile(true)}
                className="self-start sm:self-auto px-4 py-2 text-xs font-semibold rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 transition flex items-center gap-1.5 shadow-sm"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-500" />
                <span>{hrProfile?.isProfileComplete ? "Edit Profile" : "Complete Profile"}</span>
              </button>
            </div>
          </div>
        ) : (
          // Edit Mode
          <form onSubmit={handleSaveProfile} className="p-6">
            <div className="flex items-center justify-between border-b pb-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600" />
                  <span>Recruiter & Company Profile</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  This identity appears across your job listings, candidate interview invites, and formal offer letters.
                </p>
              </div>
              {hrProfile?.isProfileComplete && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              {/* Recruiter Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Your Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profileFullName}
                    onChange={(e) => setProfileFullName(e.target.value)}
                    placeholder="e.g. Sarah Jenkins"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Recruiter Designation */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  HR Role / Designation *
                </label>
                <input
                  type="text"
                  required
                  value={profileDesignation}
                  onChange={(e) => setProfileDesignation(e.target.value)}
                  placeholder="e.g. Lead Technical Recruiter or VP of People"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Work Email (Readonly) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Email (Authenticated via Google)
                </label>
                <input
                  type="email"
                  disabled
                  value={session?.user?.email || ""}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 text-sm cursor-not-allowed"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="tel"
                    value={profilePhone}
                    onChange={(e) => setProfilePhone(e.target.value)}
                    placeholder="e.g. +1 (555) 234-5678"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={profileCompanyName}
                    onChange={(e) => setProfileCompanyName(e.target.value)}
                    placeholder="e.g. Apex AI Systems"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Company Website */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="url"
                    value={profileCompanyWebsite}
                    onChange={(e) => setProfileCompanyWebsite(e.target.value)}
                    placeholder="e.g. https://apex-ai.io"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Company Size */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Size
                </label>
                <select
                  value={profileCompanySize}
                  onChange={(e) => setProfileCompanySize(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="1-10 Employees">1-10 Employees (Startup / Seed)</option>
                  <option value="11-50 Employees">11-50 Employees (Early Stage)</option>
                  <option value="51-200 Employees">51-200 Employees (Growth / Series A-B)</option>
                  <option value="201-500 Employees">201-500 Employees (Mid-Market)</option>
                  <option value="500+ Employees">500+ Employees (Enterprise)</option>
                </select>
              </div>

              {/* Industry */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Industry / Sector
                </label>
                <select
                  value={profileIndustry}
                  onChange={(e) => setProfileIndustry(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="AI & Machine Learning">AI & Machine Learning</option>
                  <option value="Financial Services / FinTech">Financial Services / FinTech</option>
                  <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                  <option value="E-Commerce & Logistics">E-Commerce & Logistics</option>
                  <option value="Digital Media & Entertainment">Digital Media & Entertainment</option>
                  <option value="Consulting & Agency">Consulting & Agency</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Office Location */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Headquarters / Office Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={profileOfficeLocation}
                    onChange={(e) => setProfileOfficeLocation(e.target.value)}
                    placeholder="e.g. San Francisco, CA (or Remote / Global)"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Company Overview / Bio */}
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Company Overview & Hiring Mission
                </label>
                <textarea
                  rows={3}
                  value={profileCompanyBio}
                  onChange={(e) => setProfileCompanyBio(e.target.value)}
                  placeholder="Describe your company's core mission, product, and work culture..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t">
              {hrProfile?.isProfileComplete && (
                <button
                  type="button"
                  onClick={() => setIsEditingProfile(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                >
                  Cancel
                </button>
              )}
              <button
                type="submit"
                disabled={savingProfile}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition shadow-md shadow-blue-500/20 flex items-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                <span>{savingProfile ? "Saving Profile..." : "Save Company & HR Profile"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {metricCards.map((s, idx) => {
          const Icon = s.icon;
          return (
            <Link
              key={idx}
              href={s.link}
              className="bg-white rounded-2xl border p-5 border-slate-200 shadow-sm hover:border-slate-300 transition block"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-500">{s.label}</span>
                <div className={`p-2 rounded-xl border ${s.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900">{s.value}</div>
              <div className="text-xs text-slate-500 mt-1 font-medium">{s.change}</div>
            </Link>
          );
        })}
      </div>

      {/* Complete Recruitment & Onboarding Lifecycle Funnel */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm mb-10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Recruitment & Onboarding Lifecycle Funnel
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live candidate volume progression through all 7 platform stages.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Realtime DB Sync
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3 text-center">
          {[
            {
              step: "1. Jobs",
              count: stats.activeJobsCount,
              label: "Active Roles",
              color: "bg-blue-50 text-blue-700 border-blue-200",
            },
            {
              step: "2. Screened",
              count: stats.screenedCount,
              label: "AI Evaluated",
              color: "bg-indigo-50 text-indigo-700 border-indigo-200",
            },
            {
              step: "3. Assessed",
              count: stats.assessmentsCount,
              label: "Proctored Tests",
              color: "bg-cyan-50 text-cyan-700 border-cyan-200",
            },
            {
              step: "4. Interview",
              count: stats.interviewsCount,
              label: "AI Co-Pilot",
              color: "bg-purple-50 text-purple-700 border-purple-200",
            },
            {
              step: "5. Approved",
              count: stats.pendingApprovalsCount,
              label: "HR Approvals",
              color: "bg-amber-50 text-amber-700 border-amber-200",
            },
            {
              step: "6. Offers",
              count: stats.offersCount,
              label: "Dispatched",
              color: "bg-emerald-50 text-emerald-700 border-emerald-200",
            },
            {
              step: "7. Onboard",
              count: stats.onboardingCount,
              label: "Active Hires",
              color: "bg-teal-50 text-teal-700 border-teal-200",
            },
          ].map((item, idx) => (
            <div key={idx} className={`p-3.5 rounded-2xl border ${item.color}`}>
              <span className="text-[10px] font-bold uppercase tracking-wider block opacity-75">
                {item.step}
              </span>
              <span className="text-xl font-black mt-1 block">{item.count}</span>
              <span className="text-[10px] font-medium opacity-80 mt-0.5 block">{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Candidate Pipeline Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Candidate Pipeline</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              AI screening scores, assessment results, and current review states.
            </p>
          </div>
          {recentCandidates.length > 0 && (
            <Link
              href="/hr/candidates"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
            >
              View All Candidates &rarr;
            </Link>
          )}
        </div>

        {recentCandidates.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200">
              <Users className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No Candidates in Pipeline Yet</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1 mb-6">
              Post a job opening to start receiving real applications. Candidate resumes will be
              automatically screened with Gemini AI, rubrics will be generated, and candidates will
              progress through assessments and interviews.
            </p>
            <Link
              href="/hr/jobs/new"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Post Your First Job Opening</span>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/75 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Candidate</th>
                  <th className="py-3.5 px-6">Target Role</th>
                  <th className="py-3.5 px-6">AI Match</th>
                  <th className="py-3.5 px-6">Assessment</th>
                  <th className="py-3.5 px-6">Stage</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentCandidates.map((c, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition">
                    <td className="py-4 px-6 font-semibold text-slate-900">{c.name}</td>
                    <td className="py-4 px-6 text-slate-600">{c.role}</td>
                    <td className="py-4 px-6">
                      {c.matchScore !== null ? (
                        <span className="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full text-xs border border-blue-200">
                          <Sparkles className="w-3 h-3 text-blue-600" />
                          {c.matchScore}%
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Not Screened</span>
                      )}
                    </td>
                    <td className="py-4 px-6 font-medium text-slate-700">{c.assessmentScore}</td>
                    <td className="py-4 px-6">
                      <span
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${c.statusColor}`}
                      >
                        {c.statusLabel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <Link
                        href="/hr/candidates"
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        View AI Diagnostics &rarr;
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
