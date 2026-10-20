import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export interface BoardConfig {
  slug: string;
  name: string;
  industry: string;
  headquarters: string;
  website: string;
  logoUrl?: string;
  sourceType: "GREENHOUSE" | "LEVER";
}

export const MONITORED_BOARDS: BoardConfig[] = [
  {
    slug: "figma",
    name: "Figma",
    industry: "Design & Technology",
    headquarters: "San Francisco, CA",
    website: "https://www.figma.com",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/figma-5.svg",
    sourceType: "GREENHOUSE",
  },
  {
    slug: "cloudflare",
    name: "Cloudflare",
    industry: "Cloud & Cybersecurity",
    headquarters: "San Francisco, CA",
    website: "https://www.cloudflare.com",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/cloudflare.svg",
    sourceType: "GREENHOUSE",
  },
  {
    slug: "gitlab",
    name: "GitLab",
    industry: "DevOps & Software",
    headquarters: "Remote (All-Remote)",
    website: "https://about.gitlab.com",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/gitlab.svg",
    sourceType: "GREENHOUSE",
  },
  {
    slug: "affirm",
    name: "Affirm",
    industry: "Fintech & Payments",
    headquarters: "San Francisco, CA",
    website: "https://www.affirm.com",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/affirm.svg",
    sourceType: "GREENHOUSE",
  },
  {
    slug: "reddit",
    name: "Reddit",
    industry: "Social Media & Community",
    headquarters: "San Francisco, CA",
    website: "https://www.reddit.com",
    logoUrl: "https://cdn.worldvectorlogo.com/logos/reddit-4.svg",
    sourceType: "GREENHOUSE",
  },
];

const SKILL_KEYWORDS = [
  "Python", "JavaScript", "TypeScript", "React", "Next.js", "Node.js", "Vue",
  "Go", "Golang", "Java", "C++", "C#", "Rust", "Swift", "Kotlin", "Ruby",
  "SQL", "PostgreSQL", "MySQL", "MongoDB", "Redis", "GraphQL", "REST",
  "AWS", "GCP", "Azure", "Docker", "Kubernetes", "Terraform", "CI/CD",
  "Machine Learning", "AI", "PyTorch", "TensorFlow", "NLP", "LLM", "Deep Learning",
  "Figma", "UI/UX", "Product Design", "Distributed Systems", "Linux", "Git"
];

function extractSkills(text: string): string[] {
  const found = new Set<string>();
  const lower = text.toLowerCase();
  for (const skill of SKILL_KEYWORDS) {
    const escaped = skill.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`\\b${escaped}\\b`, "i");
    if (regex.test(lower)) {
      found.add(skill);
    }
  }
  return Array.from(found);
}

function classifyJobType(title: string, content: string): "INTERNSHIP" | "CO_OP" | "FULL_TIME" {
  const combined = `${title} ${content}`.toLowerCase();
  if (/\bco-?op\b/i.test(combined)) return "CO_OP";
  if (/\bintern(ship)?\b/i.test(combined) || /\bsummer \d{4}\b/i.test(combined) || /\bstudent\b/i.test(combined)) {
    return "INTERNSHIP";
  }
  return "FULL_TIME";
}

function classifyWorkplace(location: string, content: string): "REMOTE" | "HYBRID" | "ONSITE" {
  const combined = `${location} ${content}`.toLowerCase();
  if (combined.includes("remote") || combined.includes("anywhere") || combined.includes("work from home")) {
    return "REMOTE";
  }
  if (combined.includes("hybrid") || combined.includes("flexible")) {
    return "HYBRID";
  }
  return "ONSITE";
}

function classifyExperience(title: string, jobType: string): "INTERN" | "ENTRY_LEVEL" | "ASSOCIATE" | "MID_SENIOR" {
  if (jobType === "INTERNSHIP" || jobType === "CO_OP") return "INTERN";
  const lower = title.toLowerCase();
  if (lower.includes("senior") || lower.includes("staff") || lower.includes("principal") || lower.includes("lead") || lower.includes("director") || lower.includes("head")) {
    return "MID_SENIOR";
  }
  if (lower.includes("entry") || lower.includes("junior") || lower.includes("graduate") || lower.includes("associate") || lower.includes("level 1") || lower.includes("l1") || lower.includes("i ")) {
    return "ENTRY_LEVEL";
  }
  return "ASSOCIATE";
}

function sanitizeHtml(html: string): string {
  if (!html) return "";
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<br\s*[\/]?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li>/gi, "• ")
    .replace(/<h[1-6][^>]*>(.*?)<\/h[1-6]>/gi, "\n\n### $1\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
}

function generateSlug(title: string, companyName: string, id: string | number): string {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${cleanCompany}-${cleanTitle}-${id}`;
}

export interface IngestionResult {
  source: string;
  discovered: number;
  inserted: number;
  updated: number;
  durationMs: number;
  status: "SUCCESS" | "PARTIAL_SUCCESS" | "FAILED";
  errorMessage?: string;
}

export async function ingestGreenhouseBoard(board: BoardConfig, maxJobs = 40): Promise<IngestionResult> {
  const startTime = Date.now();
  let discovered = 0;
  let inserted = 0;
  let updated = 0;

  try {
    // 1. Ensure Company exists in DB
    const company = await prisma.company.upsert({
      where: { slug: board.slug },
      create: {
        slug: board.slug,
        name: board.name,
        industry: board.industry,
        headquarters: board.headquarters,
        website: board.website,
        logoUrl: board.logoUrl,
        isVerified: true,
      },
      update: {
        name: board.name,
        industry: board.industry,
        headquarters: board.headquarters,
        website: board.website,
        logoUrl: board.logoUrl,
      },
    });

    // 2. Register or update JobSource
    const jobSource = await prisma.jobSource.upsert({
      where: { id: `src-${board.slug}` },
      create: {
        id: `src-${board.slug}`,
        companyId: company.id,
        sourceType: "GREENHOUSE",
        companySlug: board.slug,
        endpointUrl: `https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs`,
        isActive: true,
        lastSyncAt: new Date(),
      },
      update: {
        lastSyncAt: new Date(),
      },
    });

    // 3. Fetch public job listings
    const res = await fetch(`https://boards-api.greenhouse.io/v1/boards/${board.slug}/jobs?content=true`, {
      headers: { "User-Agent": "Jobify-InternDoor-Ingest/1.0" },
      signal: AbortSignal.timeout(15000),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status} from Greenhouse API for ${board.slug}`);
    }

    const data = await res.json();
    const rawJobs = Array.isArray(data.jobs) ? data.jobs : [];
    discovered = rawJobs.length;

    // Process a curated sample or up to maxJobs
    const jobsToProcess = rawJobs.slice(0, maxJobs);

    for (const raw of jobsToProcess) {
      const externalId = String(raw.id || raw.internal_job_id);
      const title = raw.title || "Untitled Role";
      const locationName = raw.location?.name || "San Francisco, CA";
      const applyUrl = raw.absolute_url || `${board.website}/careers`;
      const postedAt = raw.first_published ? new Date(raw.first_published) : (raw.updated_at ? new Date(raw.updated_at) : new Date());
      const rawContent = raw.content ? sanitizeHtml(raw.content) : `We are hiring a ${title} at ${board.name}. Find out more on our official career site.`;

      const jobType = classifyJobType(title, rawContent);
      const workplaceType = classifyWorkplace(locationName, rawContent);
      const experienceLevel = classifyExperience(title, jobType);
      const skills = extractSkills(`${title} ${rawContent}`);
      const slug = generateSlug(title, board.name, externalId);

      // Deduplication hash: sha256(companyId + externalId + title)
      const dedupHash = crypto
        .createHash("sha256")
        .update(`${company.id}:${externalId}:${title.trim().toLowerCase()}`)
        .digest("hex");

      const existing = await prisma.job.findUnique({
        where: { dedupHash },
      });

      if (existing) {
        // Update verified date and details if needed
        await prisma.job.update({
          where: { id: existing.id },
          data: {
            lastVerifiedAt: new Date(),
            applyUrl,
            location: locationName,
            isExpired: false,
          },
        });
        updated++;
      } else {
        await prisma.job.create({
          data: {
            title,
            slug,
            companyId: company.id,
            location: locationName,
            workplaceType,
            jobType,
            experienceLevel,
            description: rawContent,
            requirements: skills.length > 0 ? `Required skills: ${skills.join(", ")}` : "Standard engineering qualification",
            skills: JSON.stringify(skills),
            applyUrl,
            source: "greenhouse",
            externalId,
            dedupHash,
            isExpired: false,
            postedAt,
            discoveredAt: new Date(),
            lastVerifiedAt: new Date(),
          },
        });
        inserted++;
      }
    }

    const durationMs = Date.now() - startTime;
    const result: IngestionResult = {
      source: board.slug,
      discovered,
      inserted,
      updated,
      durationMs,
      status: "SUCCESS",
    };

    // Record IngestionLog
    await prisma.ingestionLog.create({
      data: {
        sourceId: jobSource.id,
        sourceName: board.name,
        status: "SUCCESS",
        jobsDiscovered: discovered,
        jobsInserted: inserted,
        jobsUpdated: updated,
        durationMs,
      },
    });

    return result;
  } catch (error: unknown) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error(`Ingestion error for ${board.slug}:`, errorMessage);

    await prisma.ingestionLog.create({
      data: {
        sourceName: board.name,
        status: "FAILED",
        durationMs,
        errorMessage,
      },
    });

    return {
      source: board.slug,
      discovered,
      inserted,
      updated,
      durationMs,
      status: "FAILED",
      errorMessage,
    };
  }
}

export async function runFullIngestionPipeline(): Promise<IngestionResult[]> {
  const results: IngestionResult[] = [];
  for (const board of MONITORED_BOARDS) {
    const res = await ingestGreenhouseBoard(board, 30);
    results.push(res);
  }
  return results;
}
