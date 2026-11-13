import { callGeminiWithRetry } from "@/lib/gemini";
import { JobPostingData } from "@/lib/jobs-store";

export interface AIScreeningResult {
  candidateName: string;
  candidateEmail?: string;
  yearsOfExperience: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchScore: number; // 0 to 100
  strengths: string[];
  weaknesses: string[];
  recommendation: "STRONG_SHORTLIST" | "SHORTLIST" | "NEEDS_ASSESSMENT" | "REJECT";
  summaryVerdict: string;
}

/**
 * Screen a candidate resume against a specific job posting using Gemini AI.
 */
export async function screenResumeWithAI(
  resumeText: string,
  job: JobPostingData
): Promise<AIScreeningResult> {
  const systemPrompt = `
You are an expert AI Technical Recruiter & Talent Evaluator.
Your job is to objectively analyze the candidate's resume against the target job requirements.
Evaluate their qualifications, calculate skill overlap, detect gaps, and provide a fair match score from 0 to 100.
Output ONLY valid JSON conforming to the schema.
`;

  const userPrompt = `
Target Job Details:
- Title: ${job.title}
- Department: ${job.department}
- Experience Level: ${job.experienceLevel} (Minimum ${job.minExperienceYears} years)
- Required Skills: ${job.requiredSkills.join(", ")}
- Preferred Skills: ${job.preferredSkills.join(", ")}
- Job Description:
${job.description}

Candidate Resume Text:
"""
${resumeText.slice(0, 8000)}
"""

Please evaluate the candidate and output JSON with this exact schema:
{
  "candidateName": "Extracted Candidate Name",
  "candidateEmail": "Extracted Email if present",
  "yearsOfExperience": 5,
  "matchedSkills": ["Skill 1", "Skill 2"],
  "missingSkills": ["Missing Skill A"],
  "matchScore": 88,
  "strengths": ["Strong background in Next.js", "Experience in high-traffic APIs"],
  "weaknesses": ["Lacks direct experience with pgvector"],
  "recommendation": "STRONG_SHORTLIST",
  "summaryVerdict": "Alex is an excellent match for the senior engineering role with proven TypeScript and React mastery."
}
`;

  try {
    const result = await callGeminiWithRetry<AIScreeningResult>(userPrompt, systemPrompt);
    // Sanitize score between 0 and 100
    result.matchScore = Math.min(100, Math.max(0, Math.round(result.matchScore || 70)));
    return result;
  } catch (error: any) {
    console.warn("[AI Screener] Gemini call failed, running heuristic screening fallback:", error?.message);

    // Heuristic fallback matching algorithm
    const lowerResume = (resumeText || "").toLowerCase();
    const matchedSkills = job.requiredSkills.filter((s) => lowerResume.includes(s.toLowerCase()));
    const missingSkills = job.requiredSkills.filter((s) => !lowerResume.includes(s.toLowerCase()));
    const matchedPreferred = job.preferredSkills.filter((s) => lowerResume.includes(s.toLowerCase()));

    const totalReq = job.requiredSkills.length || 1;
    const reqRatio = matchedSkills.length / totalReq;
    const prefBonus = (matchedPreferred.length / (job.preferredSkills.length || 1)) * 15;

    let baseScore = Math.round(reqRatio * 75 + prefBonus + 10);
    baseScore = Math.min(98, Math.max(45, baseScore));

    const rec =
      baseScore >= 85
        ? "STRONG_SHORTLIST"
        : baseScore >= 70
        ? "SHORTLIST"
        : baseScore >= 55
        ? "NEEDS_ASSESSMENT"
        : "REJECT";

    return {
      candidateName: "Applicant",
      yearsOfExperience: job.minExperienceYears || 3,
      matchedSkills,
      missingSkills,
      matchScore: baseScore,
      strengths: [
        `Demonstrates relevant keywords in: ${matchedSkills.slice(0, 3).join(", ") || "software engineering"}.`,
        "Profile aligned with key functional requirements.",
      ],
      weaknesses:
        missingSkills.length > 0
          ? [`May need further evaluation on: ${missingSkills.slice(0, 2).join(", ")}.`]
          : ["General portfolio deep-dive recommended during interview."],
      recommendation: rec,
      summaryVerdict: `Candidate displays ${baseScore}% alignment with core ${job.title} requirements based on automated resume parsing.`,
    };
  }
}

