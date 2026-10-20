import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ user: null });
  }
  return NextResponse.json({ user });
}

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, headline, location, githubUrl, linkedinUrl } = await req.json();

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        headline: headline !== undefined ? headline.trim() : undefined,
        location: location !== undefined ? location.trim() : undefined,
        githubUrl: githubUrl !== undefined ? githubUrl.trim() : undefined,
        linkedinUrl: linkedinUrl !== undefined ? linkedinUrl.trim() : undefined,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
