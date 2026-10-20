import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Prisma } from "@prisma/client";
import crypto from "crypto";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() || "";
    const type = searchParams.get("type") || "ALL";
    const workplace = searchParams.get("workplace") || "ALL";
    const experience = searchParams.get("experience") || "ALL";
    const location = searchParams.get("location")?.trim() || "";
    const skill = searchParams.get("skill")?.trim() || "";
    const company = searchParams.get("company")?.trim() || "";
    const postedWithin = searchParams.get("postedWithin") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "15", 10)));
    const skip = (page - 1) * limit;

    const user = await getCurrentUser();

    // Build Prisma where query
    const where: Prisma.JobWhereInput = {
      isExpired: false,
    };

    if (q) {
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { skills: { contains: q } },
        { company: { name: { contains: q } } },
      ];
    }

    if (type !== "ALL") {
      where.jobType = type;
    }

    if (workplace !== "ALL") {
      where.workplaceType = workplace;
    }

    if (experience !== "ALL") {
      where.experienceLevel = experience;
    }

    if (location) {
      where.location = { contains: location };
    }

    if (skill) {
      where.skills = { contains: skill };
    }

    if (company) {
      where.company = {
        OR: [
          { slug: { contains: company.toLowerCase() } },
          { name: { contains: company } },
        ],
      };
    }

    if (postedWithin !== "all") {
      const now = new Date();
      let threshold = new Date();
      if (postedWithin === "24h") {
        threshold = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      } else if (postedWithin === "7d") {
        threshold = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      } else if (postedWithin === "30d") {
        threshold = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      }
      where.postedAt = { gte: threshold };
    }

    // Determine orderBy
    let orderBy: Prisma.JobOrderByWithRelationInput = { postedAt: "desc" };
    if (sort === "popular") {
      orderBy = { clicksCount: "desc" };
    }

    // Execute query with total count
    const [jobs, total, totalInternships, totalFullTime, totalRemote] = await Promise.all([
      prisma.job.findMany({
        where,
        include: {
          company: {
            select: {
              id: true,
              name: true,
              slug: true,
              logoUrl: true,
              industry: true,
              headquarters: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.job.count({ where }),
      prisma.job.count({ where: { isExpired: false, jobType: "INTERNSHIP" } }),
      prisma.job.count({ where: { isExpired: false, jobType: "FULL_TIME" } }),
      prisma.job.count({ where: { isExpired: false, workplaceType: "REMOTE" } }),
    ]);

    // Check saved status if user is logged in
    let savedJobIds = new Set<string>();
    if (user) {
      const userSaved = await prisma.savedJob.findMany({
        where: { userId: user.id },
        select: { jobId: true },
      });
      savedJobIds = new Set(userSaved.map((s) => s.jobId));
    }

    // Format output
    const formattedJobs = jobs.map((job) => {
      let parsedSkills: string[] = [];
      try {
        parsedSkills = JSON.parse(job.skills);
      } catch {
        parsedSkills = job.skills.split(",").map((s) => s.trim()).filter(Boolean);
      }

      return {
        id: job.id,
        title: job.title,
        slug: job.slug,
        company: job.company,
        location: job.location,
        workplaceType: job.workplaceType,
        jobType: job.jobType,
        experienceLevel: job.experienceLevel,
        salaryMin: job.salaryMin,
        salaryMax: job.salaryMax,
        salaryCurrency: job.salaryCurrency,
        stipendRate: job.stipendRate,
        skills: parsedSkills,
        applyUrl: job.applyUrl,
        source: job.source,
        postedAt: job.postedAt,
        clicksCount: job.clicksCount,
        isSaved: savedJobIds.has(job.id),
      };
    });

    return NextResponse.json({
      jobs: formattedJobs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
      facets: {
        totalInternships,
        totalFullTime,
        totalRemote,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to fetch jobs";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized. Please sign in as a Job Poster to submit openings." }, { status: 401 });
    }

    if (user.role !== "RECRUITER" && user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Access denied. Posting jobs is reserved for verified Job Posters." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const {
      title,
      companyName,
      companyWebsite,
      location,
      workplaceType,
      jobType,
      experienceLevel,
      description,
      applyUrl,
      skills,
    } = body;

    if (!title || !companyName || !applyUrl || !description) {
      return NextResponse.json(
        { error: "Title, Company Name, Apply URL, and Description are required." },
        { status: 400 }
      );
    }

    const companySlug = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    const company = await prisma.company.upsert({
      where: { slug: companySlug },
      create: {
        slug: companySlug,
        name: companyName.trim(),
        website: companyWebsite || null,
        isVerified: true,
      },
      update: {
        website: companyWebsite || undefined,
      },
    });

    const parsedSkills = Array.isArray(skills)
      ? skills
      : typeof skills === "string"
      ? skills.split(",").map((s) => s.trim()).filter(Boolean)
      : [];

    const externalId = `user-post-${Date.now()}`;
    const dedupHash = crypto
      .createHash("sha256")
      .update(`${company.id}:${externalId}:${title.trim().toLowerCase()}`)
      .digest("hex");

    const slug = `${companySlug}-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now().toString().slice(-6)}`;

    const job = await prisma.job.create({
      data: {
        title: title.trim(),
        slug,
        companyId: company.id,
        location: location || "Remote",
        workplaceType: workplaceType || "REMOTE",
        jobType: jobType || "INTERNSHIP",
        experienceLevel: experienceLevel || "ENTRY_LEVEL",
        description: description.trim(),
        applyUrl: applyUrl.trim(),
        skills: JSON.stringify(parsedSkills),
        source: "employer_direct",
        externalId,
        dedupHash,
        postedAt: new Date(),
        discoveredAt: new Date(),
        lastVerifiedAt: new Date(),
      },
      include: {
        company: true,
      },
    });

    return NextResponse.json({ success: true, job }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to post job";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
