# Database Schema Documentation: InternDoor Platform

## 1. Overview
The database uses Prisma ORM. It is configured to run out-of-the-box with SQLite for zero-friction local execution, and can seamlessly connect to PostgreSQL in staging or production by setting `DATABASE_URL="postgresql://..."` in `.env`.

All 12 required entities are fully modeled with relational constraints, cascading rules, and lookup indexes.

---

## 2. Entity-Relationship Diagram (Logical)

```
       ┌───────────┐         1:N        ┌───────────┐
       │   User    ├────────────────────┤ SavedJob  │
       └─────┬─────┘                    └─────┬─────┘
             │                                │
             │ 1:N                            │ N:1
             ├──────────────────────────┐     │
             │                          │     │
             ▼ 1:N                      ▼     ▼
      ┌──────────────┐               ┌───────────┐         N:1        ┌───────────┐
      │ Application  ├───────────────┤    Job    ├────────────────────┤  Company  │
      └──────────────┘               └─────┬─────┘                    └─────┬─────┘
             │                             │                                │
             │                             │ N:1                            │ 1:N
             ▼ 1:N                         ▼                                │
      ┌──────────────┐               ┌───────────┐                          │
      │    Resume    │               │ JobSource │◄─────────────────────────┘
      └──────────────┘               └─────┬─────┘
             │                             │
             │                             ▼ 1:N
             │                      ┌──────────────┐
             │                      │ IngestionLog │
             │                      └──────────────┘
             ▼ 1:N
      ┌──────────────┐
      │   JobAlert   │
      └──────────────┘

      ┌──────────────────┐         1:N        ┌──────────────────┐
      │ PracticeQuestion ├────────────────────┤ PracticeAttempt  │
      └──────────────────┘                    └────────┬─────────┘
                                                       │ N:1
                                                       ▼
                                                ┌───────────┐
                                                │   User    │
                                                └───────────┘
```

---

## 3. Entity Definitions

### 1. `User`
- `id`: String (UUID or CUID, primary key)
- `email`: String (Unique)
- `name`: String
- `passwordHash`: String (Optional for OAuth users)
- `role`: Enum (`CANDIDATE`, `RECRUITER`, `ADMIN`, default: `CANDIDATE`)
- `avatarUrl`: String?
- `headline`: String?
- `location`: String?
- `githubUrl`: String?
- `linkedinUrl`: String?
- `createdAt`, `updatedAt`: DateTime

### 2. `Company`
- `id`: String (PK)
- `name`: String (Unique)
- `slug`: String (Unique)
- `logoUrl`: String?
- `website`: String?
- `industry`: String?
- `headquarters`: String?
- `description`: String?
- `isVerified`: Boolean (Default: true)
- `createdAt`, `updatedAt`: DateTime

### 3. `Job`
- `id`: String (PK)
- `title`: String
- `slug`: String
- `companyId`: String (FK -> Company)
- `location`: String (e.g. "San Francisco, CA" or "Remote")
- `workplaceType`: Enum (`REMOTE`, `HYBRID`, `ONSITE`)
- `jobType`: Enum (`INTERNSHIP`, `FULL_TIME`, `CO_OP`)
- `experienceLevel`: Enum (`INTERN`, `ENTRY_LEVEL`, `ASSOCIATE`, `MID_SENIOR`)
- `salaryMin`: Float?
- `salaryMax`: Float?
- `salaryCurrency`: String (Default: "USD")
- `stipendRate`: String? (e.g. "$45/hr" or "$8,000/mo")
- `description`: String (Markdown/HTML sanitized text)
- `requirements`: String?
- `skills`: String (JSON or comma-separated list of tags)
- `applyUrl`: String (Original official company careers/ATS application URL)
- `source`: String (e.g., "greenhouse", "lever", "employer_direct")
- `externalId`: String? (Job ID from the upstream ATS)
- `dedupHash`: String (Unique index for duplicate prevention: hash of company + title + externalId)
- `isExpired`: Boolean (Default: false)
- `postedAt`: DateTime (Original verified posting date)
- `discoveredAt`: DateTime (Date scraped/ingested)
- `lastVerifiedAt`: DateTime
- `clicksCount`: Int (Default: 0)

### 4. `JobSource`
- `id`: String (PK)
- `companyId`: String (FK -> Company)
- `sourceType`: Enum (`GREENHOUSE`, `LEVER`, `WORKDAY`, `CUSTOM_RSS`)
- `endpointUrl`: String
- `companySlug`: String
- `isActive`: Boolean (Default: true)
- `lastSyncAt`: DateTime?
- `errorCount`: Int (Default: 0)
- `createdAt`: DateTime

### 5. `SavedJob`
- `id`: String (PK)
- `userId`: String (FK -> User)
- `jobId`: String (FK -> Job)
- `createdAt`: DateTime
- *Constraint: Unique (userId, jobId)*

### 6. `Application`
- `id`: String (PK)
- `userId`: String (FK -> User)
- `jobId`: String (FK -> Job)
- `status`: Enum (`SAVED`, `APPLIED`, `ASSESSMENT`, `INTERVIEW`, `OFFER`, `REJECTED`, `WITHDRAWN`)
- `appliedDate`: DateTime?
- `notes`: String?
- `salaryOffer`: Float?
- `followUpDate`: DateTime?
- `createdAt`, `updatedAt`: DateTime
- *Constraint: Unique (userId, jobId)*

### 7. `Resume`
- `id`: String (PK)
- `userId`: String (FK -> User)
- `fileName`: String
- `fileUrl`: String?
- `rawText`: String
- `parsedSkills`: String? (JSON array of detected skills)
- `targetRole`: String?
- `isPrimary`: Boolean (Default: true)
- `createdAt`, `updatedAt`: DateTime

### 8. `JobAlert`
- `id`: String (PK)
- `userId`: String (FK -> User)
- `keywords`: String?
- `jobType`: String?
- `workplaceType`: String?
- `location`: String?
- `frequency`: Enum (`INSTANT`, `DAILY`, `WEEKLY`, default: `DAILY`)
- `isActive`: Boolean (Default: true)
- `createdAt`: DateTime

### 9. `Notification`
- `id`: String (PK)
- `userId`: String (FK -> User)
- `title`: String
- `message`: String
- `linkUrl`: String?
- `isRead`: Boolean (Default: false)
- `createdAt`: DateTime

### 10. `PracticeQuestion`
- `id`: String (PK)
- `title`: String
- `slug`: String (Unique)
- `category`: String (e.g. "Data Structures", "Algorithms", "System Design", "SQL")
- `difficulty`: Enum (`EASY`, `MEDIUM`, `HARD`)
- `description`: String (Problem statement & examples)
- `starterCode`: String?
- `solution`: String?
- `acceptanceRate`: Float (Default: 75.0)
- `points`: Int (Default: 10)
- `createdAt`: DateTime

### 11. `PracticeAttempt`
- `id`: String (PK)
- `userId`: String (FK -> User)
- `questionId`: String (FK -> PracticeQuestion)
- `status`: Enum (`ATTEMPTED`, `SOLVED`)
- `submittedCode`: String?
- `pointsEarned`: Int (Default: 0)
- `solvedAt`: DateTime?
- `createdAt`: DateTime

### 12. `IngestionLog`
- `id`: String (PK)
- `sourceId`: String? (FK -> JobSource)
- `sourceName`: String
- `status`: Enum (`SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`)
- `jobsDiscovered`: Int (Default: 0)
- `jobsInserted`: Int (Default: 0)
- `jobsUpdated`: Int (Default: 0)
- `durationMs`: Int
- `errorMessage`: String?
- `executedAt`: DateTime (Default: now)
