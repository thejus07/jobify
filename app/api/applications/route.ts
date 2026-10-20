import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const applications = await prisma.application.findMany({
      where: { userId: user.id },
      include: {
        job: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                website: true,
              },
            },
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = applications.map((app) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(app.job.skills);
      } catch {
        skills = app.job.skills.split(",");
      }

      return {
        id: app.id,
        status: app.status,
        notes: app.notes,
        appliedDate: app.appliedDate,
        followUpDate: app.followUpDate,
        salaryOffer: app.salaryOffer,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        job: {
          id: app.job.id,
          title: app.job.title,
          slug: app.job.slug,
          location: app.job.location,
          jobType: app.job.jobType,
          workplaceType: app.job.workplaceType,
          applyUrl: app.job.applyUrl,
          company: app.job.company,
          skills,
        },
      };
    });

    return NextResponse.json({ applications: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load applications";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId, status = "APPLIED", notes, appliedDate, followUpDate } = await req.json();

    if (!jobId) {
      return NextResponse.json({ error: "jobId is required" }, { status: 400 });
    }

    const application = await prisma.application.upsert({
      where: {
        userId_jobId: {
          userId: user.id,
          jobId,
        },
      },
      create: {
        userId: user.id,
        jobId,
        status,
        notes: notes || null,
        appliedDate: appliedDate ? new Date(appliedDate) : new Date(),
        followUpDate: followUpDate ? new Date(followUpDate) : null,
      },
      update: {
        status,
        notes: notes !== undefined ? notes : undefined,
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
      },
      include: {
        job: {
          include: {
            company: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, status, notes, appliedDate, followUpDate, salaryOffer } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Application id is required" }, { status: 400 });
    }

    const existing = await prisma.application.findFirst({
      where: { id, userId: user.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    const updated = await prisma.application.update({
      where: { id },
      data: {
        status: status || undefined,
        notes: notes !== undefined ? notes : undefined,
        appliedDate: appliedDate ? new Date(appliedDate) : undefined,
        followUpDate: followUpDate ? new Date(followUpDate) : undefined,
        salaryOffer: salaryOffer !== undefined ? parseFloat(salaryOffer) : undefined,
      },
      include: {
        job: {
          include: { company: true },
        },
      },
    });

    return NextResponse.json({ success: true, application: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id parameter is required" }, { status: 400 });
    }

    await prisma.application.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete application";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
