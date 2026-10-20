import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const savedJobs = await prisma.savedJob.findMany({
      where: { userId: user.id },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formatted = savedJobs.map((item) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(item.job.skills);
      } catch {
        skills = item.job.skills.split(",");
      }

      return {
        id: item.id,
        savedAt: item.createdAt,
        job: {
          ...item.job,
          skills,
          isSaved: true,
        },
      };
    });

    return NextResponse.json({ savedJobs: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load saved jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to save jobs." }, { status: 401 });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const existing = await prisma.savedJob.findUnique({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
    });

    if (existing) {
      // Toggle: remove if already saved
      await prisma.savedJob.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ success: true, saved: false });
    } else {
      // Save
      await prisma.savedJob.create({
        data: {
          userId: user.id,
          jobId,
        },
      });

      // Also ensure it is present in user's Application pipeline under SAVED status if not already there
      const existingApp = await prisma.application.findUnique({
        where: { userId_jobId: { userId: user.id, jobId } },
      });
      if (!existingApp) {
        await prisma.application.create({
          data: {
            userId: user.id,
            jobId,
            status: "SAVED",
          },
        });
      }

      return NextResponse.json({ success: true, saved: true });
    }
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to toggle saved job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
