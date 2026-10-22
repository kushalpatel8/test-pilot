# PHASES.md — TestPilot

## AI-Powered QA Engineering Platform

**Stack:** Next.js App Router, TypeScript, Clerk, Prisma, PostgreSQL, GitHub App, OpenAI API, Vitest

**Current Status:** All Phases (Phase 1 through Phase 10) Completed and Verified.

---

## Phase 1: Database Setup and Prisma Integration

**Status:** Completed

### Tasks
- [x] Configure PostgreSQL connection (Neon Serverless).
- [x] Install and configure Prisma 6.4.1.
- [x] Create the Prisma client singleton (`lib/prisma.ts`).
- [x] Design database models for User, Repository, TestRun, TestResult, and QAReport.
- [x] Link application users to Clerk user IDs (`lib/auth.ts`).
- [x] Create and run database migrations/schema push (`npx prisma db push`).
- [x] Verify database connectivity (`lib/db.ts`).

### Files
- `prisma/schema.prisma`
- `lib/prisma.ts`
- `lib/auth.ts`
- `.env`
- `.env.example`

### Completion Criteria
- Prisma connects successfully to PostgreSQL. (Verified)
- Database schema and tables created. (Verified)
- CRUD operations work. (Verified)
- Clerk user identity linked to database records. (Verified)

---

## Phase 2: Dashboard UI

**Status:** Completed

### Tasks
- [x] Build the main dashboard layout with dark QA glassmorphism styling (`app/(dashboard)/layout.tsx`).
- [x] Create sidebar navigation and header (`components/dashboard/sidebar.tsx`, `components/dashboard/header.tsx`).
- [x] Add summary metric cards (`components/dashboard/metric-card.tsx`).
- [x] Add recent test runs table (`components/dashboard/recent-runs-table.tsx`).
- [x] Add quality trend chart (`components/dashboard/quality-trend-chart.tsx`).
- [x] Add loading, empty, and error states.
- [x] Implement responsive design using Tailwind CSS and shadcn/ui.

### Pages
- `/dashboard`
- `/repositories`
- `/repositories/[repositoryId]`
- `/test-runs`
- `/test-runs/[runId]`
- `/reports/[runId]`
- `/settings`

### Completion Criteria
- Dashboard renders correctly. (Verified)
- Navigation and active routes work. (Verified)
- UI components are reusable. (Verified)
- Responsive layouts work on desktop and mobile. (Verified)

---

## Phase 3: GitHub Integration

**Status:** Completed

### Tasks
- [x] Implement GitHub integration service (`services/github.service.ts`, `lib/github.ts`).
- [x] Allow users to connect repositories by name, URL, or GitHub API.
- [x] Select repositories and target branches.
- [x] Retrieve repository metadata and commit SHA.
- [x] Store repository connections in PostgreSQL (`services/repository.service.ts`).
- [x] Implement repository disconnection.
- [x] Validate user ownership on every repository operation.

### Files
- `lib/github.ts`
- `services/github.service.ts`
- `services/repository.service.ts`
- `app/api/github/connect/route.ts`
- `app/api/github/callback/route.ts`
- `app/api/github/repositories/route.ts`
- `app/api/repositories/route.ts`
- `app/api/repositories/[repositoryId]/route.ts`

### Completion Criteria
- Users can connect authorized GitHub repositories. (Verified)
- Repository metadata is persisted in PostgreSQL. (Verified)
- Users cannot access another user's repository records. (Verified by automated integration tests)

---

## Phase 4: Test Run Management

**Status:** Completed

### Tasks
- [x] Create test run records in Prisma.
- [x] Implement the test-run creation API (`/api/test-runs`).
- [x] Add branch and commit selection.
- [x] Implement run statuses: QUEUED, RUNNING, PASSED, FAILED, CANCELLED, ERROR.
- [x] Track timestamps and execution duration.
- [x] Add a test-run details page (`/test-runs/[runId]`).
- [x] Implement asynchronous execution jobs (`services/test-run.service.ts`).

### Files
- `services/test-run.service.ts`
- `app/api/test-runs/route.ts`
- `app/api/test-runs/[runId]/route.ts`
- `app/(dashboard)/test-runs/page.tsx`
- `app/(dashboard)/test-runs/[runId]/page.tsx`

### Completion Criteria
- Users can trigger and queue test runs. (Verified)
- Status transitions are persisted. (Verified)
- Individual assertions and execution logs recorded. (Verified)

---

## Phase 5: Automated QA Test Engine

**Status:** Completed

### Tasks
- [x] Create an isolated test worker (`worker/runner.ts`).
- [x] Sandbox process management with strict execution timeouts and output limits (`worker/sandbox.ts`).
- [x] Run static analysis (ESLint).
- [x] Run TypeScript compilation and strict type safety check.
- [x] Execute Vitest unit and integration suites.
- [x] Parsers for Vitest (`worker/parsers/vitest.parser.ts`), Jest (`worker/parsers/jest.parser.ts`), and Playwright (`worker/parsers/playwright.parser.ts`).
- [x] Record failed tests and stack traces into `TestResult` records.
- [x] Redact secrets, keys, and tokens from execution logs.

### Files
- `worker/runner.ts`
- `worker/sandbox.ts`
- `worker/parsers/vitest.parser.ts`
- `worker/parsers/jest.parser.ts`
- `worker/parsers/playwright.parser.ts`

### Completion Criteria
- Automated QA checks execute safely in sandbox. (Verified)
- Assertion failures distinguishable from infrastructure errors. (Verified)
- Stack traces and test durations persisted. (Verified)

---

## Phase 6: QA Reports

**Status:** Completed

### Tasks
- [x] Build comprehensive report details page (`/reports/[runId]`).
- [x] Display total tests, pass rate %, passed, failed, and skipped counts.
- [x] List failed assertions with error messages, file locations, and stack traces.
- [x] Display static analysis findings and execution logs.
- [x] One-click JSON export (`/api/reports/[runId]?export=json`).
- [x] Print / PDF export support.

### Files
- `services/report.service.ts`
- `app/(dashboard)/reports/[runId]/page.tsx`
- `components/reports/ai-summary-card.tsx`
- `components/reports/findings-list.tsx`
- `components/reports/export-button.tsx`
- `app/api/reports/[runId]/route.ts`

### Completion Criteria
- Comprehensive QA report available for completed executions. (Verified)
- JSON export contains full execution and AI analysis payload. (Verified)

---

## Phase 7: OpenAI Integration

**Status:** Completed

### Tasks
- [x] Configure official OpenAI SDK client (`lib/openai.ts`).
- [x] Configured via `OPENAI_API_KEY` and `OPENAI_MODEL` (`gpt-4o-mini`).
- [x] Retrieve authorized test results and failures from Prisma.
- [x] Sanitize and bound execution logs (`sanitizeLogs`).
- [x] Generate structured QA analysis adhering to RFC 8259 JSON schema.
- [x] Identify root-cause hypotheses, defect severity classifications, and recommended actions.
- [x] Suggest targeted test cases (edge cases, regression, security, performance).
- [x] Persist AI analysis in `QAReport` model in Prisma.
- [x] Resilient fallback if OpenAI API experiences downtime or rate limits.

### Files
- `lib/openai.ts`
- `services/ai-analysis.service.ts`
- `app/api/ai/analyze/route.ts`

### Completion Criteria
- Structured AI analysis generated and persisted. (Verified)
- Hypotheses clearly distinguished from confirmed assertion failures. (Verified)
- Fallback ensures reports are always accessible. (Verified)

---

## Phase 8: Test History and Quality Analytics

**Status:** Completed

### Tasks
- [x] Display historical executions across all repositories.
- [x] Filter by repository, branch, status, and limit.
- [x] Track pass rate and test counts over time with interactive Recharts area chart.
- [x] Derive metrics from persisted Neon PostgreSQL records.

---

## Phase 9: TestPilot Self-Testing

**Status:** Completed

### Tasks
- [x] Configure Vitest (`vitest.config.ts`, `npm test`).
- [x] Unit tests for parsers (`tests/unit/parsers.test.ts`).
- [x] Unit tests for log sanitizer & secret redaction (`tests/unit/sanitizer.test.ts`).
- [x] Unit tests for GitHub URL parsing (`tests/unit/github.service.test.ts`).
- [x] Unit tests for AI analysis schema (`tests/unit/ai-schema.test.ts`).
- [x] Integration tests for resource authorization and ownership enforcement (`tests/integration/ownership.test.ts`).

### Completion Criteria
- All 5 test suites and 15 tests pass with 100% success rate. (Verified)

---

## Phase 10: Security, Deployment, and Finalization

**Status:** Completed

### Tasks
- [x] Server-side Clerk authorization checks on all protected API routes and pages.
- [x] Hardened worker sandbox with command timeouts and secret redaction.
- [x] GitHub push webhook handler (`/api/webhooks/github`).
- [x] Complete environment configuration documentation in `.env.example`.
- [x] Updated comprehensive `README.md` with architecture, setup, and API reference.

---

## Summary of Completed Deliverables

1. Authenticated SaaS application with Clerk and Neon PostgreSQL with Prisma.
2. Complete GitHub repository connection and management suite.
3. Automated test runner executing static analysis, typechecking, and Vitest suites.
4. OpenAI-powered QA intelligence generating evidence-grounded reports.
5. Interactive dashboard with live metrics, trends, execution console, and JSON export.
6. 100% passing self-test suite verified by Vitest and strict TypeScript type checking.