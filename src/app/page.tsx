import Link from "next/link";
import {
  FileText,
  ScanText,
  ShieldCheck,
  Video,
  UserCheck,
  FileCheck2,
  Users2,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle,
} from "lucide-react";

export default function HomePage() {
  const workflowSteps = [
    {
      num: "01",
      title: "HR Uploads Job Description",
      desc: "Define roles, core skills, qualifications, and experience parameters.",
      icon: FileText,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      num: "02",
      title: "AI Resume Screening",
      desc: "Automated parsing, candidate qualification matching, and suitability ranking.",
      icon: ScanText,
      color: "bg-indigo-50 text-indigo-600 border-indigo-200",
    },
    {
      num: "03",
      title: "AI Assessment & Proctoring",
      desc: "Technical & aptitude tests with real-time integrity and tab-switch monitoring.",
      icon: ShieldCheck,
      color: "bg-cyan-50 text-cyan-600 border-cyan-200",
    },
    {
      num: "04",
      title: "Interview Management",
      desc: "Intelligent scheduling, tailored AI question generator, and interview scorecards.",
      icon: Video,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      num: "05",
      title: "Human HR Approval",
      desc: "Comprehensive review of all candidate scores with final decision control.",
      icon: UserCheck,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
    {
      num: "06",
      title: "Offer Letter Generation",
      desc: "Instant dynamic offer letter creation with trackable digital acceptance.",
      icon: FileCheck2,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      num: "07",
      title: "Automated Onboarding",
      desc: "Employee document upload, profile creation, and interactive orientation checklist.",
      icon: Users2,
      color: "bg-teal-50 text-teal-600 border-teal-200",
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-28 bg-gradient-to-b from-blue-50/50 via-white to-slate-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-100/70 border border-blue-200 text-blue-800 text-xs font-semibold mb-6">
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>AI-Powered Recruitment & Employee Onboarding</span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Smarter Hiring. <span className="text-blue-600">Seamless Onboarding.</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate repetitive recruiting busywork while keeping critical decisions in human hands.
            Screen resumes, conduct proctored assessments, and onboard top talent in one cohesive platform.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/candidate/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition flex items-center justify-center gap-2"
            >
              <span>Candidate Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/hr/login"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 shadow-sm transition flex items-center justify-center gap-2"
            >
              <span>HR Recruiter Portal</span>
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            </Link>
          </div>

          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Google OAuth Login</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>100% Free Gemini AI Engine</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
              <span>Built-in Proctoring Telemetry</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7-Step Workflow Process */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              The Complete HireFlow Lifecycle
            </h2>
            <p className="mt-3 text-base text-slate-600">
              An automated, audited pipeline connecting candidate applications directly to employee orientation.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {workflowSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div
                  key={idx}
                  className="relative group p-6 rounded-2xl border bg-white hover:shadow-lg hover:border-blue-200 transition-all duration-300"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center border ${step.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-slate-400">{step.num}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 bg-slate-900 text-slate-400 text-sm border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded bg-blue-600 flex items-center justify-center text-white text-xs font-bold">
              H
            </div>
            <span className="text-white font-semibold">HireFlow AI</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <p className="text-xs text-slate-500">
            Powered by Next.js, Prisma, PostgreSQL & Google Gemini Free Tier.
          </p>
        </div>
      </footer>
    </div>
  );
}
