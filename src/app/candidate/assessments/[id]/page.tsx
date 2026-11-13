"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldCheck,
  AlertTriangle,
  Clock,
  Video,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Maximize2,
  Award,
  ArrowRight,
} from "lucide-react";

export default function CandidateAssessmentPage() {
  const params = useParams();
  const router = useRouter();
  const testId = params.id as string;

  const [assessment, setAssessment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Exam flow states: "PRE_TEST" | "ACTIVE" | "COMPLETED"
  const [examState, setExamState] = useState<"PRE_TEST" | "ACTIVE" | "COMPLETED">("PRE_TEST");

  // Candidate progress
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 mins in seconds
  const [violationsCount, setViolationsCount] = useState(0);
  const [violationAlert, setViolationAlert] = useState<string | null>(null);
  const [proctoringScore, setProctoringScore] = useState(100);

  // Result state
  const [finalResult, setFinalResult] = useState<{
    score: number;
    isPassed: boolean;
    proctoringScore: number;
  } | null>(null);

  // Webcam ref
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    fetch(`/api/assessments/${testId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.assessment) {
          setAssessment(data.assessment);
          setTimeLeft((data.assessment.timeLimitMinutes || 15) * 60);
          if (data.assessment.status === "SUBMITTED") {
            setExamState("COMPLETED");
            setFinalResult({
              score: data.assessment.totalScore || 0,
              isPassed: data.assessment.isPassed || false,
              proctoringScore: data.assessment.proctoringScore || 100,
            });
          }
        }
      })
      .finally(() => setLoading(false));

    return () => {
      // Stop webcam stream on unmount
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, [testId]);

  // Request webcam permission
  const initWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 240 },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (e) {
      console.warn("Webcam access not granted or unavailable", e);
    }
  };

  // Start exam & request fullscreen
  const handleStartExam = async () => {
    await initWebcam();
    try {
      if (document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch (e) {
      console.warn("Fullscreen request declined", e);
    }
    setExamState("ACTIVE");
  };

  // Log Proctoring Infraction
  const recordInfraction = async (type: string, message: string) => {
    setViolationsCount((prev) => prev + 1);
    setViolationAlert(message);
    setTimeout(() => setViolationAlert(null), 5000);

    try {
      const res = await fetch(`/api/assessments/${testId}/violation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, message }),
      });
      const data = await res.json();
      if (data.success) {
        setProctoringScore(data.currentProctoringScore);
      }
    } catch (e) {
      console.error("Failed to log proctoring violation", e);
    }
  };

  // Setup client proctoring telemetry during ACTIVE state
  useEffect(() => {
    if (examState !== "ACTIVE") return;

    // 1. Tab Switch / Visibility change
    const handleVisibilityChange = () => {
      if (document.hidden) {
        recordInfraction(
          "TAB_SWITCH",
          "⚠️ WARNING: Tab switch detected! Leaving the assessment tab violates proctoring integrity."
        );
      }
    };

    // 2. Window Blur (e.g. clicking on another app)
    const handleWindowBlur = () => {
      recordInfraction(
        "WINDOW_BLUR",
        "⚠️ Focus lost: You clicked outside the examination window."
      );
    };

    // 3. Fullscreen exit
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        recordInfraction(
          "FULLSCREEN_EXIT",
          "⚠️ Fullscreen exited: Please maintain fullscreen mode during the exam."
        );
      }
    };

    // 4. Disable copy/paste
    const handleCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault();
      recordInfraction(
        "COPY_PASTE",
        "⚠️ Copying and pasting are disabled in this proctored environment."
      );
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleWindowBlur);
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    window.addEventListener("copy", handleCopyPaste);
    window.addEventListener("paste", handleCopyPaste);
    window.addEventListener("cut", handleCopyPaste);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleWindowBlur);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      window.removeEventListener("copy", handleCopyPaste);
      window.removeEventListener("paste", handleCopyPaste);
      window.removeEventListener("cut", handleCopyPaste);
    };
  }, [examState]);

  // Exam Countdown Timer
  useEffect(() => {
    if (examState !== "ACTIVE") return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest(); // Auto-submit when time expires
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examState, answers]);

  const handleSelectOption = (qId: string, optIndex: number) => {
    setAnswers((prev) => ({
      ...prev,
      [qId]: optIndex,
    }));
  };

  const handleSubmitTest = async () => {
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      const res = await fetch(`/api/assessments/${testId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateAnswers: answers }),
      });
      const data = await res.json();
      if (data.success) {
        setFinalResult({
          score: data.score,
          isPassed: data.isPassed,
          proctoringScore: data.proctoringScore,
        });
        setExamState("COMPLETED");
      }
    } catch (e) {
      console.error("Submission failed", e);
    }
  };

  // Format time mm:ss
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, "0")}:${rem.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center text-slate-400">
        Loading assessment environment...
      </div>
    );
  }

  if (!assessment) {
    return (
      <div className="max-w-2xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Assessment Not Found</h2>
        <Link href="/candidate/dashboard" className="text-sm text-blue-600 hover:underline mt-2 inline-block">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  // SCREEN 1: PRE-TEST CHECK
  if (examState === "PRE_TEST") {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-700 uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>AI-Proctored Candidate Assessment</span>
          </div>

          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {assessment.jobTitle} Technical & Aptitude Test
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Candidate: <strong>{assessment.candidateName}</strong> • {assessment.questions.length} Questions • {assessment.timeLimitMinutes} Minutes
          </p>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Rules */}
            <div className="space-y-4 text-xs text-slate-600">
              <h3 className="text-sm font-bold text-slate-900">Assessment Integrity Rules:</h3>
              <div className="flex items-start gap-2.5">
                <Video className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <span><strong>Webcam Monitoring:</strong> Periodic presence checks verify candidate continuity.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <Maximize2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <span><strong>Fullscreen Mode:</strong> The test runs in fullscreen. Exiting will log a proctoring infraction.</span>
              </div>
              <div className="flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span><strong>No Tab Switching:</strong> Navigating away from this window automatically reduces your integrity score.</span>
              </div>
            </div>

            {/* Webcam Test Box */}
            <div className="bg-slate-900 rounded-2xl p-4 text-center text-white flex flex-col items-center justify-center min-h-[200px] relative overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-40 object-cover rounded-xl"
              />
              <span className="text-[10px] text-slate-400 mt-2">
                Webcam activates upon clicking Start
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex items-center justify-between">
            <Link href="/candidate/dashboard" className="text-xs font-semibold text-slate-500 hover:underline">
              &larr; Back to Dashboard
            </Link>

            <button
              onClick={handleStartExam}
              className="px-6 py-3 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition flex items-center gap-2"
            >
              <span>Accept Guidelines & Start Test</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 3: EXAM COMPLETED
  if (examState === "COMPLETED" && finalResult) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-xl">
          <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-4 border ${
            finalResult.isPassed ? "bg-emerald-50 text-emerald-600 border-emerald-200" : "bg-amber-50 text-amber-600 border-amber-200"
          }`}>
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-2xl font-black text-slate-900">Assessment Completed!</h2>
          <p className="text-xs text-slate-500 mt-1">
            Your results have been processed and submitted to the HR hiring team.
          </p>

          <div className="mt-8 grid grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Test Score</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{finalResult.score}%</div>
              <span className={`text-[10px] font-bold uppercase mt-1 inline-block ${
                finalResult.isPassed ? "text-emerald-600" : "text-amber-600"
              }`}>
                {finalResult.isPassed ? "Passed (>= 60%)" : "Under Review"}
              </span>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-semibold text-slate-500 uppercase">Proctor Integrity</span>
              <div className="text-3xl font-black text-blue-600 mt-1">{finalResult.proctoringScore}%</div>
              <span className="text-[10px] font-semibold text-slate-500 mt-1 inline-block">
                {finalResult.proctoringScore >= 80 ? "Verified High Trust" : "Flagged for Review"}
              </span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/candidate/dashboard"
              className="px-6 py-2.5 rounded-xl font-semibold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
            >
              Return to Candidate Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // SCREEN 2: ACTIVE PROCTORED EXAM ROOM
  const currentQ = assessment.questions[currentQIndex];
  const isLastQ = currentQIndex === assessment.questions.length - 1;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col select-none">
      {/* Violation Alert Banner */}
      {violationAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white font-bold text-xs px-5 py-2.5 rounded-full shadow-2xl flex items-center gap-2 border border-red-400 animate-bounce">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{violationAlert}</span>
        </div>
      )}

      {/* Floating Webcam Box (Upper Right) */}
      <div className="fixed bottom-6 right-6 z-40 bg-slate-800/90 border border-slate-700 rounded-2xl p-2 shadow-2xl backdrop-blur-sm">
        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1 px-1">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            AI Proctor Active
          </span>
          <span>{proctoringScore}% Trust</span>
        </div>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-36 h-24 object-cover rounded-xl bg-black"
        />
      </div>

      {/* Top Fixed Exam Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">
            {assessment.jobTitle}
          </span>
          <div className="text-xs text-slate-400">
            Question {currentQIndex + 1} of {assessment.questions.length}
          </div>
        </div>

        {/* Timer */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl border font-mono text-sm font-bold ${
          timeLeft < 60
            ? "bg-red-500/20 text-red-400 border-red-500/50 animate-pulse"
            : timeLeft < 300
            ? "bg-amber-500/20 text-amber-400 border-amber-500/50"
            : "bg-slate-800 text-slate-200 border-slate-700"
        }`}>
          <Clock className="w-4 h-4" />
          <span>{formatTime(timeLeft)}</span>
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-10 flex flex-col justify-between">
        <div className="bg-slate-800/80 border border-slate-700 rounded-3xl p-8 shadow-xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-4 pb-3 border-b border-slate-700">
            <span className="font-semibold uppercase tracking-wider text-blue-400">
              {currentQ.type} Question
            </span>
            <span>
              {Object.keys(answers).length} of {assessment.questions.length} answered
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white mb-6 leading-relaxed">
            {currentQ.question}
          </h2>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((option: string, optIdx: number) => {
              const isSelected = answers[currentQ.id] === optIdx;
              const optionLabel = String.fromCharCode(65 + optIdx); // A, B, C, D

              return (
                <button
                  key={optIdx}
                  type="button"
                  onClick={() => handleSelectOption(currentQ.id, optIdx)}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-center gap-3.5 text-xs sm:text-sm font-medium ${
                    isSelected
                      ? "bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-500/10"
                      : "bg-slate-900/50 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600"
                  }`}
                >
                  <span
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                      isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 text-slate-400 border border-slate-700"
                    }`}
                  >
                    {optionLabel}
                  </span>
                  <span>{option}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Bottom Nav Controls */}
        <div className="mt-8 flex items-center justify-between pt-4 border-t border-slate-800">
          <button
            type="button"
            disabled={currentQIndex === 0}
            onClick={() => setCurrentQIndex((prev) => prev - 1)}
            className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition disabled:opacity-30 flex items-center gap-1.5"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-3">
            {isLastQ ? (
              <button
                type="button"
                onClick={handleSubmitTest}
                className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-500/20 transition flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Assessment</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setCurrentQIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
