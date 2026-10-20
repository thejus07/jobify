import { prisma } from "../lib/prisma";
import { runFullIngestionPipeline } from "../lib/ingestion/engine";

async function main() {
  console.log("🚀 Starting InternDoor Automated Job Ingestion Engine...");
  console.log("📡 Querying authorized public ATS feeds (Greenhouse boards)...");

  const results = await runFullIngestionPipeline();

  console.log("\n=================== INGESTION SUMMARY ===================");
  let totalDiscovered = 0;
  let totalInserted = 0;
  let totalUpdated = 0;

  for (const r of results) {
    console.log(
      `• [${r.status}] ${r.source.toUpperCase()}: Discovered=${r.discovered}, Inserted=${r.inserted}, Updated=${r.updated} (${r.durationMs}ms)`
    );
    totalDiscovered += r.discovered;
    totalInserted += r.inserted;
    totalUpdated += r.updated;
  }

  console.log("=========================================================");
  console.log(`Total Discovered: ${totalDiscovered}`);
  console.log(`Total New Jobs Inserted: ${totalInserted}`);
  console.log(`Total Existing Jobs Updated: ${totalUpdated}`);

  const activeJobsCount = await prisma.job.count({ where: { isExpired: false } });
  console.log(`Current Total Active Jobs in Database: ${activeJobsCount}`);
}

main()
  .catch((err) => {
    console.error("Ingestion failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
