"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Briefcase,
  Plus,
  Users,
  MapPin,
  Clock,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Search,
} from "lucide-react";

export default function HrJobsListPage() {
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/jobs")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.jobs) {
          setJobs(data.jobs);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = jobs.filter(
    (j) =>
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.department.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200 mb-2">
            <Briefcase className="w-3.5 h-3.5" />
            Recruiter Control Center
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Job Openings</h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage your open positions, create AI-enhanced descriptions, and monitor incoming applicants.
          </p>
        </div>

        <Link
          href="/hr/jobs/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 transition self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Post New Job</span>
        </Link>
      </div>

      {/* Filter / Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm mb-6 flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400 ml-2" />
        <input
          type="text"
          placeholder="Filter jobs by title or department..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs focus:outline-none text-slate-800"
        />
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading job postings...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-slate-200">
          <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No jobs found</h3>
          <Link
            href="/hr/jobs/new"
            className="mt-3 inline-block text-xs font-semibold text-blue-600 hover:underline"
          >
            Create your first job posting &rarr;
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/75 border-b text-slate-500 text-xs font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6">Job Title</th>
                <th className="py-3.5 px-6">Department</th>
                <th className="py-3.5 px-6">Location</th>
                <th className="py-3.5 px-6">Applicants</th>
                <th className="py-3.5 px-6">Status</th>
                <th className="py-3.5 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-4 px-6">
                    <span className="font-bold text-slate-900 block">{j.title}</span>
                    <span className="text-xs text-slate-400">{j.employmentType}</span>
                  </td>
                  <td className="py-4 px-6 text-xs text-slate-600">{j.department}</td>
                  <td className="py-4 px-6 text-xs text-slate-600">{j.location}</td>
                  <td className="py-4 px-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                      <Users className="w-3.5 h-3.5" />
                      {j.applicantCount || 0}
                    </span>
                  </td>
                  <td className="py-4 px-6">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {j.status}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <Link
                      href={`/jobs/${j.id}`}
                      target="_blank"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline mr-4"
                    >
                      View Live
                    </Link>
                    <Link
                      href="/hr/dashboard"
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Screen Candidates &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
