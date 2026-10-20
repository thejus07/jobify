import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const difficulty = searchParams.get("difficulty");
    const user = await getCurrentUser();

    const where: any = {};
    if (category && category !== "ALL") where.category = category;
    if (difficulty && difficulty !== "ALL") where.difficulty = difficulty;

    const questions = await prisma.practiceQuestion.findMany({
      where,
      orderBy: { points: "asc" },
      include: {
        _count: {
          select: { attempts: true },
        },
      },
    });

    let solvedSet = new Set<string>();
    if (user) {
      const attempts = await prisma.practiceAttempt.findMany({
        where: { userId: user.id },
        select: { questionId: true, status: true },
      });
      solvedSet = new Set(attempts.filter((a) => a.status === "SOLVED").map((a) => a.questionId));
    }

    const formatted = questions.map((q) => ({
      id: q.id,
      title: q.title,
      slug: q.slug,
      category: q.category,
      difficulty: q.difficulty,
      description: q.description,
      starterCode: q.starterCode,
      acceptanceRate: q.acceptanceRate,
      points: q.points,
      isSolved: solvedSet.has(q.id),
      totalAttempts: q._count.attempts,
    }));

    return NextResponse.json({ questions: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load practice questions";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
