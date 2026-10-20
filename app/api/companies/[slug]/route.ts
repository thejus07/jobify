import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    const company = await prisma.company.findFirst({
      where: {
        OR: [{ slug }, { id: slug }],
      },
      include: {
        jobs: {
          where: { isExpired: false },
          orderBy: { postedAt: "desc" },
        },
      },
    });

    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const jobs = company.jobs.map((job) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(job.skills);
      } catch {
        skills = job.skills.split(",");
      }
      return {
        ...job,
        skills,
      };
    });

    return NextResponse.json({
      company: {
        id: company.id,
        name: company.name,
        slug: company.slug,
        logoUrl: company.logoUrl,
        website: company.website,
        industry: company.industry,
        headquarters: company.headquarters,
        description: company.description,
        isVerified: company.isVerified,
      },
      jobs,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load company";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
