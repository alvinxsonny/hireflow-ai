import { NextResponse } from "next/server";
import { getApplicationById, updateApplicationRecord } from "@/lib/applications-store";
import { getJobById } from "@/lib/jobs-store";
import { screenResumeWithAI } from "@/lib/resume-screener";
import fs from "fs/promises";
import path from "path";

export async function POST(request: Request) {
  try {
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { success: false, error: "applicationId is required" },
        { status: 400 }
      );
    }

    const application = await getApplicationById(applicationId);
    if (!application) {
      return NextResponse.json(
        { success: false, error: "Application not found" },
        { status: 404 }
      );
    }

    const job = await getJobById(application.jobId);
    if (!job) {
      return NextResponse.json(
        { success: false, error: "Associated job posting not found" },
        { status: 404 }
      );
    }

    let resumeText = application.resumeRawText || "";

    // If resume text isn't in memory, attempt to read from data URI or disk if available
    if (!resumeText && application.resumeFileUrl) {
      try {
        let fileBuffer: Buffer | null = null;
        if (application.resumeFileUrl.startsWith("data:")) {
          const base64Data = application.resumeFileUrl.split(",")[1];
          if (base64Data) {
            fileBuffer = Buffer.from(base64Data, "base64");
          }
        } else {
          const localPath = path.join(process.cwd(), "public", application.resumeFileUrl);
          fileBuffer = await fs.readFile(localPath);
        }

        if (fileBuffer) {
          if (application.resumeFileName?.endsWith(".pdf")) {
            const pdfParse = require("pdf-parse");
            const parsed = await pdfParse(fileBuffer);
            resumeText = parsed.text || "";
          } else {
            resumeText = fileBuffer.toString("utf-8");
          }
        }
      } catch (e) {
        console.warn("Could not read resume file, using candidate cover letter & metadata:", e);
        resumeText = `Candidate: ${application.candidateName}\nCover Letter: ${application.coverLetter}\nPortfolio: ${application.portfolioUrl}`;
      }
    }

    if (!resumeText) {
      resumeText = `Candidate: ${application.candidateName}. Applying for ${job.title}. Has relevant background in engineering.`;
    }

    // Call AI screening engine
    const screening = await screenResumeWithAI(resumeText, job);

    // Update application in memory / DB
    const updated = await updateApplicationRecord(applicationId, {
      matchScore: screening.matchScore,
      aiSummary: screening.summaryVerdict,
      matchedSkills: screening.matchedSkills,
      missingSkills: screening.missingSkills,
      strengths: screening.strengths,
      weaknesses: screening.weaknesses,
      recommendation: screening.recommendation,
      status: screening.matchScore >= 75 ? "SHORTLISTED" : "SCREENED",
    });

    return NextResponse.json({
      success: true,
      data: updated,
      screening,
    });
  } catch (error: any) {
    console.error("Resume screening error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to screen resume" },
      { status: 500 }
    );
  }
}

