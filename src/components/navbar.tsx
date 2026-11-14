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
    <header className="sticky top-0 z-50 w-full border-b border-jade-900/10 bg-[#F8FAF8]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-9 w-9 rounded-xl bg-jade-900 flex items-center justify-center text-white shadow-sm shadow-jade-950/20 group-hover:bg-jade-950 transition">
            <Sparkles className="h-4.5 w-4.5 text-emerald-300" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-jade-dark">HireFlow</span>
            <span className="font-extrabold text-lg text-jade-700"> AI</span>
          </div>
        </Link>

        {/* Dynamic Context-Aware Navigation */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {!session ? (
            // Public / Landing Page Navigation
            <>
              <Link
                href="/"
                className={`transition pb-1 ${
                  pathname === "/"
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Platform
              </Link>
              <Link
                href="/jobs"
                className={`transition pb-1 ${
                  pathname.startsWith("/jobs")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Browse Roles
              </Link>
            </>
          ) : isHR ? (
            // HR / Recruiter Navigation ONLY
            <>
              <Link
                href="/hr/dashboard"
                className={`transition pb-1 ${
                  pathname === "/hr/dashboard"
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Dashboard
              </Link>
              <Link
                href="/hr/jobs"
                className={`transition pb-1 ${
                  pathname.startsWith("/hr/jobs")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Job Openings
              </Link>
              <Link
                href="/hr/candidates"
                className={`transition pb-1 ${
                  pathname.startsWith("/hr/candidates")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Candidates
              </Link>
              <Link
                href="/hr/interviews"
                className={`transition pb-1 ${
                  pathname.startsWith("/hr/interviews")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Interviews
              </Link>
              <Link
                href="/hr/approvals"
                className={`transition pb-1 ${
                  pathname.startsWith("/hr/approvals")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                Approvals & Offers
              </Link>
              <Link
                href="/hr/onboarding"
                className={`transition pb-1 ${
                  pathname.startsWith("/hr/onboarding")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
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
                className={`transition pb-1 ${
                  pathname === "/candidate/dashboard"
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
                }`}
              >
                My Applications
              </Link>
              <Link
                href="/jobs"
                className={`transition pb-1 ${
                  pathname.startsWith("/jobs")
                    ? "text-jade-900 font-bold border-b-2 border-jade-800"
                    : "text-slate-600 hover:text-jade-900"
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
            <div className="flex items-center gap-2.5">
              <div className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-white border border-jade-900/10 text-xs font-medium shadow-sm">
                {isHR ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-jade-700" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span className="font-semibold text-slate-800 max-w-[130px] truncate">
                  {session.user?.name || session.user?.email}
                </span>

                {/* Role Badges */}
                {isHR ? (
                  <span className="ml-1 text-[10px] px-2.5 py-0.5 rounded-full bg-jade-900 font-bold text-white tracking-wide uppercase">
                    HR Admin
                  </span>
                ) : (
                  <span className="ml-1 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 font-bold text-emerald-800 border border-emerald-200 tracking-wide uppercase">
                    Candidate
                  </span>
                )}
              </div>

              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-100"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <Link
                href="/candidate/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-jade-900 rounded-xl hover:bg-jade-50/70 transition"
              >
                Candidate Sign In
              </Link>
              <Link
                href="/hr/login"
                className="px-4 py-2 text-xs font-semibold text-white bg-jade-900 hover:bg-jade-950 rounded-xl shadow-sm transition flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-300" />
                <span>HR Portal</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
