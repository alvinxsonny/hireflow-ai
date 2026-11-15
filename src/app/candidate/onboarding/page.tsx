"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  Building2,
  Calendar,
  Lock,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  User,
  Mail,
  MapPin,
  DollarSign,
  Copy,
  Check,
  FileCheck2,
} from "lucide-react";
import { useSession } from "next-auth/react";

export default function CandidateOnboardingPage() {
  const { data: session } = useSession();
  const userEmail = session?.user?.email || "";

  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(false);

  useEffect(() => {
    if (!userEmail) return;
    fetchProfile();
  }, [userEmail]);

  const fetchProfile = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/onboarding?email=${encodeURIComponent(userEmail)}`);
      const data = await res.json();
      if (data.success && data.profile) {
        setProfile(data.profile);
      } else {
        setProfile(null);
      }
    } catch (e) {
      console.error("Failed to load onboarding", e);
    } finally {
      setLoading(false);
    }
  };

  const copyEmployeeId = () => {
    if (!profile?.employeeCode) return;
    navigator.clipboard.writeText(profile.employeeCode);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center text-slate-400">
        Loading employee onboarding details...
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 shadow-sm">
          <div className="w-16 h-16 rounded-3xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4 border border-amber-200">
            <Lock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Onboarding Portal Locked</h2>
          <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto leading-relaxed">
            Employee onboarding is activated only after you have completed all interview stages, received an official offer letter from HR, and digitally signed your acceptance.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/candidate/dashboard"
              className="px-6 py-2.5 rounded-xl font-bold text-xs text-white bg-jade-800 hover:bg-jade-900 shadow-sm transition flex items-center gap-2"
            >
              <span>Go to Candidate Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Welcome Hero Banner */}
      <div className="bg-gradient-to-r from-jade-950 via-jade-900 to-emerald-900 rounded-3xl p-8 sm:p-10 text-white shadow-xl mb-8 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-400/20 backdrop-blur-sm text-xs font-semibold text-emerald-200 mb-3 border border-emerald-300/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Offer Accepted • Official New Hire</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Welcome to the Team, {profile.candidateName}!
            </h1>
            <p className="mt-2 text-emerald-100/90 text-xs sm:text-sm max-w-xl leading-relaxed">
              Your offer letter has been digitally accepted and recorded in the company registry. Below is your official employee credential and company information.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/20 text-center shrink-0 min-w-[200px]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-200 block">
              Official Employee ID
            </span>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className="text-2xl font-black text-white font-mono tracking-wider">
                {profile.employeeCode}
              </span>
              <button
                onClick={copyEmployeeId}
                className="p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white transition"
                title="Copy Employee ID"
              >
                {copiedId ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            <span className="text-[11px] text-emerald-200/90 mt-1.5 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <span>Active Employee</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Selected Role & Employee Details */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
          <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
            <div className="h-10 w-10 rounded-2xl bg-jade-50 text-jade-800 flex items-center justify-center border border-jade-200/60 font-bold">
              <Briefcase className="w-5 h-5 text-jade-700" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">Your Selected Role</h2>
              <p className="text-xs text-slate-500">Official employment designation and team placement</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-jade-900/10">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Position / Job Title
              </span>
              <span className="text-base font-extrabold text-jade-950 block">
                {profile.designation || profile.jobTitle}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Department
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  {profile.department || "Engineering"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Start / Joining Date
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {profile.joiningDate}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Employment Type
                </span>
                <span className="text-xs font-bold text-slate-800">
                  {profile.employmentType || "Full-time"}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Work Location
                </span>
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {profile.location || "Remote / Global"}
                </span>
              </div>
            </div>

            {profile.offeredSalary && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                    Agreed Annual Compensation
                  </span>
                  <span className="text-sm font-black text-emerald-950 font-mono">
                    ${profile.offeredSalary.toLocaleString()} USD / year
                  </span>
                </div>
                <div className="h-8 w-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Card 2: Company Information */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 pb-5 border-b border-slate-100 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-jade-50 text-jade-800 flex items-center justify-center border border-jade-200/60 font-bold">
                <Building2 className="w-5 h-5 text-jade-700" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 tracking-tight">Company Details</h2>
                <p className="text-xs text-slate-500">Corporate organization and HR talent contact</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-[#F8FAF8] border border-jade-900/10">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Company Name
                </span>
                <span className="text-base font-extrabold text-jade-950 block">
                  {profile.companyName || "HireFlow Technologies Inc."}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  HR Talent Partner
                </span>
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-800">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>{profile.hrContactName || "Corporate HR Team"}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-mono">{profile.hrContactEmail || "talent@hireflow.ai"}</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Onboarding Status: Pre-boarding Complete</span>
                </div>
                <p className="text-[11px] text-emerald-800/80 leading-relaxed">
                  Your credentials and workstation setups are scheduled to be delivered on your official joining date ({profile.joiningDate}).
                </p>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 flex items-center justify-between gap-3">
            <Link
              href="/candidate/dashboard"
              className="w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white bg-jade-800 hover:bg-jade-900 shadow-sm transition text-center flex items-center justify-center gap-2"
            >
              <span>Return to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
