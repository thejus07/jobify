import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const alerts = await prisma.jobAlert.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ alerts });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load alerts";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to create job alerts." }, { status: 401 });
  }

  try {
    const { keywords, jobType, workplaceType, location, frequency = "DAILY" } = await req.json();

    const alert = await prisma.jobAlert.create({
      data: {
        userId: user.id,
        keywords: keywords || null,
        jobType: jobType || null,
        workplaceType: workplaceType || null,
        location: location || null,
        frequency,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true, alert }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to create alert";
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

    await prisma.jobAlert.deleteMany({
      where: { id, userId: user.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to delete alert";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
