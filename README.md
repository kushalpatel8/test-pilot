# TestPilot — AI-Powered QA Engineering Platform

**Author:** Kushal Patel

TestPilot is a modern, enterprise-ready Quality Assurance (QA) SaaS platform designed for QA engineers and development teams. It enables teams to connect GitHub repositories, run automated testing pipelines (ESLint, TypeScript compilation, and Vitest test suites) in an isolated execution sandbox, inspect real-time assertion results, and leverage OpenAI intelligence to generate evidence-backed root-cause analysis, defect severity classifications, and targeted test case recommendations.

---

## Screenshots

### 1. Test Assertions & Execution Overview
![TestPilot Test Assertions & Execution Overview](Screenshot1.png)

### 2. Live Developer Console & Real-Time Test Pipeline
![TestPilot Live Developer Console & Real-Time Test Pipeline](Screenshot2.png)

---

## Architecture Overview

```
                                      ┌────────────────────────┐
                                      │      Clerk Auth        │
                                      └───────────┬────────────┘
                                                  │ (Session & JWT)
                                                  ▼
┌──────────────────┐               ┌────────────────────────┐               ┌──────────────────┐
│   GitHub App /   │ ◄───────────► │   TestPilot Next.js    │ ◄───────────► │  OpenAI Service  │
│ Webhooks / Repos │               │   App Router Platform  │               │   (gpt-4o-mini)  │
└──────────────────┘               └───────────┬────────────┘               └──────────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
        ┌─────────────────────────────┐                 ┌─────────────────────────────┐
        │     Isolated QA Worker      │                 │      Neon PostgreSQL        │
        │   (ESLint, tsc, Vitest)     │                 │        (Prisma ORM)         │
        └─────────────────────────────┘                 └─────────────────────────────┘
```

---

## Core Capabilities & Completed Phases

- **Phase 1: Database Setup & Prisma Integration**
  - Neon PostgreSQL connection with connection pooling (`DATABASE_URL`, `DATABASE_URL_POOLED`).
  - Prisma schema models: `User`, `Repository`, `TestRun`, `TestResult`, `QAReport`.
  - Clerk user identity synchronization with database records and Prisma client singleton.
- **Phase 2: Dashboard UI**
  - Glassmorphic dark QA theme with responsive navigation sidebar, header, and system status indicators.
  - Live metric cards (Total Test Runs, QA Pass Rate, Active Repositories, AI Insights Generated).
  - Interactive Quality & Pass Rate Trend charts (powered by Recharts).
  - Live execution history tables with status badges and test counts.
- **Phase 3: GitHub Integration**
  - Connect repositories by URL or `owner/repo` identifier.
  - Branch and commit retrieval via GitHub API.
  - Strict user-level authorization and repository ownership verification.
- **Phase 4: Test Run Management**
  - Asynchronous background execution of test jobs.
  - Full lifecycle status transitions: `QUEUED`, `RUNNING`, `PASSED`, `FAILED`, `CANCELLED`, `ERROR`.
  - Duration tracking, branch, and commit SHA tracking.
- **Phase 5: Automated QA Test Engine**
  - Isolated runner (`worker/runner.ts`) and sandbox (`worker/sandbox.ts`) with execution timeouts.
  - Secret redaction for credentials, API keys, and connection strings.
  - Output parsers for Vitest (`worker/parsers/vitest.parser.ts`), Jest, and Playwright.
  - Granular `TestResult` persistence for each individual assertion.
- **Phase 6: QA Reports**
  - Comprehensive report page (`/reports/[runId]`).
  - Test assertion breakdown with expandable error messages and stack traces.
  - One-click JSON export (`/api/reports/[runId]?export=json`) and print-to-PDF support.
- **Phase 7: OpenAI Integration**
  - Server-side OpenAI SDK integration (`services/ai-analysis.service.ts`).
  - Evidence-grounded root cause analysis distinguishing confirmed errors from hypotheses.
  - Defect severity classification (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, `INFO`).
  - Suggested test cases (edge cases, regression guards, security validation).
- **Phase 8: Test History & Quality Analytics**
  - Filter historical executions by status, repository, branch, and date.
- **Phase 9: TestPilot Self-Testing**
  - Vitest test suite covering parsers, log sanitizer, GitHub parsing, AI schemas, and ownership enforcement.
- **Phase 10: Security & Hardening**
  - Server-side Clerk authorization checks on every protected route.
  - Bounded log storage to prevent token exhaustion and DoS.

---

## Technology Stack

- **Framework**: Next.js App Router (React 19, TypeScript)
- **Styling**: Tailwind CSS, shadcn/ui components, Lucide icons
- **Authentication**: Clerk (`@clerk/nextjs`)
- **Database**: PostgreSQL (Neon Serverless)
- **ORM**: Prisma 6.4.1
- **AI Engine**: OpenAI API (`gpt-4o-mini`)
- **Testing**: Vitest 5.0

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Neon PostgreSQL Connection
DATABASE_URL="postgresql://neondb_owner:...@host.neon.tech/neondb?sslmode=require"
DATABASE_URL_POOLED="postgresql://neondb_owner:...@host-pooler.neon.tech/neondb?sslmode=require"

# OpenAI Configuration
OPENAI_API_KEY=sk-proj-...
OPENAI_MODEL=gpt-4o-mini

# GitHub & App
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=
GITHUB_TOKEN=
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Push Database Schema
```bash
npx prisma db push
```

### 3. Run Self-Testing Suite
```bash
npm test
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view TestPilot.

---

## API Endpoints Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/repositories` | List connected repositories for authorized user |
| `POST` | `/api/repositories` | Connect a new repository |
| `GET` | `/api/repositories/[repositoryId]` | Get repository details, branches, and commits |
| `DELETE` | `/api/repositories/[repositoryId]` | Disconnect a repository |
| `GET` | `/api/test-runs` | List test runs with status, repository, and branch filters |
| `POST` | `/api/test-runs` | Dispatch a new QA test run |
| `GET` | `/api/test-runs/[runId]` | Retrieve test run status, assertions, and execution logs |
| `POST` | `/api/ai/analyze` | Generate or refresh structured OpenAI analysis for a test run |
| `GET` | `/api/reports/[runId]` | Retrieve full QA report data |
| `GET` | `/api/reports/[runId]?export=json` | Download report as JSON file |
| `POST` | `/api/webhooks/github` | Handle incoming GitHub push webhooks |

---

## Author

**Kushal Patel**

---

## License

MIT © TestPilot
