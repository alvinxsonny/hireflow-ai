"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  UserCheck,
  CheckCircle2,
  FileCheck2,
  DollarSign,
  Calendar,
  Sparkles,
  ShieldCheck,
  Award,
  ArrowRight,
  ExternalLink,
  Plus,
} from "lucide-react";

export default function HrApprovalsPage() {
  const [candidates, setCandidates] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Offer generator modal
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any | null>(null);
  const [designation, setDesignation] = useState("");
  const [offeredSalary, setOfferedSalary] = useState(135000);
  const [joiningDate, setJoiningDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appRes, offRes] = await Promise.all([
        fetch("/api/applications"),
        fetch("/api/offers"),
      ]);
      const [appData, offData] = await Promise.all([appRes.json(), offRes.json()]);

      if (appData.success) {
        setCandidates(appData.applications || []);
      }
      if (offData.success) {
        setOffers(offData.offers || []);
      }
    } catch (e) {
      console.error("Failed to load approvals", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenOfferModal = (candidate: any) => {
    setSelectedCandidate(candidate);
    setDesignation(candidate.jobTitle);
    const nextMonth = new Date();
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setJoiningDate(nextMonth.toISOString().split("T")[0]);

    const expDate = new Date();
    expDate.setDate(expDate.getDate() + 7);
    setExpiryDate(expDate.toISOString().split("T")[0]);

    setShowOfferModal(true);
  };

  const handleGenerateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate) return;

    setIsGenerating(true);
    try {
      const res = await fetch("/api/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId: selectedCandidate.id,
          designation,
          offeredSalary,
          joiningDate,
          expiryDate,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setOffers((prev) => [data.offer, ...prev]);
        setShowOfferModal(false);
        setSuccessMsg(`🎉 Official offer letter generated and dispatched to ${selectedCandidate.candidateName}!`);
        fetchData();
      }
    } catch (e) {
      console.error("Failed to generate offer", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Candidates awaiting HR approval (HR_REVIEW, SHORTLISTED, or ASSESSMENT_COMPLETED)
  const pendingApprovalCandidates = candidates.filter(
    (c) => c.status === "HR_REVIEW" || c.status === "ASSESSMENT_COMPLETED" || c.status === "SHORTLISTED"
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Stage 5: Human HR Final Approval & Stage 6: Offer Letters</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Final Candidate Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review comprehensive lifecycle scores across Resume AI Match, Proctored Assessment, and Interview notes.
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center justify-between border border-emerald-200">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg("")} className="text-emerald-600">✕</button>
        </div>
      )}

      {/* Section 1: Candidates Ready for Final Sign-Off */}
      <div className="mb-12">
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600" />
          <span>Candidates Ready for Final Offer Approval ({pendingApprovalCandidates.length})</span>
        </h2>

        {pendingApprovalCandidates.length === 0 ? (
          <div className="p-8 rounded-2xl bg-white border border-slate-200 text-center text-slate-400 text-xs">
            No candidates currently in final review stage.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingApprovalCandidates.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                      {c.status}
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {c.matchScore ? `${c.matchScore}% AI Match` : "Screened"}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-slate-900">{c.candidateName}</h3>
                  <p className="text-xs text-slate-500">{c.jobTitle}</p>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Proctored Assessment:</span>
                      <span className="font-bold text-slate-800">Passed (88%)</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Interview Rating:</span>
                      <span className="font-bold text-blue-600">Strong Hire (4.5/5)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t flex items-center justify-between">
                  <Link
                    href="/hr/candidates"
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    View Scores
                  </Link>

                  <button
                    onClick={() => handleOpenOfferModal(c)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition flex items-center gap-1.5"
                  >
                    <FileCheck2 className="w-3.5 h-3.5" />
                    <span>Approve & Issue Offer</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 2: Dispatched & Tracked Offer Letters */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileCheck2 className="w-4 h-4 text-emerald-600" />
          <span>Active Offer Letters & Acceptance Telemetry ({offers.length})</span>
        </h2>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Candidate</th>
                <th className="py-3.5 px-6">Official Title</th>
                <th className="py-3.5 px-6">Offered Salary</th>
                <th className="py-3.5 px-6">Joining Date</th>
                <th className="py-3.5 px-6">Offer Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {offers.map((offer) => (
                <tr key={offer.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6 font-semibold text-slate-900">{offer.candidateName}</td>
                  <td className="py-4 px-6 text-xs text-slate-600 font-medium">{offer.designation}</td>
                  <td className="py-4 px-6 font-bold text-emerald-600">
                    ${offer.offeredSalary.toLocaleString()}/yr
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">{offer.joiningDate}</td>
                  <td className="py-4 px-6">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                        offer.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : offer.status === "DECLINED"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      }`}
                    >
                      {offer.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/candidate/offers/${offer.id}`}
                      target="_blank"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                    >
                      <span>View Offer Doc</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Offer Letter Creator Modal */}
      {showOfferModal && selectedCandidate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-8 shadow-2xl border border-slate-100 my-8">
            <div className="flex items-center justify-between pb-4 border-b mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Issue Official Offer Letter</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Candidate: <strong>{selectedCandidate.candidateName}</strong>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowOfferModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleGenerateOffer} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Official Job Designation / Title *
                </label>
                <input
                  type="text"
                  required
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Annual Base Compensation ($ USD / year) *
                </label>
                <input
                  type="number"
                  required
                  step={5000}
                  value={offeredSalary}
                  onChange={(e) => setOfferedSalary(parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Target Start Date *</label>
                  <input
                    type="date"
                    required
                    value={joiningDate}
                    onChange={(e) => setJoiningDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Offer Expiration Date</label>
                  <input
                    type="date"
                    required
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 bg-white"
                  />
                </div>
              </div>

              <div className="pt-4 border-t flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowOfferModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="px-6 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Dispatching Offer Letter...</span>
                    </>
                  ) : (
                    <>
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Approve & Dispatch Offer</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
