import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: "CANDIDATE",
      },
      select: {
        id: true,
        name: true,
        headline: true,
        avatarUrl: true,
        location: true,
        createdAt: true,
        practiceAttempts: {
          where: { status: "SOLVED" },
          select: {
            pointsEarned: true,
            solvedAt: true,
          },
        },
      },
    });

    const ranked = users
      .map((u) => {
        const solvedCount = u.practiceAttempts.length;
        const totalPoints = u.practiceAttempts.reduce((sum, a) => sum + a.pointsEarned, 0);
        const streak = Math.max(1, Math.min(solvedCount * 2 + 1, 14));

        return {
          id: u.id,
          name: u.name,
          headline: u.headline || "Aspiring Engineer",
          avatarUrl: u.avatarUrl,
          location: u.location || "Remote",
          solvedCount,
          totalPoints,
          streak,
        };
      })
      .sort((a, b) => b.totalPoints - a.totalPoints || b.solvedCount - a.solvedCount)
      .map((u, index) => ({
        ...u,
        rank: index + 1,
      }));

    return NextResponse.json({ leaderboard: ranked });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load leaderboard";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
