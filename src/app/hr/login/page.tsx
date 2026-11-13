"use client";

import { signIn, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, Sparkles, Building2, ArrowRight, UserCheck } from "lucide-react";
import { useState } from "react";

export default function HrLoginPage() {
  const [loading, setLoading] = useState(false);
  const { data: session, update } = useSession();
  const router = useRouter();

  const handleGoogleLogin = async () => {
    setLoading(true);
    document.cookie = "auth_portal_intent=HR; path=/; max-age=86400; SameSite=Lax";
    try {
      await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "RECRUITER" }),
      });
    } catch (e) {
      // ignore
    }
    signIn("google", { callbackUrl: "/hr/dashboard" });
  };

  const handleEnterAsHR = async () => {
    setLoading(true);
    document.cookie = "auth_portal_intent=HR; path=/; max-age=86400; SameSite=Lax";
    try {
      await fetch("/api/auth/set-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "RECRUITER" }),
      });
      await update({ role: "RECRUITER", portalAccess: "HR" });
    } catch (e) {
      console.error(e);
    }
    router.push("/hr/dashboard");
    router.refresh();
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl border shadow-xl p-8">
        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-3 border border-indigo-100">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Recruiter & HR Admin Portal
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Sign In</h1>
          <p className="text-sm text-slate-500 mt-1">
            Access job openings, AI resume rankings, assessment telemetry, and approvals.
          </p>
        </div>

        {/* If user is already authenticated with Google */}
        {session?.user && (
          <div className="mb-5 p-4 rounded-xl bg-indigo-50/70 border border-indigo-200 text-left">
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-900 mb-1">
              <UserCheck className="w-4 h-4 text-indigo-600" />
              <span>Signed In As</span>
            </div>
            <p className="text-sm font-bold text-slate-900 truncate">
              {session.user.name || session.user.email}
            </p>
            <p className="text-xs text-slate-500 truncate mb-3">{session.user.email}</p>
            <button
              onClick={handleEnterAsHR}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition shadow-sm shadow-indigo-500/20 disabled:opacity-60"
            >
              <span>Enter HR Dashboard with this Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <p className="text-[11px] text-center text-slate-500 mt-2">
              Or sign in with another account below
            </p>
          </div>
        )}

        <div className="space-y-4">
          <div>
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
            <p className="text-[11px] text-center text-slate-400 mt-1.5">
              Works with any Google account (@gmail.com or corporate domain)
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-500">
            Applying for a job?{" "}
            <Link href="/candidate/login" className="font-semibold text-indigo-600 hover:underline">
              Switch to Candidate Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
