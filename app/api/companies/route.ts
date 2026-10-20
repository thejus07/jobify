import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const industry = searchParams.get("industry")?.trim() || "";

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { headquarters: { contains: q } },
      ];
    }
    if (industry) {
      where.industry = { contains: industry };
    }

    const companies = await prisma.company.findMany({
      where,
      include: {
        _count: {
          select: {
            jobs: {
              where: { isExpired: false },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    });

    const formatted = companies.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      logoUrl: c.logoUrl,
      website: c.website,
      industry: c.industry,
      headquarters: c.headquarters,
      description: c.description,
      isVerified: c.isVerified,
      activeJobsCount: c._count.jobs,
    }));

    return NextResponse.json({ companies: formatted });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load companies";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
