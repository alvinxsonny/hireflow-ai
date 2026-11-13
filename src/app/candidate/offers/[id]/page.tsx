"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  FileCheck2,
  Sparkles,
  Building2,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
} from "lucide-react";

export default function CandidateOfferPage() {
  const params = useParams();
  const router = useRouter();
  const offerId = params.id as string;

  const [offer, setOffer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Signature state
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signedSuccess, setSignedSuccess] = useState(false);

  useEffect(() => {
    fetch("/api/offers")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.offers) {
          const found = data.offers.find((o: any) => o.id === offerId);
          if (found) {
            setOffer(found);
            if (found.status === "ACCEPTED") {
              setSignedSuccess(true);
            }
          }
        }
      })
      .finally(() => setLoading(false));
  }, [offerId]);

  // Setup canvas drawing handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawn(true);

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1d4ed8"; // Blue ink
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
  };

  const handleSignOffer = async (accept: boolean) => {
    if (accept && !hasDrawn && !canvasRef.current) {
      alert("Please draw your signature in the signature box before accepting.");
      return;
    }

    setIsSigning(true);
    let signatureUrl = "";
    if (canvasRef.current) {
      signatureUrl = canvasRef.current.toDataURL("image/png");
    }

    try {
      const res = await fetch(`/api/offers/${offerId}/sign`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signatureDataUrl: signatureUrl,
          accept,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSignedSuccess(true);
        setOffer(data.offer);
      }
    } catch (e) {
      console.error("Signature submission failed", e);
    } finally {
      setIsSigning(false);
    }
  };

  if (loading) {
    return <div className="max-w-4xl mx-auto py-24 text-center text-slate-400">Loading offer letter...</div>;
  }

  if (!offer) {
    return (
      <div className="max-w-4xl mx-auto py-24 text-center">
        <h2 className="text-xl font-bold text-slate-800">Offer Letter Not Found</h2>
        <Link href="/candidate/dashboard" className="text-xs text-blue-600 hover:underline mt-2 inline-block">
          &larr; Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/candidate/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <span>&larr; Back to Candidate Dashboard</span>
      </Link>

      {/* Official Offer Document Container */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 relative overflow-hidden">
        {/* Document Letterhead */}
        <div className="flex items-start justify-between border-b pb-8 mb-8">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              H
            </div>
            <div>
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">HireFlow AI Inc.</span>
              <p className="text-xs text-slate-400">Official Employment Offer & Agreement</p>
            </div>
          </div>

          <div className="text-right text-xs text-slate-500">
            <div>Date of Issue: <strong>{new Date(offer.createdAt).toLocaleDateString()}</strong></div>
            <div>Valid Until: <strong className="text-amber-600">{offer.expiryDate}</strong></div>
          </div>
        </div>

        {/* Status Stamp if Accepted */}
        {signedSuccess && (
          <div className="mb-8 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5 text-emerald-800 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Offer Accepted & Electronically Signed</span>
            </div>
            <Link
              href="/candidate/onboarding"
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition flex items-center gap-1.5"
            >
              <span>Begin Employee Onboarding</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}

        {/* Letter Body */}
        <div className="prose prose-slate max-w-none text-xs sm:text-sm text-slate-700 leading-relaxed space-y-5">
          <p>
            Dear <strong>{offer.candidateName}</strong>,
          </p>

          <p>
            On behalf of <strong>HireFlow AI Inc.</strong>, we are thrilled to formally extend this offer of employment for the position of <strong>{offer.designation}</strong>. Based on your impressive technical assessment results, portfolio achievements, and interview discussions, our team is confident you will make exceptional contributions to our engineering mission.
          </p>

          <div className="my-6 p-6 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 not-prose text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Official Designation</span>
              <span className="text-base font-bold text-slate-900 mt-0.5 block">{offer.designation}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Annual Base Compensation</span>
              <span className="text-base font-bold text-emerald-600 mt-0.5 block">
                ${offer.offeredSalary.toLocaleString()} USD / year
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Target Start Date</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">{offer.joiningDate}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Work Location</span>
              <span className="text-sm font-bold text-slate-900 mt-0.5 block">Remote / Hybrid Flexible</span>
            </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 not-prose mb-2">Comprehensive Benefits & Perks</h4>
          <ul className="list-disc pl-5 space-y-1 text-slate-600 text-xs">
            {offer.benefits.map((b: string, idx: number) => (
              <li key={idx}>{b}</li>
            ))}
          </ul>

          <p className="pt-2 text-xs text-slate-500">
            This offer is contingent upon successful completion of our onboarding document submission and standard background verification.
          </p>
        </div>

        {/* e-Signature Area */}
        <div className="mt-10 pt-8 border-t border-slate-200">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Electronic Signature & Acceptance</h3>
          <p className="text-xs text-slate-500 mb-4">
            Please sign below using your mouse, trackpad, or finger to confirm your acceptance of this offer.
          </p>

          {signedSuccess ? (
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <span className="text-xs font-semibold text-slate-500 block mb-2">Signed on File:</span>
              {offer.signatureDataUrl ? (
                <img
                  src={offer.signatureDataUrl}
                  alt="Candidate Signature"
                  className="mx-auto h-16 object-contain"
                />
              ) : (
                <span className="font-serif italic text-xl text-blue-700">{offer.candidateName}</span>
              )}
              <span className="text-[11px] text-slate-400 mt-2 block font-mono">
                Digitally recorded on {new Date(offer.signedAt || Date.now()).toLocaleString()}
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={150}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-36 bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl cursor-crosshair touch-none"
                />
                {!hasDrawn && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-xs text-slate-400">
                    ✍️ Draw signature here with mouse or finger
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearCanvas}
                  className="absolute bottom-3 right-3 text-[11px] font-semibold text-slate-500 hover:text-slate-800 bg-white px-2.5 py-1 rounded-lg border shadow-xs flex items-center gap-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Clear</span>
                </button>
              </div>

              <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-600">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 rounded text-blue-600 focus:ring-blue-500"
                />
                <span>
                  I, <strong>{offer.candidateName}</strong>, accept this offer of employment and agree to the terms, start date, and conditions outlined in this agreement.
                </span>
              </label>

              <div className="pt-4 flex flex-wrap items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => handleSignOffer(false)}
                  disabled={isSigning}
                  className="px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-xl transition border border-red-200"
                >
                  Decline Offer
                </button>

                <button
                  type="button"
                  onClick={() => handleSignOffer(true)}
                  disabled={!agreedToTerms || isSigning}
                  className="px-7 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-500/20 transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isSigning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Recording Signature...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Accept Offer & Proceed to Onboarding &rarr;</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
