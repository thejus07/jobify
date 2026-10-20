# Website Audit: InternDoor (https://interndoor.com)

**Audit Date:** October 19, 2026  
**Auditor:** Antigravity Autonomous Engineering Team  
**Reference Website:** `https://interndoor.com/`  
**Recording & Evidence:** Captured screenshots and session recording in artifacts directory.

---

## 1. Executive Summary

InternDoor is an internship and early-career job discovery platform designed for students, recent graduates, and entry-level job seekers. It features curated listings from tech companies, startups, and top enterprises, categorized by internship vs. full-time roles, location (including remote/hybrid), and specialized career tracks (Software Engineering, Data Science, AI/ML, Product Management, Design, etc.).

In addition to job discovery and direct application routing, the platform includes:
- **Practice & Assessment Hub**: Daily technical/coding and interview practice questions with difficulty levels and acceptance rates.
- **Leaderboard**: Gamified community rankings based on practice problems solved, streak, and points.
- **Company Directory**: Profiles of hiring companies with active openings, industry, and headquarters.
- **Skills Explorer**: Directory of in-demand skills and roles with corresponding opportunities.
- **Resume & AI Features**: AI resume review, job match analysis, and tailoring.
- **User Authentication & Dashboard**: Google Sign-in and email authentication, saved jobs, and application tracking (Kanban/status pipeline).

---

## 2. Visual Design & Aesthetics Breakdown

| Element | InternDoor Observable Design System | Re-implementation Strategy |
| :--- | :--- | :--- |
| **Theme** | Clean modern light mode with subtle dark slate accents (`#0f172a`, `#1e293b`), crisp white background (`#ffffff`), and light grey surfaces (`#f8fafc`, `#f1f5f9`). | Next.js + Tailwind CSS with dark mode toggle support. Tailored slate/indigo palette. |
| **Primary Color** | Vibrant Indigo/Violet gradient (`#4f46e5` to `#6366f1` / `#7c3aed`). | CSS variables with `--primary: 243 75% 59%` (indigo-600) and rich accent gradients. |
| **Secondary Accents** | Emerald green (`#10b981`) for active/open badges, Amber (`#f59e0b`) for urgent/expiring, Violet (`#8b5cf6`) for AI features. | High-contrast status badges, subtle glowing borders on hover. |
| **Typography** | Modern sans-serif (Inter / Plus Jakarta Sans style), clean weights (400, 500, 600, 700). High contrast, excellent hierarchy. | Google Font: `Inter` or `Plus Jakarta Sans`. |
| **Surfaces & Cards** | White rounded cards (`rounded-xl` / `rounded-2xl`), subtle borders (`border-slate-200`), soft drop shadows (`shadow-sm` transitioning to `shadow-md` on hover). | Clean bordered card design with micro-interactions, company logo avatars with fallback monograms. |
| **Header / Nav** | Sticky top navigation bar with blur backdrop (`backdrop-blur-md bg-white/90`), brand logo on the left, navigation tabs in center, action buttons (Post Job, Sign In) on right. | Sticky navigation with responsive mobile sheet menu, active link indicators. |

---

## 3. Observable Pages & Route Architecture

| Route | Page Title | Observable Components & Features | Access Level |
| :--- | :--- | :--- | :--- |
| `/` | **Home / Job Directory** | Hero section with dynamic headline, search bar (title, company, location), filter tabs (All, Internships, Full-Time), facet pills (Remote, Hybrid, Tech tracks), paginated/infinite job list with cards, company logos, quick apply/save buttons. | Public |
| `/jobs` | **All Jobs** | Comprehensive job board with multi-attribute filtering (Role, Job Type, Location, Experience, Date Posted, Salary Range). | Public |
| `/internships` | **Internship Board** | Pre-filtered view strictly for student & summer/fall/spring internships, co-ops, and apprenticeships. | Public |
| `/full-time` | **Full-Time Board** | Pre-filtered view for entry-level and new graduate full-time positions. | Public |
| `/jobs/[id]` | **Job Detail Page** | Comprehensive view: Job title, company overview, role description, qualifications, compensation/stipend, work authorization requirements, "Apply on Company Site" outgoing tracking button, similar jobs carousel. | Public |
| `/companies` | **Companies Directory** | Searchable grid of hiring companies with logo, active job count, location, industry, and link to company profile. | Public |
| `/companies/[slug]` | **Company Profile** | Detailed overview of company, culture, perks, and listing of all current active openings. | Public |
| `/skills` | **Skills & Categories** | Role and skill categorization (e.g., Python, React, AWS, Machine Learning, Product Design) linking directly to filtered job searches. | Public |
| `/practice` | **Practice & Interview Hub** | Catalog of technical and behavioral interview questions categorized by topic (Arrays, Dynamic Programming, System Design, SQL), difficulty tags, and solution status. | Public / Auth |
| `/leaderboard` | **Community Leaderboard** | User rankings table sorted by problems solved, streak count, and practice points. | Public |
| `/resume` | **AI Resume Studio** | Resume upload (PDF/DOCX), AI match scoring against specific jobs, keyword gap analysis, and tailored resume bullet generator. | Auth / Verified |
| `/dashboard` | **Candidate Dashboard** | Application tracking pipeline (Saved, Applied, Interviewing, Offer, Rejected), job alerts manager, profile settings. | Auth Protected |
| `/auth/signin` & `/auth/signup` | **Authentication** | Modal or dedicated page supporting Google OAuth and Email/Password with input validation. | Public |
| `/post-job` | **Employer Job Portal** | Submission form for recruiters/employers to submit job postings. | Public / Recruiter |

---

## 4. Component Inventory

1. **Navigation & Shell**:
   - `Navbar`: Brand logo, navigation links (`Jobs`, `Internships`, `Full-time`, `Practice`, `Companies`, `Leaderboard`), `Post a Job` button, `Sign In` / User profile avatar dropdown.
   - `MobileNav`: Slide-out sheet menu for mobile viewports.
   - `Footer`: Categorized links (Opportunities, Practice, Resources, Company, Legal), newsletter subscription, social links.

2. **Search & Filters**:
   - `HeroSearch`: Dual input bar (Job title / skill keyword + Location) with Instant Search trigger.
   - `TypeFilterTabs`: Pill/tab selector (All, Internships, Full-Time).
   - `FilterSidebar / FilterBar`:
     - Workplace Type (Remote, Hybrid, On-site)
     - Experience Level (Intern, Entry Level, Associate)
     - Domain / Function (Software Engineering, Data & Analytics, AI/ML, Product, Design)
     - Date Posted (Last 24 hours, Last 7 days, Last 30 days)
     - Sort Order (Newest, Most Relevant)
   - `ActiveFilterChips`: Dismissible chips showing currently applied filters with "Clear All".

3. **Job Listings**:
   - `JobCard`:
     - Company logo (with fallback initials generator)
     - Role title & Company name
     - Location badge (e.g. "San Francisco, CA" or "Remote (US)")
     - Job Type badge ("Internship" in emerald, "Full-Time" in blue)
     - Salary/Stipend preview if available
     - Key skills tags (e.g., "Python", "React", "PostgreSQL")
     - Posted time indicator (e.g. "2 hours ago")
     - Bookmark / Save button (persisted in DB for authenticated users)
     - View Details / Quick Apply button
   - `JobListingsGrid`: Responsive container with skeleton loading states and empty state handlers.

4. **Job Details View**:
   - Header with prominent Apply Now button (opens verified official ATS/careers URL in new tab while recording outbound click event).
   - Job metadata cards (Workplace, Type, Experience, Compensation, Date posted).
   - Rich Markdown / HTML job description (About the role, Qualifications, Responsibilities, Benefits).
   - AI Match analyzer widget ("Check how well your resume matches this job").
   - Related jobs list.

5. **Practice Hub**:
   - Problem table with columns: Status, Title, Category, Difficulty (Easy, Medium, Hard), Acceptance Rate.
   - Problem viewer with description, sample test cases, code editor / solution submission simulation.

6. **User Dashboard & Tracker**:
   - Kanban board / Status list with columns: `Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn`.
   - Add/edit application notes, application date, follow-up reminders.

7. **AI Resume Studio**:
   - Resume drag-and-drop file upload (extracting text).
   - Target job selector.
   - Gemini-powered matching report: Match Score (0-100%), matching skills, missing skills, targeted advice, and tailored bullet point suggestions.

---

## 5. Verified User Journeys & Interactions

### Journey 1: Job Discovery & Application
1. User lands on `/` or `/jobs`.
2. Types "Software Engineer" in the search box, selects "Internships" tab, checks "Remote".
3. System triggers server-side query with filters applied, returning matching records.
4. User clicks a job card, navigating to `/jobs/[id]`.
5. User reads role overview, requirements, and clicks "Apply on Company Site".
6. Outbound click is recorded, and the official careers page opens in a new tab.

### Journey 2: Saved Jobs & Application Tracking
1. Authenticated user clicks bookmark icon on any job card.
2. The job is persisted into `SavedJobs` in the database.
3. User visits `/dashboard/tracker` and sees the job in their Kanban pipeline under "Saved".
4. User drags or updates the status to "Applied" with date and notes.

### Journey 3: Automated Job Discovery & Ingestion
1. Automated background engine executes ingestion worker.
2. Connects to authorized public ATS job board APIs (e.g. Greenhouse public API `https://boards-api.greenhouse.io/v1/boards/{company}/jobs`, Lever public API `https://api.lever.co/v0/postings/{company}`, employer career feeds).
3. Fetches live openings, extracts normalized fields (title, location, department, description, apply_url, updated_at).
4. Checks for duplicate jobs via hash of `(companyId, externalJobId, title)`.
5. Inserts or updates job records in PostgreSQL/SQLite database.
6. Logs the ingestion session in `IngestionLogs`.

### Journey 4: AI Resume Matching & Tailoring
1. User uploads resume text or file in `/resume`.
2. User selects an active job from the platform.
3. System calls Google Gemini API with job requirements and resume text.
4. Returns structured JSON: Match score, strong match areas, missing keywords, ATS optimization suggestions, and tailored bullet points.
5. User can edit and export the tailored resume.

---

## 6. Responsive Design Audit

- **Desktop (1280px+)**: Multi-column layout with sidebar filters on left, job listings in center/right. Full navigation bar with all links and action buttons.
- **Tablet (768px - 1024px)**: Collapsible filter drawer, 2-column or stacked grid.
- **Mobile (< 768px)**: Bottom bar or sticky top bar, slide-out hamburger menu, modal filter sheet, single-column job cards optimized for touch targets (minimum 44x44px).

---

## 7. Compliance, Privacy & Data Architecture Note

- Only authorized public APIs (such as Greenhouse and Lever public endpoints designed for public job listings) and user-submitted postings are ingested.
- Original application links point directly to official company careers pages.
- Clean separation between public discovery endpoints and authenticated private candidate data.
