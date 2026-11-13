import { NextResponse } from "next/server";
import { callGeminiWithRetry } from "@/lib/gemini";

export async function POST(request: Request) {
  try {
    const { title, department, roughNotes } = await request.json();

    if (!title) {
      return NextResponse.json(
        { success: false, error: "Job title is required to generate description" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert talent acquisition and hiring director.
Create a comprehensive, professional job description for the role: "${title}".
Department: ${department || "General"}
Additional rough notes or preferences: ${roughNotes || "None provided"}

Output ONLY valid JSON matching this exact structure:
{
  "description": "### About the Role\\n...\\n\\n### Key Responsibilities\\n- ...\\n\\n### Qualifications & Requirements\\n- ...",
  "requiredSkills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5"],
  "preferredSkills": ["Skill A", "Skill B", "Skill C"],
  "minExperienceYears": 3,
  "experienceLevel": "Mid-Senior"
}
`;

    try {
      const generated = await callGeminiWithRetry<{
        description: string;
        requiredSkills: string[];
        preferredSkills: string[];
        minExperienceYears: number;
        experienceLevel: string;
      }>(prompt, "You are a specialized AI recruiter that outputs structured JSON for job postings.");

      return NextResponse.json({ success: true, data: generated });
    } catch (aiError: any) {
      console.warn("[Gemini AI Fallback] Generating default structured JD:", aiError?.message);

      // Smart fallback template
      return NextResponse.json({
        success: true,
        data: {
          description: `### About the Role\nWe are looking for a talented and driven **${title}** to join our growing team. In this role, you will play a key part in designing, building, and delivering high-impact solutions while collaborating with cross-functional partners.\n\n### Key Responsibilities\n- Lead day-to-day initiatives and projects aligned with our core business objectives.\n- Collaborate across engineering, product, and design teams to build scalable solutions.\n- Ensure high quality, performance, and maintainability in all deliverables.\n- Mentor team members and promote best practices throughout the organization.\n\n### Qualifications & Requirements\n- Demonstrated track record in ${title} or related fields.\n- Strong problem-solving abilities and communication skills.\n- Experience in fast-paced collaborative environments.`,
          requiredSkills: [title, "Team Collaboration", "Problem Solving", "Communication", "System Design"],
          preferredSkills: ["Agile Methodology", "Mentorship", "Documentation"],
          minExperienceYears: 3,
          experienceLevel: "Mid-Senior",
        },
      });
    }
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to enhance job description" },
      { status: 500 }
    );
  }
}
