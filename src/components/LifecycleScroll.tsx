"use client";

import { useRef, useState } from "react";
import {
  FileText,
  ScanText,
  ShieldCheck,
  Video,
  UserCheck,
  FileCheck2,
  Users2,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

interface WorkflowStep {
  num: string;
  stage: string;
  title: string;
  desc: string;
  detail: string;
  icon: any;
  metric: string;
}

const steps: WorkflowStep[] = [
  {
    num: "01",
    stage: "Role Creation",
    title: "AI Job Architecture",
    desc: "Recruiters specify titles and experience parameters. Gemini AI generates optimized job requirements, required competencies, and salary benchmarks.",
    detail: "Dynamic skill rubrics & structured taxonomy",
    icon: FileText,
    metric: "Instant AI Drafts",
  },
  {
    num: "02",
    stage: "Candidate Intake",
    title: "Resume Intelligence",
    desc: "Incoming resumes are ingested, parsed, and scored with multi-dimensional match rubrics, strengths, and missing qualifications.",
    detail: "Zero manual spreadsheet filtering",
    icon: ScanText,
    metric: "94% Match Accuracy",
  },
  {
    num: "03",
    stage: "Skill Validation",
    title: "Proctored Testing",
    desc: "Tailored technical and aptitude assessments generated dynamically. Real-time anti-cheat telemetry with tab-switch monitoring and camera lock.",
    detail: "Real-time violation telemetry audit",
    icon: ShieldCheck,
    metric: "Anti-Cheat Guard",
  },
  {
    num: "04",
    stage: "Evaluation",
    title: "AI Interview Co-Pilot",
    desc: "Intelligent scheduling with candidate-specific AI inquiry prompts and structured 1-to-5 star rubric scorecards for evaluating panels.",
    detail: "Context-aware question co-pilot",
    icon: Video,
    metric: "Co-Pilot Assisted",
  },
  {
    num: "05",
    stage: "Governance",
    title: "Human HR Approvals",
    desc: "All AI recommendations culminate in explicit human recruiter approval. Review composite screening, test integrity, and panel ratings.",
    detail: "Absolute human oversight & discretion",
    icon: UserCheck,
    metric: "Human Sign-Off",
  },
  {
    num: "06",
    stage: "Dispatch",
    title: "Digital Offer Letters",
    desc: "Instant dynamic offer generation with legal clauses, compensation breakdowns, and HTML5 canvas electronic signature execution.",
    detail: "Legally binding digital acceptance",
    icon: FileCheck2,
    metric: "Instant E-Sign",
  },
  {
    num: "07",
    stage: "Day One",
    title: "Automated Onboarding",
    desc: "Auto-generated employee IDs, drag-and-drop compliance document vaults, AI file format verification, and milestone checklists.",
    detail: "100% paperless employee launchpad",
    icon: Users2,
    metric: "Seamless Launch",
  },
];

export function LifecycleScroll() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 380;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  // Double the list for infinite marquee illusion
  const doubledSteps = [...steps, ...steps];

  return (
    <div className="relative w-full">
      {/* Controls & Section Heading */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-jade-50 text-jade-900 border border-jade-200/80 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-jade-700 animate-pulse"></span>
            End-to-End Orchestration
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-jade-dark tracking-tight">
            The HireFlow Lifecycle
          </h2>
          <p className="text-sm text-slate-500 mt-1 max-w-xl">
            A continuous loop taking talent from initial job description all the way to verified Day One onboarding.
          </p>
        </div>

        {/* Navigation Arrows */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={() => scroll("left")}
            className="w-10 h-10 rounded-xl bg-white border border-jade-900/15 flex items-center justify-center text-jade-dark hover:bg-jade-50 hover:border-jade-800 transition shadow-sm active:scale-95"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="w-10 h-10 rounded-xl bg-white border border-jade-900/15 flex items-center justify-center text-jade-dark hover:bg-jade-50 hover:border-jade-800 transition shadow-sm active:scale-95"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Endless Scroll Track with Hover-Pause */}
      <div
        className="w-full overflow-x-auto no-scrollbar py-4"
        ref={scrollRef}
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div
          className={`flex gap-5 px-4 sm:px-6 lg:px-8 ${
            isPaused ? "" : "animate-marquee"
          }`}
          style={{ width: "max-content" }}
        >
          {doubledSteps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div
                key={idx}
                className="w-[320px] sm:w-[350px] shrink-0 bg-white rounded-3xl p-6 border border-jade-900/10 shadow-sm hover:shadow-md hover:border-jade-800/40 transition-all duration-300 flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Step number + Stage badge */}
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-jade-900/20 group-hover:text-jade-900/40 transition tracking-tighter">
                      {step.num}
                    </span>
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-jade-50 text-jade-800 border border-jade-200/60 uppercase tracking-wide">
                      {step.stage}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-jade-900 text-white flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-emerald-300" />
                    </div>
                    <h3 className="text-base font-bold text-jade-dark tracking-tight">
                      {step.title}
                    </h3>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {step.desc}
                  </p>
                </div>

                {/* Footer Micro-Badge */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5 text-jade-800 font-semibold">
                    <CheckCircle2 className="w-3.5 h-3.5 text-jade-700" />
                    <span>{step.detail}</span>
                  </div>
                  <span className="font-bold text-slate-400 group-hover:text-jade-700 transition">
                    {step.metric}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
