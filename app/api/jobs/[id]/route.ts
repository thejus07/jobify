import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    // Find job by ID or slug
    const job = await prisma.job.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
      },
      include: {
        company: true,
      },
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Increment click count asynchronously
    await prisma.job.update({
      where: { id: job.id },
      data: { clicksCount: { increment: 1 } },
    });

    let isSaved = false;
    let applicationStatus: string | null = null;

    if (user) {
      const [saved, application] = await Promise.all([
        prisma.savedJob.findUnique({
          where: { userId_jobId: { userId: user.id, jobId: job.id } },
        }),
        prisma.application.findUnique({
          where: { userId_jobId: { userId: user.id, jobId: job.id } },
        }),
      ]);
      isSaved = !!saved;
      applicationStatus = application?.status || null;
    }

    let parsedSkills: string[] = [];
    try {
      parsedSkills = JSON.parse(job.skills);
    } catch {
      parsedSkills = job.skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // Fetch similar opportunities
    const similarJobs = await prisma.job.findMany({
      where: {
        id: { not: job.id },
        isExpired: false,
        OR: [
          { companyId: job.companyId },
          { jobType: job.jobType },
        ],
      },
      include: {
        company: {
          select: { name: true, logoUrl: true, slug: true },
        },
      },
      take: 4,
      orderBy: { postedAt: "desc" },
    });

    return NextResponse.json({
      job: {
        ...job,
        skills: parsedSkills,
        isSaved,
        applicationStatus,
      },
      similarJobs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load job details";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
