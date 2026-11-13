import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  ScanText,
  FileCheck2,
  Users2,
  Video,
  Building2,
  Lock,
  Layers,
  ArrowUpRight,
} from "lucide-react";
import { LifecycleScroll } from "@/components/LifecycleScroll";

export default function HomePage() {
  return (
    <div className="flex flex-col bg-tiny-grid min-h-screen text-slate-800">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-32 border-b border-jade-900/10">
        {/* Soft radial aura on the cloudy background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-gradient-to-tr from-jade-100/40 via-emerald-100/30 to-transparent blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-jade-900/15 shadow-sm text-jade-dark text-xs font-semibold mb-6">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Autonomous Recruitment & Candidate Verification Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-jade-dark tracking-tight max-w-4xl mx-auto leading-[1.12]">
            Precision Recruitment. <br />
            <span className="bg-gradient-to-r from-jade-800 via-jade-700 to-emerald-600 bg-clip-text text-transparent">
              Frictionless Onboarding.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate recruiting busywork while retaining final human discretion. From AI resume screening and proctored integrity tests to digital offer signatures and Day One onboarding.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/candidate/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-semibold text-white bg-jade-dark hover:bg-jade-950 shadow-md shadow-jade-950/20 transition flex items-center justify-center gap-2"
            >
              <span>Candidate Portal</span>
              <ArrowRight className="w-4 h-4 text-emerald-300" />
            </Link>

            <Link
              href="/hr/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-2xl font-semibold text-jade-dark bg-white hover:bg-jade-50/60 border border-jade-900/15 shadow-sm transition flex items-center justify-center gap-2"
            >
              <Building2 className="w-4 h-4 text-jade-800" />
              <span>HR Recruiter Portal</span>
            </Link>

            <Link
              href="/jobs"
              className="w-full sm:w-auto px-5 py-3.5 rounded-2xl font-semibold text-slate-600 hover:text-jade-dark transition flex items-center justify-center gap-1.5 text-sm"
            >
              <span>Explore Roles</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Key Metrics Strip */}
          <div className="mt-16 pt-10 border-t border-jade-900/10 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-jade-dark">94%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">AI Match Precision</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-jade-dark">100%</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Integrity Monitored</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-jade-dark">&lt; 24h</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Offer Dispatch Time</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-jade-dark">Zero</div>
              <div className="text-xs text-slate-500 font-medium mt-0.5">Paperwork Onboarding</div>
            </div>
          </div>
        </div>
      </section>

      {/* Endless Horizontal Lifecycle Carousel Section */}
      <section className="py-20 md:py-28 bg-[#F5F8F6]/80 border-b border-jade-900/10 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-4">
          <LifecycleScroll />
        </div>
      </section>

      {/* Bento Grid Platform Capabilities */}
      <section className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-jade-900/15 text-jade-dark mb-2">
            <Layers className="w-3.5 h-3.5 text-jade-800" />
            Core Capabilities
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-jade-dark tracking-tight">
            Engineered for Modern Talent Teams
          </h2>
          <p className="text-sm text-slate-500 mt-2">
            Replace fragmented hiring tools with one synchronized system built on PostgreSQL and free Gemini AI.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-white rounded-3xl p-8 border border-jade-900/10 shadow-sm flex flex-col justify-between hover:border-jade-800/30 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-jade-900 text-white flex items-center justify-center mb-5 shadow-sm">
                <ScanText className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold text-jade-dark mb-2">
                Multi-Dimensional Screening
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Gemini Flash scans unstructured resumes against your job requirements, extracting verified skills, experience gaps, strengths, and candidate suitability scores.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-jade-800">
              <CheckCircle2 className="w-4 h-4 text-jade-700" />
              <span>Zero manual PDF skimming</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bg-white rounded-3xl p-8 border border-jade-900/10 shadow-sm flex flex-col justify-between hover:border-jade-800/30 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-jade-900 text-white flex items-center justify-center mb-5 shadow-sm">
                <ShieldCheck className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold text-jade-dark mb-2">
                Proctored Integrity Room
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Candidates complete dynamic timed assessments with real-time browser integrity auditing, tab-switch penalties, copy-paste guards, and live webcam verification.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-jade-800">
              <CheckCircle2 className="w-4 h-4 text-jade-700" />
              <span>Automated violation audit logs</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="bg-white rounded-3xl p-8 border border-jade-900/10 shadow-sm flex flex-col justify-between hover:border-jade-800/30 transition">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-jade-900 text-white flex items-center justify-center mb-5 shadow-sm">
                <FileCheck2 className="w-6 h-6 text-emerald-300" />
              </div>
              <h3 className="text-lg font-bold text-jade-dark mb-2">
                Digital Signature to Day One
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Generate official offer agreements branded with your company identity. Accepted offers automatically unlock the employee onboarding vault with automated ID generation.
              </p>
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs font-semibold text-jade-800">
              <CheckCircle2 className="w-4 h-4 text-jade-700" />
              <span>Canvas electronic signatures</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dark Jade Footer Banner */}
      <section className="mt-auto border-t border-jade-900/20 bg-jade-dark text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-tiny-grid-dark opacity-15 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div>
            <div className="flex items-center justify-center md:justify-start gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-emerald-300" />
              </div>
              <span className="font-bold text-lg tracking-tight">HireFlow AI</span>
            </div>
            <p className="text-xs text-emerald-100/70 max-w-md">
              Full-stack AI recruitment lifecycle built with Next.js 14, Neon PostgreSQL, and Google Gemini API.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/candidate/login"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-jade-dark bg-white hover:bg-emerald-50 transition shadow-sm"
            >
              Candidate Login
            </Link>
            <Link
              href="/hr/login"
              className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-jade-800 hover:bg-jade-700 border border-emerald-400/30 transition shadow-sm"
            >
              HR Login
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
