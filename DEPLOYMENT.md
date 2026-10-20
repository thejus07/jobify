# Deployment Guide: InternDoor Full-Stack Recreation

## 1. Overview
The application is built on Next.js 14+ (App Router) and can be deployed directly to:
- **Vercel** (Zero-configuration serverless deployment)
- **Node.js Docker Container** (Self-hosted or on AWS / GCP / DigitalOcean)
- **Railway / Render** (Full-stack with persistent PostgreSQL & Redis)

---

## 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database Connection (Defaults to SQLite for local development; use PostgreSQL for staging/prod)
DATABASE_URL="file:./dev.db"
# Example PostgreSQL: DATABASE_URL="postgresql://user:password@localhost:5432/jobify?schema=public"

# Authentication Secret
NEXTAUTH_SECRET="your-32-character-random-hex-secret"
NEXTAUTH_URL="http://localhost:3000"

# Google Gemini API Key (Required for AI Resume Match & Tailor)
GEMINI_API_KEY=""

# Optional Public OAuth Credentials
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Ingestion Cron Secret (Protects automated ingest API endpoint)
INGESTION_CRON_SECRET="internal-cron-secret-key"
```

---

## 3. Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run database migrations and seed initial data**:
   ```bash
   npx prisma db push
   npm run seed
   ```

3. **Run the Automated Job Ingestion Pipeline**:
   ```bash
   npm run ingest
   ```
   *Fetches live job listings from authorized public tech company boards (e.g., Cloudflare, Figma, GitLab, Automattic).*

4. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

5. **Run Automated Test Suite (Playwright)**:
   ```bash
   npx playwright test
   ```

---

## 4. Production Build & Verification

```bash
npm run build
npm start
```
