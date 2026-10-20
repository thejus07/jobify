import { prisma } from "../lib/prisma";
import crypto from "crypto";
import fs from "fs";
import path from "path";

interface RawJobData {
  company: {
    name: string;
    slug?: string;
    industry?: string;
    headquarters?: string;
    website?: string;
    logoUrl?: string;
  };
  title: string;
  location: string;
  workplaceType?: "REMOTE" | "HYBRID" | "ONSITE";
  jobType?: "INTERNSHIP" | "FULL_TIME" | "CO_OP";
  experienceLevel?: "INTERN" | "ENTRY_LEVEL" | "ASSOCIATE" | "MID_SENIOR";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  stipendRate?: string;
  description: string;
  requirements?: string;
  skills: string[];
  applyUrl: string;
  source?: string;
  externalId?: string;
  slug?: string;
  postedAt?: string | Date;
  notes?: string;
}

const DEFAULT_SHEET_URL =
  "https://docs.google.com/spreadsheets/d/14HeDn_HlUsLxyrNbho6A0LVOCWoX3nngjEGQDyzqvkU/edit?usp=sharing_eip_se_dm&ts=6ad5b58a";

function generateSlug(title: string, companyName: string, id: string | number): string {
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const cleanCompany = companyName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `${cleanCompany}-${cleanTitle}-${id}`;
}

async function fetchFromGoogleSheetsUrl(url: string): Promise<RawJobData[] | null> {
  const idMatch = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const sheetId = idMatch[1];
  const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;

  console.log(`🌐 Attempting direct fetch from Google Sheets CSV endpoint...`);
  try {
    const res = await fetch(csvUrl, {
      headers: { "User-Agent": "Jobify-Sheet-Ingest/1.0" },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.warn(
        `⚠️ Google Sheets CSV fetch returned HTTP ${res.status}. (The Google Sheet may be private or restricted to invited Google accounts).`
      );
      return null;
    }

    const csvText = await res.text();
    if (!csvText || csvText.includes("<!doctype html>")) {
      console.warn("⚠️ Received HTML instead of CSV from Google Sheets (sign-in required).");
      return null;
    }

    console.log("✅ Successfully fetched CSV directly from Google Sheets!");
    // Basic CSV line parser
    const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (lines.length <= 1) return [];

    const jobs: RawJobData[] = [];
    for (let i = 1; i < lines.length; i++) {
      // Split by comma ignoring commas inside quotes
      const cells = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || [];
      const clean = cells.map((c) => c.replace(/^"|"$/g, "").trim());
      if (clean.length < 2) continue;

      const [companyName, role, location, posted, experienceFit, applyLink, notes] = clean;
      const isIntern = (role + " " + experienceFit).toLowerCase().includes("intern");
      const isHybrid = (location || "").toLowerCase().includes("hybrid");
      const isRemote = (location || "").toLowerCase().includes("remote");

      const externalIdMatch = (applyLink || "").match(/(\d{8,12})/);
      const extId = externalIdMatch ? externalIdMatch[1] : String(Date.now() + i);

      jobs.push({
        company: {
          name: companyName || "Unknown Employer",
          slug: (companyName || "").toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
        title: role || "Untitled Position",
        location: location || "India",
        workplaceType: isRemote ? "REMOTE" : isHybrid ? "HYBRID" : "ONSITE",
        jobType: isIntern ? "INTERNSHIP" : "FULL_TIME",
        experienceLevel: isIntern ? "INTERN" : "ENTRY_LEVEL",
        description: `${role} at ${companyName}. ${notes || ""}`,
        requirements: notes ? `Notes from listing: ${notes}` : "Standard technical qualifications",
        skills: ["Technology", "Engineering"],
        applyUrl: applyLink || "https://interndoor.com",
        externalId: extId,
        source: "google_sheets",
        postedAt: posted ? new Date(posted) : new Date(),
        notes,
      });
    }

    return jobs;
  } catch (err: unknown) {
    console.warn(`⚠️ Could not reach Google Sheets CSV directly: ${(err as Error).message}`);
    return null;
  }
}

async function loadJobData(): Promise<RawJobData[]> {
  // 1. Try direct Google Sheets CSV fetch
  const directData = await fetchFromGoogleSheetsUrl(DEFAULT_SHEET_URL);
  if (directData && directData.length > 0) {
    return directData;
  }

  // 2. Fall back to local extracted JSON dataset
  const localJsonPath = path.join(process.cwd(), "data", "google_sheets_jobs.json");
  if (fs.existsSync(localJsonPath)) {
    console.log(`📂 Loading verified sheet job records from local dataset: data/google_sheets_jobs.json`);
    const raw = fs.readFileSync(localJsonPath, "utf-8");
    return JSON.parse(raw) as RawJobData[];
  }

  throw new Error("No job records available to import.");
}

async function main() {
  console.log("=========================================================");
  console.log("📊 JOBIFY — GOOGLE SHEETS JOB INGESTION PIPELINE");
  console.log(`Target Sheet: ${DEFAULT_SHEET_URL}`);
  console.log("=========================================================\n");

  const jobsToImport = await loadJobData();
  console.log(`📋 Found ${jobsToImport.length} jobs to ingest into database.\n`);

  let insertedCount = 0;
  let updatedCount = 0;

  for (const item of jobsToImport) {
    const companySlug =
      item.company.slug ||
      item.company.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

    // 1. Upsert Company
    const company = await prisma.company.upsert({
      where: { slug: companySlug },
      create: {
        slug: companySlug,
        name: item.company.name,
        industry: item.company.industry || "Technology",
        headquarters: item.company.headquarters || item.location,
        website: item.company.website || item.applyUrl,
        logoUrl: item.company.logoUrl,
        isVerified: true,
      },
      update: {
        name: item.company.name,
        industry: item.company.industry || undefined,
        headquarters: item.company.headquarters || undefined,
        website: item.company.website || undefined,
        logoUrl: item.company.logoUrl || undefined,
      },
    });

    // 2. Prepare Job Identifiers & Dedup Hash
    const extId = item.externalId || crypto.createHash("md5").update(`${company.id}:${item.title}`).digest("hex").slice(0, 10);
    const slug = item.slug || generateSlug(item.title, company.name, extId);
    const dedupHash = crypto
      .createHash("sha256")
      .update(`${company.id}:${extId}:${item.title.trim().toLowerCase()}`)
      .digest("hex");

    const existingJob = await prisma.job.findUnique({
      where: { dedupHash },
    });

    const jobData = {
      title: item.title,
      slug,
      companyId: company.id,
      location: item.location,
      workplaceType: item.workplaceType || "ONSITE",
      jobType: item.jobType || "INTERNSHIP",
      experienceLevel: item.experienceLevel || "ENTRY_LEVEL",
      salaryCurrency: item.salaryCurrency || "INR",
      stipendRate: item.stipendRate,
      description: item.description,
      requirements: item.requirements || null,
      skills: JSON.stringify(item.skills || []),
      applyUrl: item.applyUrl,
      source: "google_sheets",
      externalId: extId,
      dedupHash,
      isExpired: false,
      postedAt: item.postedAt ? new Date(item.postedAt) : new Date(),
      lastVerifiedAt: new Date(),
    };

    if (existingJob) {
      await prisma.job.update({
        where: { id: existingJob.id },
        data: jobData,
      });
      console.log(`🔄 Updated existing job: "${item.title}" @ ${company.name}`);
      updatedCount++;
    } else {
      await prisma.job.create({
        data: {
          ...jobData,
          discoveredAt: new Date(),
        },
      });
      console.log(`✨ Created new job: "${item.title}" @ ${company.name} (${item.location})`);
      insertedCount++;
    }
  }

  console.log("\n=================== INGESTION SUMMARY ===================");
  console.log(`Total Processed: ${jobsToImport.length}`);
  console.log(`New Jobs Inserted: ${insertedCount}`);
  console.log(`Existing Jobs Updated: ${updatedCount}`);

  const totalInDb = await prisma.job.count();
  const sheetsInDb = await prisma.job.count({ where: { source: "google_sheets" } });
  console.log(`Total Jobs in Database: ${totalInDb}`);
  console.log(`Total Google Sheets Jobs in Database: ${sheetsInDb}`);
  console.log("=========================================================\n");
}

main()
  .catch((err) => {
    console.error("❌ Ingestion script failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
