import { prisma } from "../lib/prisma";
import bcrypt from "bcryptjs";
import { runFullIngestionPipeline } from "../lib/ingestion/engine";

async function main() {
  console.log("🌱 Starting InternDoor Database Seeding...");

  // 1. Create Default Users (Candidate & Admin)
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const candidate = await prisma.user.upsert({
    where: { email: "alex.chen@example.com" },
    create: {
      email: "alex.chen@example.com",
      name: "Alex Chen",
      passwordHash,
      role: "CANDIDATE",
      headline: "Computer Science Senior @ UC Berkeley | Aspiring Full Stack Engineer",
      location: "San Francisco, CA",
      githubUrl: "https://github.com/alexchen-dev",
      linkedinUrl: "https://linkedin.com/in/alexchen-dev",
    },
    update: {},
  });

  await prisma.user.upsert({
    where: { email: "admin@interndoor.com" },
    create: {
      email: "admin@interndoor.com",
      name: "Platform Admin",
      passwordHash,
      role: "ADMIN",
      headline: "InternDoor Staff & Board Admin",
      location: "San Francisco, CA",
    },
    update: {},
  });

  console.log("✅ Seeded test users: alex.chen@example.com / admin@interndoor.com");

  // 2. Seed Practice Questions for Practice & Interview Hub
  const practiceQuestions = [
    {
      title: "Two Sum",
      slug: "two-sum",
      category: "Data Structures",
      difficulty: "EASY",
      description: "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.\n\nYou may assume that each input would have exactly one solution, and you may not use the same element twice.",
      starterCode: "function twoSum(nums, target) {\n  // Write your solution here\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}",
      acceptanceRate: 88.5,
      points: 10,
    },
    {
      title: "Valid Anagram",
      slug: "valid-anagram",
      category: "Strings",
      difficulty: "EASY",
      description: "Given two strings s and t, return true if t is an anagram of s, and false otherwise.\n\nAn Anagram is a word or phrase formed by rearranging the letters of a different word or phrase.",
      starterCode: "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const count = {};\n  for (const c of s) count[c] = (count[c] || 0) + 1;\n  for (const c of t) {\n    if (!count[c]) return false;\n    count[c]--;\n  }\n  return true;\n}",
      acceptanceRate: 82.1,
      points: 10,
    },
    {
      title: "Longest Substring Without Repeating Characters",
      slug: "longest-substring-without-repeating-characters",
      category: "Algorithms",
      difficulty: "MEDIUM",
      description: "Given a string s, find the length of the longest substring without repeating characters.\n\nExample:\nInput: s = 'abcabcbb'\nOutput: 3 (The answer is 'abc', with the length of 3).",
      starterCode: "function lengthOfLongestSubstring(s) {\n  let maxLen = 0, left = 0;\n  const seen = new Set();\n  for (let right = 0; right < s.length; right++) {\n    while (seen.has(s[right])) {\n      seen.delete(s[left]);\n      left++;\n    }\n    seen.add(s[right]);\n    maxLen = Math.max(maxLen, right - left + 1);\n  }\n  return maxLen;\n}",
      acceptanceRate: 54.3,
      points: 20,
    },
    {
      title: "LRU Cache Design",
      slug: "lru-cache-design",
      category: "System Design",
      difficulty: "HARD",
      description: "Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.\n\nImplement the LRUCache class with get(key) and put(key, value) operations running in O(1) average time complexity.",
      starterCode: "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.cache = new Map();\n  }\n  get(key) {\n    if (!this.cache.has(key)) return -1;\n    const val = this.cache.get(key);\n    this.cache.delete(key);\n    this.cache.set(key, val);\n    return val;\n  }\n  put(key, value) {\n    if (this.cache.has(key)) this.cache.delete(key);\n    this.cache.set(key, value);\n    if (this.cache.size > this.capacity) {\n      this.cache.delete(this.cache.keys().next().value);\n    }\n  }\n}",
      acceptanceRate: 41.7,
      points: 30,
    },
    {
      title: "Design a Scalable URL Shortener (Bitly)",
      slug: "design-url-shortener",
      category: "System Design",
      difficulty: "MEDIUM",
      description: "Design a URL shortening service like tinyurl or bit.ly. Discuss API endpoints, database schema, Base62 encoding, 301 vs 302 redirects, caching layer with Redis, and collision prevention.",
      starterCode: "// Outline system architecture components:\n// 1. API: POST /api/shorten, GET /{shortCode}\n// 2. Storage: SQL / NoSQL schema with index on shortCode\n// 3. Generator: Base62 hash of auto-incrementing ID\n// 4. Redis Cache for top 20% URLs",
      acceptanceRate: 67.2,
      points: 25,
    },
  ];

  for (const q of practiceQuestions) {
    const question = await prisma.practiceQuestion.upsert({
      where: { slug: q.slug },
      create: q,
      update: q,
    });

    // Record an attempt for Alex Chen
    await prisma.practiceAttempt.upsert({
      where: {
        userId_questionId: {
          userId: candidate.id,
          questionId: question.id,
        },
      },
      create: {
        userId: candidate.id,
        questionId: question.id,
        status: "SOLVED",
        pointsEarned: question.points,
        solvedAt: new Date(),
      },
      update: {},
    });
  }

  console.log("✅ Seeded practice questions and candidate attempts");

  // 3. Run Automated ATS Ingestion to populate real live jobs
  console.log("🔄 Triggering live ATS ingestion from Greenhouse public boards...");
  try {
    const results = await runFullIngestionPipeline();
    console.log("📊 Ingestion results:", results);
  } catch (err) {
    console.warn("⚠️ Live ingestion encountered warning, falling back to local verification:", err);
  }

  // 4. Link some saved jobs & applications for Alex Chen
  const availableJobs = await prisma.job.findMany({ take: 5 });
  if (availableJobs.length > 0) {
    // Saved job
    await prisma.savedJob.upsert({
      where: {
        userId_jobId: {
          userId: candidate.id,
          jobId: availableJobs[0].id,
        },
      },
      create: {
        userId: candidate.id,
        jobId: availableJobs[0].id,
      },
      update: {},
    });

    // Applications with various statuses for tracker testing
    const statuses = ["APPLIED", "INTERVIEW", "ASSESSMENT"];
    for (let i = 1; i < Math.min(availableJobs.length, 4); i++) {
      await prisma.application.upsert({
        where: {
          userId_jobId: {
            userId: candidate.id,
            jobId: availableJobs[i].id,
          },
        },
        create: {
          userId: candidate.id,
          jobId: availableJobs[i].id,
          status: statuses[i - 1] || "APPLIED",
          appliedDate: new Date(),
          notes: "Submitted via official company careers page. Recruiter reached out on LinkedIn.",
        },
        update: {},
      });
    }
    console.log("✅ Seeded candidate saved jobs & active application pipeline");
  }

  // 5. Seed a sample candidate resume
  await prisma.resume.upsert({
    where: { id: "seed-resume-alex" },
    create: {
      id: "seed-resume-alex",
      userId: candidate.id,
      fileName: "Alex_Chen_SWE_Resume.pdf",
      rawText: `Alex Chen
San Francisco, CA | alex.chen@example.com | github.com/alexchen-dev

EDUCATION
University of California, Berkeley - B.S. in Computer Science (Expected May 2027)

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL, HTML/CSS
Frameworks & Libraries: React, Next.js, Node.js, Express, Tailwind CSS, Prisma
Tools & Cloud: Git, Docker, AWS (S3, Lambda), PostgreSQL, Redis, Linux

EXPERIENCE
Software Engineering Intern | Acme Cloud (June 2026 - August 2026)
- Developed responsive dashboard components in Next.js and TypeScript, increasing page performance by 35%.
- Implemented RESTful APIs and Prisma database queries on PostgreSQL handling 50k daily active requests.
- Collaborated in an agile team of 6 engineers with weekly sprints, code reviews, and CI/CD pipelines.

PROJECTS
DevJob Tracker: Built full-stack application for tracking technical internship applications with Next.js, Tailwind, and SQLite.
Distributed Key-Value Store: Implemented Raft consensus algorithm in Go with fault tolerance and snapshotting.`,
      parsedSkills: JSON.stringify(["TypeScript", "JavaScript", "Python", "Go", "SQL", "React", "Next.js", "Node.js", "PostgreSQL", "Docker", "AWS", "Git"]),
      targetRole: "Software Engineering Intern / Entry-Level",
      isPrimary: true,
    },
    update: {},
  });

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
