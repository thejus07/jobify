import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { analyzeResumeFit } from "@/lib/ai/gemini";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    const { resumeText, resumeId, jobId } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: { company: true },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    let textToAnalyze = resumeText;
    if (!textToAnalyze && resumeId) {
      const resume = await prisma.resume.findUnique({ where: { id: resumeId } });
      if (resume) textToAnalyze = resume.rawText;
    }

    if (!textToAnalyze && user) {
      const primaryResume = await prisma.resume.findFirst({
        where: { userId: user.id },
        orderBy: { updatedAt: "desc" },
      });
      if (primaryResume) textToAnalyze = primaryResume.rawText;
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 20) {
      return NextResponse.json(
        { error: "Please provide resume content or upload a resume to analyze." },
        { status: 400 }
      );
    }

    let requiredSkills: string[] = [];
    try {
      requiredSkills = JSON.parse(job.skills);
    } catch {
      requiredSkills = job.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    const analysis = await analyzeResumeFit(
      textToAnalyze,
      job.title,
      job.company.name,
      job.description,
      requiredSkills
    );

    return NextResponse.json({
      success: true,
      job: {
        id: job.id,
        title: job.title,
        companyName: job.company.name,
      },
      analysis,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to analyze resume fit";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
