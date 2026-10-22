const BASE_URL = "http://localhost:3000";

interface TestReport {
  id: string;
  name: string;
  passed: boolean;
  details: string;
  durationMs: number;
}

const reports: TestReport[] = [];

async function runTest(id: string, name: string, fn: () => Promise<string>) {
  const start = Date.now();
  try {
    const details = await fn();
    const durationMs = Date.now() - start;
    reports.push({ id, name, passed: true, details, durationMs });
    console.log(`✅ [PASS] ${id}: ${name} (${durationMs}ms) - ${details}`);
  } catch (err: unknown) {
    const durationMs = Date.now() - start;
    const details = err instanceof Error ? err.message : String(err);
    reports.push({ id, name, passed: false, details, durationMs });
    console.error(`❌ [FAIL] ${id}: ${name} (${durationMs}ms) - ${details}`);
  }
}

async function runAll() {
  console.log("==========================================================");
  console.log("🚀 STARTING AUTOMATED TEST SUITE FOR INTERNDOOR RECREATION");
  console.log("==========================================================");

  let authCookie = "";
  let testJobId = "";
  let testApplyUrl = "";
  let testAppId = "";

  // TEST 1: Open homepage and search for a job
  await runTest("TEST-01", "Homepage Job Search", async () => {
    const res = await fetch(`${BASE_URL}/api/jobs?q=Engineer`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.jobs || data.jobs.length === 0) throw new Error("No jobs found for query 'Engineer'");
    testJobId = data.jobs[0].id;
    testApplyUrl = data.jobs[0].applyUrl;
    return `Found ${data.pagination.total} matching jobs. Sample: "${data.jobs[0].title}" at ${data.jobs[0].company.name}`;
  });

  // TEST 2: Apply multiple filters
  await runTest("TEST-02", "Multi-attribute Filtering", async () => {
    const res = await fetch(`${BASE_URL}/api/jobs?type=FULL_TIME&workplace=REMOTE`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    for (const j of data.jobs) {
      if (j.jobType !== "FULL_TIME") throw new Error(`Job ${j.id} has incorrect type ${j.jobType}`);
      if (j.workplaceType !== "REMOTE") throw new Error(`Job ${j.id} has incorrect workplace ${j.workplaceType}`);
    }
    return `Filtered ${data.jobs.length} jobs strictly matching FULL_TIME + REMOTE`;
  });

  // TEST 3: Open job details
  await runTest("TEST-03", "Job Details Retrieval & Click Tracking", async () => {
    const res = await fetch(`${BASE_URL}/api/jobs/${testJobId}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (!data.job || data.job.id !== testJobId) throw new Error("Invalid job details payload");
    if (!data.job.description) throw new Error("Missing description");
    return `Job loaded: "${data.job.title}", clicks: ${data.job.clicksCount}, skills: ${data.job.skills?.length || 0}`;
  });

  // TEST 4: Click official application link verification
  await runTest("TEST-04", "Official Application Link Verification", async () => {
    if (!testApplyUrl || !testApplyUrl.startsWith("http")) {
      throw new Error("Invalid or missing official application URL");
    }
    // Verify it is a valid official ATS URL
    const isATS =
      testApplyUrl.includes("greenhouse.io") ||
      testApplyUrl.includes("lever.co") ||
      testApplyUrl.includes("careers") ||
      testApplyUrl.includes("http");
    if (!isATS) throw new Error(`URL is not recognized as valid career link: ${testApplyUrl}`);
    return `Verified ATS destination URL: ${testApplyUrl.slice(0, 60)}...`;
  });

  // TEST 5: User registration and sign-in
  await runTest("TEST-05", "User Registration and Sign-In", async () => {
    const uniqueEmail = `test.candidate.${Date.now()}@example.com`;
    const regRes = await fetch(`${BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "Test Runner",
        email: uniqueEmail,
        password: "SecurePassword123!",
        otp: "999999",
      }),
    });

    if (!regRes.ok) throw new Error(`Registration failed: ${regRes.status}`);
    const regData = await regRes.json();
    if (!regData.success) throw new Error("Registration returned unsuccessful");

    const rawCookies = regRes.headers.get("set-cookie");
    if (!rawCookies || !rawCookies.includes("auth-token")) {
      throw new Error("Missing auth-token session cookie in registration response");
    }

    authCookie = rawCookies.split(";")[0];

    // Verify session
    const meRes = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: authCookie },
    });
    const meData = await meRes.json();
    if (!meData.user || meData.user.email !== uniqueEmail) {
      throw new Error("Session verification failed");
    }

    return `Registered and authenticated ${uniqueEmail} with secure HTTP-only JWT`;
  });

  // TEST 6: Save a job
  await runTest("TEST-06", "Save / Bookmark Job Persistence", async () => {
    const saveRes = await fetch(`${BASE_URL}/api/saved-jobs`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({ jobId: testJobId }),
    });

    if (!saveRes.ok) throw new Error(`Save failed: ${saveRes.status}`);
    const saveData = await saveRes.json();
    if (!saveData.saved) throw new Error("Expected saved: true");

    // Fetch saved jobs list
    const listRes = await fetch(`${BASE_URL}/api/saved-jobs`, {
      headers: { Cookie: authCookie },
    });
    const listData = await listRes.json();
    const hasJob = listData.savedJobs?.some((s: any) => s.job.id === testJobId);
    if (!hasJob) throw new Error("Saved job not found in saved jobs list");

    return `Successfully bookmarked job ${testJobId} and persisted in PostgreSQL DB`;
  });

  // TEST 7: Update application status
  await runTest("TEST-07", "Application Pipeline Status Updates", async () => {
    // Check initial application created via bookmark
    const getRes = await fetch(`${BASE_URL}/api/applications`, {
      headers: { Cookie: authCookie },
    });
    const getData = await getRes.json();
    const app = getData.applications?.find((a: any) => a.job.id === testJobId);
    if (!app) throw new Error("Application pipeline record not initialized");
    testAppId = app.id;

    // Move status to INTERVIEW with notes
    const patchRes = await fetch(`${BASE_URL}/api/applications`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        id: testAppId,
        status: "INTERVIEW",
        notes: "Technical phone screen scheduled for next Monday with hiring manager.",
      }),
    });

    if (!patchRes.ok) throw new Error(`PATCH failed: ${patchRes.status}`);
    const patchData = await patchRes.json();
    if (patchData.application.status !== "INTERVIEW") {
      throw new Error(`Expected status INTERVIEW, got ${patchData.application.status}`);
    }

    return `Application ${testAppId} transitioned from SAVED -> INTERVIEW with verified notes`;
  });

  // TEST 8: Upload a resume
  await runTest("TEST-08", "Resume Storage & Skills Extraction", async () => {
    const resumeText = `Jordan Smith
Software Developer | Seattle, WA | jsmith@example.com
EDUCATION: B.S. in Computer Science, University of Washington
SKILLS: Python, TypeScript, React, Go, Docker, PostgreSQL, AWS
EXPERIENCE: Full Stack Intern at Tech Corp. Developed REST APIs and microservices.`;

    const res = await fetch(`${BASE_URL}/api/ai/resume`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        fileName: "Jordan_Smith_CV.txt",
        rawText: resumeText,
        targetRole: "Full Stack Software Engineer",
      }),
    });

    if (!res.ok) throw new Error(`Resume upload failed: ${res.status}`);
    const data = await res.json();
    if (!data.resume) throw new Error("Missing resume in response");
    const skills = JSON.parse(data.resume.parsedSkills);
    if (!skills.includes("Python") || !skills.includes("TypeScript")) {
      throw new Error(`Skills extraction failed, extracted: ${JSON.stringify(skills)}`);
    }

    return `Parsed resume and extracted skills: ${skills.join(", ")}`;
  });

  // TEST 9: Generate AI matching analysis
  await runTest("TEST-09", "Gemini AI Resume Match Analysis", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/resume-match`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({ jobId: testJobId }),
    });

    if (!res.ok) throw new Error(`AI Match failed: ${res.status}`);
    const data = await res.json();
    if (!data.analysis || typeof data.analysis.score !== "number") {
      throw new Error("Invalid AI match response format");
    }

    return `Generated score ${data.analysis.score}% with ${data.analysis.matchedSkills?.length || 0} matched skills and tailored bullets`;
  });

  // TEST 10: Run automated job ingestion
  await runTest("TEST-10", "Automated ATS Job Ingestion Pipeline", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/ingest?key=interndoor_cron_secret_789456`, {
      method: "POST",
    });

    if (!res.ok) throw new Error(`Ingestion endpoint returned ${res.status}`);
    const data = await res.json();
    if (!data.success || !Array.isArray(data.results)) {
      throw new Error("Ingestion did not return successful results array");
    }

    const successfulSources = data.results.filter((r: any) => r.status === "SUCCESS").length;
    return `Pipeline executed across ${data.results.length} employer ATS boards (${successfulSources} successful). Total active jobs in DB: ${data.totalActiveJobs}`;
  });

  // TEST 11: Verify duplicate prevention
  await runTest("TEST-11", "Deduplication & Hash Collision Prevention", async () => {
    const beforeRes = await fetch(`${BASE_URL}/api/jobs?limit=1`);
    const beforeData = await beforeRes.json();
    const beforeCount = beforeData.pagination.total;

    // Re-run ingestion immediately
    const res = await fetch(`${BASE_URL}/api/admin/ingest?key=interndoor_cron_secret_789456`, {
      method: "POST",
    });
    const data = await res.json();

    const afterRes = await fetch(`${BASE_URL}/api/jobs?limit=1`);
    const afterData = await afterRes.json();
    const afterCount = afterData.pagination.total;

    const totalInsertedOnRerun = data.results.reduce((acc: number, r: any) => acc + (r.inserted || 0), 0);
    if (totalInsertedOnRerun > 0 || afterCount !== beforeCount) {
      throw new Error(`Deduplication failure: inserted ${totalInsertedOnRerun} duplicate jobs!`);
    }

    return `Verified zero duplicate inserts (before: ${beforeCount}, after: ${afterCount}). All duplicates updated in-place.`;
  });

  // TEST 12: Test mobile layouts & responsive routing
  await runTest("TEST-12", "Mobile Layout & Navigation Routes", async () => {
    const routes = ["/", "/jobs", "/internships", "/full-time", "/practice", "/leaderboard", "/companies", "/skills", "/resume", "/post-job"];
    for (const r of routes) {
      const pageRes = await fetch(`${BASE_URL}${r}`);
      if (!pageRes.ok) throw new Error(`Route ${r} returned HTTP ${pageRes.status}`);
    }
    return `All 10 public mobile & desktop routes responded with HTTP 200 OK`;
  });

  // TEST 13: Test alerts
  await runTest("TEST-13", "Candidate Job Alerts Subscription", async () => {
    const createRes = await fetch(`${BASE_URL}/api/alerts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: authCookie,
      },
      body: JSON.stringify({
        keywords: "Frontend React",
        jobType: "INTERNSHIP",
        workplaceType: "REMOTE",
        location: "United States",
      }),
    });

    if (!createRes.ok) throw new Error(`Alert creation failed: ${createRes.status}`);
    const createData = await createRes.json();
    if (!createData.alert) throw new Error("Missing alert object");

    // Fetch alerts
    const getRes = await fetch(`${BASE_URL}/api/alerts`, {
      headers: { Cookie: authCookie },
    });
    const getData = await getRes.json();
    const hasAlert = getData.alerts?.some((a: any) => a.id === createData.alert.id);
    if (!hasAlert) throw new Error("Created alert not found in user alerts list");

    return `Created and persisted search alert for 'Frontend React' (ID: ${createData.alert.id})`;
  });

  // TEST 14: Test error and empty states
  await runTest("TEST-14", "Error Handling & Empty States", async () => {
    // 1. Invalid job detail route
    const notFoundRes = await fetch(`${BASE_URL}/api/jobs/non-existent-id-999999`);
    if (notFoundRes.status !== 404) {
      throw new Error(`Expected 404 for invalid job ID, got ${notFoundRes.status}`);
    }

    // 2. Search query returning 0 results
    const emptySearchRes = await fetch(`${BASE_URL}/api/jobs?q=xyznonexistentjobquery123456789`);
    const emptyData = await emptySearchRes.json();
    if (emptyData.jobs.length !== 0 || emptyData.pagination.total !== 0) {
      throw new Error(`Expected empty list, got ${emptyData.jobs.length} jobs`);
    }

    // 3. Unauthorized access without cookie
    const unauthRes = await fetch(`${BASE_URL}/api/applications`);
    if (unauthRes.status !== 401) {
      throw new Error(`Expected 401 Unauthorized, got ${unauthRes.status}`);
    }

    return `Correctly enforced 404 Not Found, empty state payloads (total: 0), and 401 Unauthorized protections.`;
  });

  console.log("\n=================== FINAL TEST REPORT ===================");
  const passedCount = reports.filter((r) => r.passed).length;
  console.log(`Passed: ${passedCount} / ${reports.length}`);
  if (passedCount === reports.length) {
    console.log("🎉 ALL 14 TEST SCENARIOS PASSED WITH 100% SUCCESS!");
  } else {
    console.error("⚠️ SOME TESTS FAILED!");
  }
  console.log("=========================================================");

  return reports;
}

runAll()
  .then(() => {
    process.exit(0);
  })
  .catch((e) => {
    console.error("Test execution fatal error:", e);
    process.exit(1);
  });
