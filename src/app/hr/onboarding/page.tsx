"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users2,
  CheckCircle2,
  Briefcase,
  Building2,
  Calendar,
  User,
  Mail,
  MapPin,
  DollarSign,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from "lucide-react";

export default function HrOnboardingPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeProfile, setActiveProfile] = useState<any | null>(null);

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-jade-50 text-jade-800 border border-jade-200/80 mb-2">
            <Users2 className="w-3.5 h-3.5 text-jade-700" />
            <span>Stage 7: Employee Registry & Pre-boarding</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            New Hire Onboarding Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Official employee directory of accepted candidates with provisioned employee IDs and start dates.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading new hires...</div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-8">
          <Users2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Onboarding Employees Yet</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Once a candidate signs and accepts their official offer letter, their employee credentials and record will automatically appear here.
          </p>
          <Link
            href="/hr/candidates"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-jade-800 hover:bg-jade-900 shadow-sm transition"
          >
            <span>View Candidates Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
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
                      ? "bg-white border-jade-800 shadow-md ring-1 ring-jade-800/20"
                      : "bg-white border-slate-200/80 hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold font-mono text-jade-900 bg-jade-50 px-2.5 py-0.5 rounded-md border border-jade-200/70">
                      {p.employeeCode}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      Offer Accepted
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm">{p.candidateName}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{p.designation || p.jobTitle}</p>

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Start: {p.joiningDate}</span>
                    <span className="font-semibold text-jade-800">
                      {p.department || "Engineering"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right 2 Cols: Selected Hire Details Card */}
          {activeProfile ? (
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 mb-6">
                  <div>
                    <span className="text-xs font-bold text-jade-800 uppercase tracking-wider">
                      {activeProfile.department || "Engineering"} Team
                    </span>
                    <h2 className="text-2xl font-black text-slate-900 mt-0.5">
                      {activeProfile.candidateName}
                    </h2>
                    <p className="text-xs text-slate-500">{activeProfile.candidateEmail}</p>
                  </div>

                  <div className="bg-[#F8FAF8] border border-jade-900/10 rounded-2xl p-4 text-center shrink-0">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Employee ID
                    </span>
                    <span className="text-lg font-black text-jade-950 font-mono mt-0.5 block">
                      {activeProfile.employeeCode}
                    </span>
                  </div>
                </div>

                {/* Info Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Position / Role
                    </span>
                    <p className="text-sm font-bold text-slate-900">
                      {activeProfile.designation || activeProfile.jobTitle}
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Start / Joining Date
                    </span>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span>{activeProfile.joiningDate}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Company Organization
                    </span>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Building2 className="w-4 h-4 text-slate-400" />
                      <span>{activeProfile.companyName || "HireFlow Technologies Inc."}</span>
                    </p>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Work Location & Model
                    </span>
                    <p className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-slate-400" />
                      <span>{activeProfile.location || "Remote / Global"}</span>
                    </p>
                  </div>

                  {activeProfile.offeredSalary && (
                    <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 sm:col-span-2 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                          Agreed Compensation
                        </span>
                        <span className="text-sm font-extrabold text-emerald-950 font-mono">
                          ${activeProfile.offeredSalary.toLocaleString()} USD / year
                        </span>
                      </div>
                      <span className="text-xs font-semibold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                        Offer Signed & Verified
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-6 p-4 rounded-2xl bg-[#F8FAF8] border border-jade-900/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Pre-boarding Provisioning Complete</p>
                      <p className="text-[11px] text-slate-500">Corporate workstation and email credentials scheduled for day 1.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 uppercase">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 text-center py-20 text-slate-400 bg-white rounded-3xl border border-slate-200/80 p-8">
              Select a new hire to inspect their credentials and details.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
