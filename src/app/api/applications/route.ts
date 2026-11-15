import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import {
  createApplicationRecord,
  getApplications,
  updateApplicationRecord,
} from "@/lib/applications-store";
import { getJobById } from "@/lib/jobs-store";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateEmail = searchParams.get("email") || undefined;
    const jobId = searchParams.get("jobId") || undefined;

    const applications = await getApplications({ candidateEmail, jobId });
    return NextResponse.json({ success: true, applications });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch applications" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { success: false, error: "Application id and status are required" },
        { status: 400 }
      );
    }

    const updated = await updateApplicationRecord(id, { status });
    if (!updated) {
      return NextResponse.json({ success: false, error: "Application not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, application: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update application" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();

    const jobId = formData.get("jobId") as string;
    const candidateName = formData.get("candidateName") as string;
    const candidateEmail = formData.get("candidateEmail") as string;
    const candidatePhone = (formData.get("candidatePhone") as string) || "";
    const portfolioUrl = (formData.get("portfolioUrl") as string) || "";
    const coverLetter = (formData.get("coverLetter") as string) || "";
    const resumeFile = formData.get("resume") as File | null;

    if (!jobId || !candidateName || !candidateEmail || !resumeFile) {
      return NextResponse.json(
        { success: false, error: "Job ID, Name, Email, and Resume are required." },
        { status: 400 }
      );
    }

    const job = await getJobById(jobId);
    if (!job) {
      return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
    }

    // Save resume file locally if writable, or fall back to base64 data URL in read-only environments (e.g. Vercel)
    const bytes = await resumeFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let resumeFileUrl = "";
    try {
      const uploadsDir = path.join(process.cwd(), "public", "uploads", "resumes");
      await mkdir(uploadsDir, { recursive: true });

      const safeFileName = `${Date.now()}-${resumeFile.name.replace(/[^a-zA-Z0-9.-]/g, "_")}`;
      const filePath = path.join(uploadsDir, safeFileName);
      await writeFile(filePath, buffer);

      resumeFileUrl = `/uploads/resumes/${safeFileName}`;
    } catch (fsErr) {
      console.warn("Read-only filesystem detected on serverless runtime. Using base64 data URL for resume:", fsErr);
      const mimeType = resumeFile.type || (resumeFile.name.endsWith(".pdf") ? "application/pdf" : "application/octet-stream");
      resumeFileUrl = `data:${mimeType};base64,${buffer.toString("base64")}`;
    }

    // Attempt text extraction
    let rawText = "";
    try {
      if (resumeFile.name.endsWith(".pdf")) {
        const pdfParse = require("pdf-parse");
        const pdfData = await pdfParse(buffer);
        rawText = pdfData.text || "";
      } else {
        rawText = buffer.toString("utf-8").slice(0, 5000);
      }
    } catch (parseErr) {
      console.warn("Could not extract raw text from resume:", parseErr);
    }

    const application = await createApplicationRecord({
      jobId,
      jobTitle: job.title,
      candidateName,
      candidateEmail,
      candidatePhone,
      portfolioUrl,
      coverLetter,
      resumeFileName: resumeFile.name,
      resumeFileUrl,
      resumeRawText: rawText,
      status: "APPLIED",
    });

    return NextResponse.json({
      success: true,
      message: "Application submitted successfully!",
      application,
    });
  } catch (error: any) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to submit application" },
      { status: 500 }
    );
  }
}

