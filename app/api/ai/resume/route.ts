import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const resumes = await prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
    });

    const formatted = resumes.map((r) => {
      let parsedSkills: string[] = [];
      try {
        parsedSkills = JSON.parse(r.parsedSkills || "[]");
      } catch {
        parsedSkills = [];
      }
      return {
        id: r.id,
        fileName: r.fileName,
        rawText: r.rawText,
        targetRole: r.targetRole,
        isPrimary: r.isPrimary,
        parsedSkills,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      };
    });

    return NextResponse.json({ resumes: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load resumes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized. Please sign in to save resumes." }, { status: 401 });
  }

  try {
    const { fileName = "My_Resume.txt", rawText, targetRole } = await req.json();

    if (!rawText || rawText.trim().length < 20) {
      return NextResponse.json(
        { error: "Resume text must contain at least 20 characters." },
        { status: 400 }
      );
    }

    // Extract technical skills
    const commonSkills = [
      "JavaScript", "TypeScript", "Python", "React", "Next.js", "Node.js", "Go",
      "Java", "C++", "C#", "Rust", "SQL", "PostgreSQL", "Docker", "AWS", "Git", "Figma"
    ];
    const detected = commonSkills.filter((s) => {
      const escaped = s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      return new RegExp(`\\b${escaped}\\b`, "i").test(rawText);
    });

    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        fileName,
        rawText: rawText.trim(),
        targetRole: targetRole || "Software Engineering",
        parsedSkills: JSON.stringify(detected),
        isPrimary: true,
      },
    });

    return NextResponse.json({ success: true, resume }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to save resume";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
