"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles, User, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState } from "react";

export default function CandidateLoginPage() {
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = () => {
    setLoading(true);
    signIn("google", { callbackUrl: "/candidate/dashboard" });
  };

  const handleDemoLogin = () => {
    setLoading(true);
    signIn("demo-login", {
      email: "candidate.demo@hireflow.ai",
      role: "CANDIDATE",
      callbackUrl: "/candidate/dashboard",
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-3 border border-blue-100">
            <User className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Candidate Portal</h1>
          <p className="text-sm text-slate-500 mt-1">
            Apply for positions, take skill assessments, and track your onboarding.
          </p>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 border rounded-xl font-medium text-slate-700 bg-white hover:bg-slate-50 transition shadow-sm border-slate-200 hover:border-slate-300 disabled:opacity-60"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Continue with Google</span>
          </button>

          <div className="relative flex py-2 items-center">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="flex-shrink mx-3 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              Instant Dev Access
            </span>
            <div className="flex-grow border-t border-slate-200"></div>
          </div>

          <button
            onClick={handleDemoLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition border border-blue-200"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Fast Demo Login as Candidate</span>
          </button>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Are you an HR recruiter or manager?{" "}
            <Link href="/hr/login" className="font-semibold text-blue-600 hover:underline">
              Go to HR Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
