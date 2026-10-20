# System Architecture: InternDoor Full-Stack Recreation

## 1. System Overview

The platform is designed with a modern, modular Full-Stack Next.js (App Router) architecture, backed by a persistent relational database via Prisma ORM, automated ATS ingestion workers, and Google Gemini AI services for resume matching and optimization.

```
                              ┌───────────────────────────────────────────┐
                              │               Client Tier                 │
                              │  Next.js 14 / React 18 / Tailwind / Lucide │
                              └─────────────────────┬─────────────────────┘
                                                    │ HTTPS / JSON
                                                    ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────┐
│                                   Next.js Application Server                                │
│                                                                                             │
│  ┌───────────────────────┐  ┌────────────────────────┐  ┌────────────────────────────────┐  │
│  │   Server Components   │  │   API Route Handlers   │  │       Server Actions / Auth    │  │
│  │  - SSR / Hydrated UI  │  │  - /api/jobs            │  │  - Session Validation (JWT)   │  │
│  │  - Dynamic Metadata  │  │  - /api/companies       │  │  - Password Hashing (Bcrypt)  │  │
│  │  - SEO Optimization   │  │  - /api/practice        │  │  - Role-based Access Control  │  │
│  │                       │  │  - /api/ai/resume       │  │                               │  │
│  └───────────┬───────────┘  └───────────┬────────────┘  └───────────────┬────────────────┘  │
│              │                          │                               │                   │
│              └──────────────────────────┼───────────────────────────────┘                   │
│                                         │                                                   │
│                                         ▼                                                   │
│                        ┌─────────────────────────────────┐                                  │
│                        │       Prisma Data Access Layer  │                                  │
│                        │  - Model Relations              │                                  │
│                        │  - Query Optimization & Indexes │                                  │
│                        │  - Type-safe Client             │                                  │
│                        └────────────────┬────────────────┘                                  │
└─────────────────────────────────────────┼───────────────────────────────────────────────────┘
                                          │
                                          ▼
                         ┌─────────────────────────────────┐
                         │       Relational Database       │
                         │    PostgreSQL / SQLite via      │
                         │          Prisma ORM             │
                         └────────────────┬────────────────┘
                                          ▲
                                          │ Reads & Writes
┌─────────────────────────────────────────┴───────────────────────────────────────────────────┐
│                           Automated Ingestion & Background Services                         │
│                                                                                             │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │ Greenhouse ATS Crawler │  │   Lever ATS Crawler     │  │  Deduplication & Validation  │  │
│  │ Public Board API sync  │  │   Public Postings sync  │  │  Hash-based duplicate filter │  │
│  └────────────────────────┘  └─────────────────────────┘  └──────────────────────────────┘  │
│                                                                                             │
│  ┌────────────────────────┐  ┌─────────────────────────┐  ┌──────────────────────────────┐  │
│  │  Google Gemini AI SDK  │  │   Job Expiration Worker │  │   Ingestion & Audit Logger   │  │
│  │  Resume match & tailor │  │   Active status checker │  │   Per-run metrics in DB      │  │
│  └────────────────────────┘  └─────────────────────────┘  └──────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Subsystems

### A. Frontend Application (Next.js App Router)
- **Framework**: Next.js 14+ with React 18, TypeScript, Tailwind CSS.
- **Client & Server Separation**: Fast Server-Side Rendering (SSR) for SEO and initial load speed; Client Components for interactive filters, instant search, and real-time state.
- **State Management**: URL-driven search and filter state (enabling shareable bookmarkable filtered URLs) synchronized with optimistic UI updates.

### B. Ingestion & Automated Job Discovery Engine
- **Authorized Sources**:
  1. **Greenhouse Public Boards API**: `https://boards-api.greenhouse.io/v1/boards/{company_slug}/jobs`
  2. **Lever Public Postings API**: `https://api.lever.co/v0/postings/{company_slug}`
  3. Direct Employer Submissions via verified recruiter portal
- **Data Pipeline**:
  - Fetch raw payload from verified endpoints
  - Sanitize and convert HTML descriptions to clean, formatted text
  - Classify role type: detects "Intern", "Internship", "Co-op", "Fellowship" vs "Full-Time"
  - Workplace detection: classifies "Remote", "Hybrid", or extracts City, State/Country
  - Skill extraction: pattern matching across 50+ core modern technical skills
  - Hash computation: unique `sha256(companyId + externalId + title)` to prevent duplicate entries
  - Ingestion logging: records every sync attempt with metrics in `IngestionLog`

### C. Authentication & User Profiles
- Secure session management using stateless JSON Web Tokens (JWT) stored in HTTP-only secure cookies or NextAuth session tokens.
- Password hashing using `bcryptjs` with high salt rounds.
- Role-based authorization: `CANDIDATE`, `RECRUITER`, `ADMIN`.

### D. AI Resume Matching Subsystem
- Powered by Google Gemini API (`gemini-1.5-flash` or `gemini-2.0-flash`).
- Dual-workflow:
  1. **Job Fit Analysis**: Compares candidate's resume text against target job requirements, returning a structured JSON score (0-100), key strengths, and missing qualification keywords.
  2. **Tailoring Engine**: Re-writes candidate bullet points to truthfully emphasize relevant experience matching the job description without fabricating credentials.

### E. Practice & Community Subsystem
- Catalog of technical interview questions categorized by topic (Data Structures, Algorithms, Frontend, Backend, System Design).
- In-browser code runner simulation with test case evaluation.
- Gamified Leaderboard with real-time scoring, streaks, and community rankings.
