"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sparkles, User, Briefcase, LogOut, ShieldCheck } from "lucide-react";
import { usePathname } from "next/navigation";

export function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const userRole = (session?.user as any)?.role;
  const isHR =
    userRole === "ADMIN" ||
    userRole === "RECRUITER" ||
    (session?.user as any)?.portalAccess === "HR";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">HireFlow</span>
            <span className="font-extrabold text-lg text-blue-600"> AI</span>
          </div>
        </Link>

        {/* Dynamic Context-Aware Navigation */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          {!session ? (
            // Public / Landing Page Navigation
            <>
              <Link
                href="/"
                className={`transition ${
                  pathname === "/" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Overview
              </Link>
              <Link
                href="/jobs"
                className={`transition ${
                  pathname.startsWith("/jobs") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Browse Jobs
              </Link>
            </>
          ) : isHR ? (
            // HR / Recruiter Navigation ONLY
            <>
              <Link
                href="/hr/dashboard"
                className={`transition ${
                  pathname === "/hr/dashboard" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/hr/jobs"
                className={`transition ${
                  pathname.startsWith("/hr/jobs") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Job Openings
              </Link>
              <Link
                href="/hr/candidates"
                className={`transition ${
                  pathname.startsWith("/hr/candidates") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Candidates
              </Link>
              <Link
                href="/hr/interviews"
                className={`transition ${
                  pathname.startsWith("/hr/interviews") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Interviews
              </Link>
              <Link
                href="/hr/approvals"
                className={`transition ${
                  pathname.startsWith("/hr/approvals") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Approvals & Offers
              </Link>
              <Link
                href="/hr/onboarding"
                className={`transition ${
                  pathname.startsWith("/hr/onboarding") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Onboarding Hub
              </Link>
            </>
          ) : (
            // Candidate Navigation ONLY (Clean & Focused)
            <>
              <Link
                href="/candidate/dashboard"
                className={`transition ${
                  pathname === "/candidate/dashboard" ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                My Dashboard
              </Link>
              <Link
                href="/jobs"
                className={`transition ${
                  pathname.startsWith("/jobs") ? "text-blue-600 font-bold" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Browse Jobs
              </Link>
            </>
          )}
        </nav>

        {/* User Profile & Auth Actions */}
        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 pl-3 pr-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
                {isHR ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="font-semibold text-slate-800 max-w-[130px] truncate">
                  {session.user?.name || session.user?.email}
                </span>

                {/* Vibrant Role Badges */}
                {isHR ? (
                  <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-indigo-50 font-bold text-indigo-700 border border-indigo-200 uppercase">
                    HR Admin
                  </span>
                ) : (
                  <span className="ml-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 font-bold text-emerald-700 border border-emerald-300 uppercase">
                    Candidate
                  </span>
                )}
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/candidate/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-xl hover:bg-slate-100 transition"
              >
                Candidate Sign In
              </Link>
              <Link
                href="/hr/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm shadow-blue-500/20 transition flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>HR Portal</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
