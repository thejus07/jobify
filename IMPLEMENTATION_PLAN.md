# Implementation Plan: InternDoor Full-Stack Recreation

## Overview
This document outlines the systematic, end-to-end plan to reverse-engineer and recreate **InternDoor** as a production-grade, full-stack platform using Next.js 14+ (App Router), TypeScript, Tailwind CSS, Prisma ORM, automated ATS ingestion pipelines, and Google Gemini AI.

---

## Milestone 1: Environment & Project Scaffolding
- [x] Audit reference website and document findings (`WEBSITE_AUDIT.md`)
- [ ] Initialize Next.js project with TypeScript, Tailwind CSS, Lucide icons, and modern design system tokens
- [ ] Install dependencies:
  - Frontend: `lucide-react`, `clsx`, `tailwind-merge`, `framer-motion` (for micro-animations), `canvas-confetti`
  - Backend/ORM: `@prisma/client`, `prisma`, `bcryptjs`, `jose` / `next-auth`
  - AI & Parser: `@google/genai` or Google Gemini REST/SDK, `pdf-parse` / text extraction
  - Testing: `@playwright/test`
- [ ] Create core project structure (`app/`, `components/`, `lib/`, `prisma/`, `workers/`, `tests/`)

---

## Milestone 2: Database Modeling & Schema Architecture (`DATABASE_SCHEMA.md`)
- [ ] Create Prisma schema covering all required entities:
  - `User`: Accounts, auth credentials, role (candidate/admin/employer), profile details
  - `Company`: Name, slug, logoUrl, website, industry, headquarters, bio, verified status
  - `Job`: Title, slug, companyId, location, workplaceType (REMOTE, HYBRID, ONSITE), jobType (INTERNSHIP, FULL_TIME, CO_OP), experienceLevel, salaryMin, salaryMax, salaryCurrency, stipendRate, description, requirements, skills, applyUrl, source, externalId, isExpired, postedAt, discoveredAt, lastVerifiedAt
  - `JobSource`: ATS feeds (Greenhouse, Lever, etc.), status, lastSyncAt, errorCount
  - `SavedJob`: User bookmarks with timestamps
  - `Application`: Application tracking pipeline (`SAVED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`), notes, appliedDate, followUpReminder
  - `Resume`: User resumes, parsed text, skills list, target role
  - `JobAlert`: User search criteria subscriptions & notification frequency
  - `Notification`: System alerts, new matching job notices
  - `PracticeQuestion`: Title, slug, category, difficulty (EASY, MEDIUM, HARD), problem statement, starter code, test cases, acceptanceRate
  - `PracticeAttempt`: User code submissions, status (SOLVED, ATTEMPTED), score
  - `IngestionLog`: Source, jobsDiscovered, jobsInserted, jobsUpdated, durationMs, status, errorDetails
- [ ] Run Prisma generate & migration to initialize database

---

## Milestone 3: Real Automated Job Discovery Engine
- [ ] Implement robust ATS ingestion connectors:
  - **Greenhouse Public ATS connector**: Fetches real job openings from active public tech boards (e.g., Cloudflare, Figma, GitLab, Automattic, Vercel, Stripe).
  - **Lever Public ATS connector**: Fetches real openings from companies with public Lever boards (e.g., Netflix, Spotify, Postman).
  - **Normalized Data Pipeline**:
    - Cleans HTML descriptions into readable markdown/text
    - Normalizes job types (detects "intern", "internship", "co-op", "new grad", "university" vs "full-time")
    - Normalizes location & workplace type (Remote, Hybrid, On-site)
    - Extracts key skills (React, Python, TypeScript, Node.js, Go, AWS, Docker, AI/ML, SQL)
    - Deduplicates using unique hash `(companyId, externalJobId, title)`
    - Verifies valid official apply URLs (never broken or fake)
- [ ] Ingestion script with CLI runner (`npm run ingest`) & scheduled background job runner
- [ ] Ingestion logging and monitoring API (`/api/admin/ingest`)

---

## Milestone 4: Backend API Architecture
- [ ] Job Search & Filter API (`GET /api/jobs`):
  - Full-text search (query across title, company, skills, description)
  - Filters: `jobType`, `workplaceType`, `experienceLevel`, `location`, `postedWithin`, `skills`
  - Sorting: `newest`, `relevance`
  - Cursor-based / Offset pagination with total counts
- [ ] Job Details API (`GET /api/jobs/[id]`) with outbound click tracking
- [ ] Companies API (`GET /api/companies`, `GET /api/companies/[slug]`)
- [ ] Practice Hub API (`GET /api/practice`, `POST /api/practice/submit`)
- [ ] Leaderboard API (`GET /api/leaderboard`)
- [ ] User Saved Jobs & Tracker API (`GET /api/saved-jobs`, `POST /api/saved-jobs`, `GET /api/applications`, `PATCH /api/applications/[id]`)
- [ ] Authentication API (`/api/auth/*`): Email/password registration, login, JWT session handling, profile management
- [ ] AI Resume Analyzer API (`POST /api/ai/resume-match`, `POST /api/ai/resume-tailor`) using Gemini

---

## Milestone 5: Frontend Interface & Observable Design System
- [ ] Design System Tokens: Indigo/Violet brand theme, dark/light mode classes, glassmorphic header, responsive grid
- [ ] Core Components:
  - `Navbar` & `MobileNav`: Clean layout matching InternDoor
  - `Footer`: Links, categories, newsletter
  - `HeroSection`: High-impact search bar + live opportunity stats badge
  - `JobFiltersBar`: Tabs (All, Internships, Full-Time), Workplace dropdown, Experience dropdown, Date filter, Clear button
  - `JobCard`: Company logo avatar, title, badges (Internship/Full-Time, Remote), salary, skills pills, save button, direct apply link
  - `JobDetailsModal` & `JobDetailsPage`: Rich overview, company meta, skills checklist, Apply button, AI Match card
- [ ] Dedicated Sub-pages:
  - `/jobs`: Full directory with sticky filters
  - `/internships`: Pre-filtered student & early-career internship listings
  - `/full-time`: Pre-filtered entry-level full-time listings
  - `/companies`: Grid of hiring companies with opening counts
  - `/skills`: Skill explorer linking to filtered searches
  - `/practice`: Interactive coding/technical interview question hub with code runner
  - `/leaderboard`: Community rankings with points and streaks
  - `/dashboard`: Candidate application tracking board (Kanban / list)
  - `/resume`: AI Resume analyzer and tailoring studio
  - `/auth/signin` & `/auth/signup`: Clean auth dialogs/pages
  - `/post-job`: Employer job submission form

---

## Milestone 6: AI Resume Studio & Application Tracker
- [ ] Connect Gemini 1.5/2.0 API for:
  - Extracting resume skills and experience highlights
  - Scoring compatibility against specific job requirements (0-100)
  - Identifying missing keywords & ATS optimization recommendations
  - Generating tailored resume bullets aligned with true experience
- [ ] Candidate Tracker:
  - Visual Kanban pipeline: Saved -> Applied -> Interview -> Offer -> Rejected
  - Add notes, application dates, and reminders
  - Persist all updates in database

---

## Milestone 7: Automated End-to-End Testing (Playwright)
- [ ] Write and run comprehensive Playwright test suite:
  - Test 1: Homepage search for job title
  - Test 2: Multi-attribute filtering (Internship + Remote)
  - Test 3: Open job details view
  - Test 4: Official application link functionality
  - Test 5: Candidate registration and sign-in
  - Test 6: Bookmark / save a job
  - Test 7: Update application status in tracker
  - Test 8: Resume upload & parsing
  - Test 9: AI resume match analysis
  - Test 10: Automated job ingestion pipeline execution
  - Test 11: Duplicate prevention verification
  - Test 12: Mobile responsive navigation and filter drawer
  - Test 13: Job alert creation
  - Test 14: Error and empty state validation
- [ ] Record test results in `TEST_RESULTS.md`

---

## Milestone 8: Documentation & Verification
- [ ] Complete `ARCHITECTURE.md`
- [ ] Complete `DATABASE_SCHEMA.md`
- [ ] Complete `TEST_RESULTS.md`
- [ ] Complete `DEPLOYMENT.md`
- [ ] Local build and dev verification
