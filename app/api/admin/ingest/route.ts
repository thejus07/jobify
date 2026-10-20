import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { runFullIngestionPipeline } from "@/lib/ingestion/engine";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const secretKey = req.nextUrl.searchParams.get("key");
    const isCronAuthorized =
      secretKey === process.env.INGESTION_CRON_SECRET ||
      authHeader === `Bearer ${process.env.INGESTION_CRON_SECRET}`;

    if (!isCronAuthorized) {
      const user = await getCurrentUser();
      if (!user || user.role !== "ADMIN") {
        return NextResponse.json(
          { error: "Unauthorized. Admin privileges or ingestion secret required." },
          { status: 403 }
        );
      }
    }

    const results = await runFullIngestionPipeline();

    const activeCount = await prisma.job.count({ where: { isExpired: false } });

    return NextResponse.json({
      success: true,
      results,
      totalActiveJobs: activeCount,
      timestamp: new Date(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Ingestion failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const logs = await prisma.ingestionLog.findMany({
      take: 20,
      orderBy: { executedAt: "desc" },
    });

    const totalJobs = await prisma.job.count();
    const totalCompanies = await prisma.company.count();

    return NextResponse.json({
      logs,
      metrics: {
        totalJobs,
        totalCompanies,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch logs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
