"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Briefcase,
  Sparkles,
  ArrowLeft,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  Wand2,
} from "lucide-react";

export default function NewJobPage() {
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("Engineering");
  const [location, setLocation] = useState("Remote");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [experienceLevel, setExperienceLevel] = useState("Mid-Senior");
  const [minExperienceYears, setMinExperienceYears] = useState(3);
  const [salaryMin, setSalaryMin] = useState(100000);
  const [salaryMax, setSalaryMax] = useState(140000);
  const [description, setDescription] = useState("");
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    "TypeScript",
    "React",
    "Node.js",
  ]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>(["Docker", "Tailwind CSS"]);

  // Tag input temp state
  const [reqSkillInput, setReqSkillInput] = useState("");
  const [prefSkillInput, setPrefSkillInput] = useState("");

  // AI Assistant state
  const [roughNotes, setRoughNotes] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiMessage, setAiMessage] = useState("");

  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/hr/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.profile?.officeLocation) {
          setLocation(data.profile.officeLocation);
        }
      })
      .catch(() => {});
  }, []);

  const handleAddReqSkill = () => {
    const val = reqSkillInput.trim();
    if (val && !requiredSkills.includes(val)) {
      setRequiredSkills([...requiredSkills, val]);
      setReqSkillInput("");
    }
  };

  const handleRemoveReqSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter((s) => s !== skill));
  };

  const handleAddPrefSkill = () => {
    const val = prefSkillInput.trim();
    if (val && !preferredSkills.includes(val)) {
      setPreferredSkills([...preferredSkills, val]);
      setPrefSkillInput("");
    }
  };

  const handleRemovePrefSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter((s) => s !== skill));
  };

  // Call Gemini AI enhancement API
  const handleAIEnhance = async () => {
    if (!title) {
      setErrorMsg("Please enter a Job Title before asking Gemini to generate the description.");
      return;
    }

    setIsEnhancing(true);
    setAiMessage("");
    setErrorMsg("");

    try {
      const res = await fetch("/api/jobs/ai-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          roughNotes,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setDescription(json.data.description);
        if (json.data.requiredSkills && json.data.requiredSkills.length > 0) {
          setRequiredSkills(json.data.requiredSkills);
        }
        if (json.data.preferredSkills && json.data.preferredSkills.length > 0) {
          setPreferredSkills(json.data.preferredSkills);
        }
        if (json.data.minExperienceYears) {
          setMinExperienceYears(json.data.minExperienceYears);
        }
        if (json.data.experienceLevel) {
          setExperienceLevel(json.data.experienceLevel);
        }
        setAiMessage("✨ Job description and skills enhanced by Gemini AI!");
      } else {
        setErrorMsg(json.error || "Failed to generate AI description");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to connect to AI service.");
    } finally {
      setIsEnhancing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !location || !description) {
      setErrorMsg("Please fill in Title, Location, and Description.");
      return;
    }

    setIsSaving(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          department,
          location,
          employmentType,
          experienceLevel,
          minExperienceYears,
          salaryRangeMin: salaryMin,
          salaryRangeMax: salaryMax,
          description,
          requiredSkills,
          preferredSkills,
          status: "PUBLISHED",
        }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/hr/jobs");
      } else {
        setErrorMsg(data.error || "Failed to create job posting");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to submit job");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link
        href="/hr/jobs"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Job Openings</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="flex items-center justify-between pb-6 border-b mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-2">
              <Briefcase className="w-3 h-3" />
              <span>Step 1: Define Role & Requirements</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Create Job Posting</h1>
            <p className="text-xs text-slate-500 mt-1">
              Provide the role specifications. Our AI screening system will match candidate resumes
              directly against these parameters.
            </p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 text-red-700 text-xs flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Job Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Lead Frontend Architect"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Department
              </label>
              <select
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Engineering">Engineering</option>
                <option value="AI Research">AI Research</option>
                <option value="Design">Design</option>
                <option value="Product">Product</option>
                <option value="Marketing">Marketing</option>
                <option value="Operations">Operations</option>
              </select>
            </div>
          </div>

          {/* Location & Employment Type */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Remote, or New York, NY"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Employment Type
              </label>
              <select
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-white"
              >
                <option value="Entry">Entry (0-2 yrs)</option>
                <option value="Mid">Mid (2-4 yrs)</option>
                <option value="Mid-Senior">Mid-Senior (4-6 yrs)</option>
                <option value="Senior">Senior (6+ yrs)</option>
                <option value="Lead / Executive">Lead / Executive</option>
              </select>
            </div>
          </div>

          {/* Min Years & Salary Range */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Min. Years Experience
              </label>
              <input
                type="number"
                min={0}
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Salary Min ($ USD)
              </label>
              <input
                type="number"
                step={5000}
                value={salaryMin}
                onChange={(e) => setSalaryMin(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Salary Max ($ USD)
              </label>
              <input
                type="number"
                step={5000}
                value={salaryMax}
                onChange={(e) => setSalaryMax(parseInt(e.target.value) || 0)}
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Gemini AI Job Enhancer Box */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-blue-900">
                  Gemini AI Job Description Generator
                </span>
              </div>
              <button
                type="button"
                onClick={handleAIEnhance}
                disabled={isEnhancing}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition disabled:opacity-60"
              >
                {isEnhancing ? (
                  <>
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Generating with Gemini...</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    <span>Generate & Enhance with AI</span>
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-slate-600 mb-3">
              Optional: Enter rough bullets or specific team requirements below, then click generate.
              Gemini will structure the full description, responsibilities, and key skills tags.
            </p>

            <input
              type="text"
              value={roughNotes}
              onChange={(e) => setRoughNotes(e.target.value)}
              placeholder="e.g. Needs experience with React 19, high scale payments, and leading sprint planning"
              className="w-full px-3 py-2 text-xs rounded-xl border border-blue-200 bg-white/80 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />

            {aiMessage && (
              <p className="mt-2 text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>{aiMessage}</span>
              </p>
            )}
          </div>

          {/* Job Description (Markdown/Text) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Full Job Description (Markdown supported) *
            </label>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="### About the Role&#10;Describe the team, mission, and scope...&#10;&#10;### Key Responsibilities&#10;- Architect scalable features...&#10;&#10;### Qualifications&#10;- Demonstrated experience in..."
              className="w-full px-3.5 py-3 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono"
            />
          </div>

          {/* Required Skills Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Required Skills (Essential for AI Screening)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={reqSkillInput}
                onChange={(e) => setReqSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddReqSkill();
                  }
                }}
                placeholder="Type skill & press Enter (e.g. Next.js, Python, PostgreSQL)"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleAddReqSkill}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-lg"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveReqSkill(skill)}
                    className="hover:text-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Preferred Skills Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Preferred Skills (Bonus points in AI scoring)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={prefSkillInput}
                onChange={(e) => setPrefSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddPrefSkill();
                  }
                }}
                placeholder="Type preferred skill & press Enter"
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <button
                type="button"
                onClick={handleAddPrefSkill}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {preferredSkills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1 text-xs font-medium bg-slate-50 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-lg"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemovePrefSkill(skill)}
                    className="hover:text-slate-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t flex items-center justify-end gap-3">
            <Link
              href="/hr/jobs"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition disabled:opacity-60 flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Publishing Job...</span>
                </>
              ) : (
                <>
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Publish Job Posting</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

