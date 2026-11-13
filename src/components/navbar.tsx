"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Sparkles, User, Briefcase, LogOut, ArrowRight, ShieldCheck } from "lucide-react";

export function Navbar() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role;
  const isHR = userRole === "ADMIN" || userRole === "RECRUITER" || (session?.user as any)?.portalAccess === "HR";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="h-9 w-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900">HireFlow</span>
            <span className="font-bold text-lg text-blue-600"> AI</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-blue-600 transition">
            Overview
          </Link>
          <Link href="/candidate/dashboard" className="hover:text-blue-600 transition">
            Candidate Portal
          </Link>
          <Link href="/hr/dashboard" className="hover:text-blue-600 transition">
            HR Dashboard
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {session ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 border text-xs font-medium text-slate-700">
                {isHR ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                ) : (
                  <User className="w-3.5 h-3.5 text-emerald-600" />
                )}
                <span>{session.user?.name || session.user?.email}</span>
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-white font-semibold text-slate-600 uppercase border">
                  {isHR ? "HR" : "Candidate"}
                </span>
              </div>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition"
                title="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/candidate/login"
                className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition"
              >
                Candidate Sign In
              </Link>
              <Link
                href="/hr/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Briefcase className="w-3.5 h-3.5" />
                HR Portal
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
