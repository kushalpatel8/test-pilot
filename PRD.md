# PRD.md — TestPilot
## AI-Powered QA Engineering Platform

**Product Name:** TestPilot  
**Product Type:** Web-based SaaS application  
**Document Version:** 1.0  
**Status:** Initial Product Requirements  
**Primary Users:** QA Engineers, Software Developers, Test Engineers, and Development Teams

---

## 1. Product Overview

TestPilot is an AI-powered Quality Assurance (QA) platform that allows users to connect their GitHub repositories, execute automated software tests, analyze code quality, identify potential defects, and generate comprehensive QA reports.

The platform combines traditional software testing tools with OpenAI-powered analysis to help users understand test failures, prioritize defects, identify testing gaps, and improve software reliability.

Users will authenticate through Clerk, connect repositories through GitHub, execute tests in isolated workers, store results in PostgreSQL using Prisma, and view AI-generated analysis reports in a Next.js dashboard.

### 1.1 Problem Statement

Software teams often use multiple tools for testing, debugging, code quality analysis, and reporting. Understanding failures requires manually reviewing logs, identifying root causes, and preparing reports.

TestPilot aims to centralize these workflows into a single platform.

### 1.2 Proposed Solution

Build a web application that:

- Connects to authorized GitHub repositories.
- Executes automated tests against selected commits.
- Performs static code analysis and TypeScript validation.
- Runs unit, integration, API, and browser tests where configured.
- Collects test results, error logs, and coverage information.
- Uses OpenAI to explain failures and suggest debugging steps.
- Generates downloadable QA analysis reports.
- Maintains test execution history and repository quality trends.

---

## 2. Product Goals

### 2.1 Primary Goals

1. Provide a simple interface for connecting and managing GitHub repositories.
2. Automate repeatable QA checks for supported projects.
3. Present test execution results in an understandable dashboard.
4. Generate evidence-based AI analysis of test failures.
5. Persist test runs, findings, and reports for future reference.
6. Demonstrate practical QA Engineering, full-stack development, and AI integration skills.

### 2.2 Success Metrics

The initial release will target the following measurable outcomes:

| Metric | Target |
|---|---|
| Successful repository connection | At least 95% of supported connection attempts |
| Test result persistence | 100% of finalized runs have a recorded outcome |
| Report generation | At least 95% of valid analysis requests complete successfully, excluding external service outages |
| Test execution traceability | Every run records its commit SHA and execution status |
| Authorization | All protected repository and report requests enforce ownership |
| AI analysis quality | Findings reference actual test evidence and distinguish facts from hypotheses |

These are product targets, not existing performance claims.

---

## 3. Target Users

### 3.1 QA Engineer

Needs to execute tests, identify defects, review test coverage, and prepare QA reports.

### 3.2 Software Developer

Needs to investigate failing tests, understand error messages, and identify possible fixes.

### 3.3 Team Lead

Needs to review repository quality, test history, unresolved defects, and release risks.

### 3.4 Student or Portfolio Developer

Needs a practical platform demonstrating GitHub integration, automated testing, CI/CD concepts, database design, and AI-assisted debugging.

---

## 4. Technology Stack

| Layer | Technology |
|---|---|
| Programming language | TypeScript |
| Frontend and backend | Next.js App Router |
| UI components | Tailwind CSS and shadcn/ui |
| Authentication | Clerk |
| Database | PostgreSQL |
| ORM | Prisma |
| Repository integration | GitHub App |
| AI analysis | OpenAI API |
| Static analysis | ESLint and TypeScript compiler |
| Unit testing | Vitest |
| Browser testing | Playwright |
| API validation | Zod |
| Background jobs | Redis and BullMQ, when required |
| Test execution | Isolated worker/container |
| Deployment | Next.js hosting plus separate worker hosting |
| Version control | Git and GitHub |

### 4.1 Architectural Principles

- Use a single Next.js application repository without a `src/` directory.
- Separate presentation, business logic, database access, and test execution.
- Keep OpenAI and GitHub credentials on the server.
- Execute external repository code outside the authenticated web server.
- Use Prisma migrations for database schema changes.
- Validate incoming API requests using Zod.
- Require authorization checks on every protected resource.
- Treat AI-generated findings as recommendations, not verified test results.

---

## 5. Functional Requirements

### FR-01: User Authentication

**Priority:** P0 — Required for MVP

The application must support authentication through Clerk.

Requirements:

- Sign up and sign in.
- Sign out.
- Protected dashboard routes.
- Authenticated API access.
- User-specific repository and report access.
- Ownership checks for every protected resource.
- Appropriate unauthorized and forbidden responses.

Acceptance criteria:

- Unauthenticated users cannot access protected dashboards or APIs.
- Users cannot access another user's repositories or reports by changing an ID in a URL or request.
- User records are linked to Clerk identities.

### FR-02: GitHub Integration

**Priority:** P0 — Required for MVP

Users must be able to authorize TestPilot to access selected GitHub repositories.

Requirements:

- Install or authorize a GitHub App.
- Display accessible repositories.
- Select a repository and branch.
- Retrieve repository metadata.
- Record the selected commit SHA for every test run.
- Support private repositories only when explicitly authorized.
- Allow repository disconnection and access revocation.
- Optionally receive GitHub webhooks for push events.

Acceptance criteria:

- Only authorized repositories are displayed.
- Repository ownership is linked to the authenticated application user.
- Each test run identifies the exact repository and commit tested.
- GitHub tokens are never exposed to the browser or stored in plaintext unnecessarily.

### FR-03: Repository Management

**Priority:** P0 — Required for MVP

The dashboard must provide repository management.

Requirements:

- List connected repositories.
- Display repository name, owner, default branch, and latest test status.
- Display the last execution time.
- Open repository details.
- Select a branch or commit for testing.
- Disconnect a repository.

Acceptance criteria:

- Users can view only repositories they are authorized to access.
- Repository status updates after execution completes.
- Empty states and API errors are handled clearly.

### FR-04: Automated Test Execution

**Priority:** P0 — Required for MVP

TestPilot must execute configured QA checks against a selected repository commit.

Initial checks:

1. Dependency installation.
2. ESLint analysis.
3. TypeScript compilation/type checking.
4. Unit tests using Vitest or supported Jest configurations.
5. Test result parsing and persistence.

Subsequent capabilities:

- Playwright end-to-end browser tests.
- API integration testing.
- Code coverage analysis.
- Custom test commands with explicit restrictions.

Requirements:

- Execute jobs asynchronously.
- Track queued, running, completed, failed, cancelled, and timed-out states.
- Record execution timestamps and duration.
- Capture stdout and stderr with appropriate redaction.
- Apply execution timeouts and resource limits.
- Store structured results.
- Handle dependency installation failures.
- Prevent one test job from accessing another job's files or secrets.

Acceptance criteria:

- A user can start a test run and view its status.
- A failed test command is reported as a failure, not a successful run.
- Infrastructure errors are distinguished from test assertion failures.
- The exact commit SHA and configured checks are recorded.
- No external repository code runs directly inside a normal authenticated Next.js request handler.

### FR-05: QA Dashboard

**Priority:** P0 — Required for MVP

The dashboard must summarize test execution and repository quality.

Requirements:

- Total test runs.
- Passed, failed, skipped, and errored test counts.
- Latest execution status.
- Test pass rate.
- Execution duration.
- Failure severity distribution.
- Recent test runs.
- Repository-level summaries.

Acceptance criteria:

- Metrics are calculated from stored execution results.
- Empty states are displayed when no runs exist.
- Dashboard information updates after new runs complete.
- Loading and error states are provided.

### FR-06: AI-Powered QA Analysis

**Priority:** P0 — Required for MVP

The OpenAI API must analyze actual test results and produce a structured QA report.

Inputs may include:

- Test names and outcomes.
- Failure messages and relevant stack traces.
- File paths and line numbers, when available.
- Static analysis findings.
- Test execution duration.
- Coverage information, when available.
- Relevant repository metadata.

The AI must provide:

1. Executive summary.
2. Overall test status.
3. Failed test analysis.
4. Potential root causes.
5. Severity classification.
6. Recommended debugging steps.
7. Suggested additional test cases.
8. Potential testing gaps.
9. Limitations and confidence caveats.

Requirements:

- Use a server-side OpenAI client.
- Configure the model through an environment variable.
- Validate input size and shape.
- Limit the amount of logs and source code sent to the API.
- Handle rate limits, timeouts, and API errors.
- Record analysis status and model metadata where appropriate.
- Store the final report against its test run.
- Treat repository files and logs as untrusted input.
- Distinguish evidence-backed observations from AI hypotheses.

Acceptance criteria:

- A valid test run can be analyzed.
- The generated report references available test evidence.
- The report does not claim tests passed or failed without corresponding results.
- AI service failures do not erase completed test results.
- Users receive an actionable error message when analysis fails.

### FR-07: Test Reports

**Priority:** P0 — Required for MVP

The application must generate a detailed report for each test run.

Report sections:

- Repository and branch.
- Commit SHA.
- Run identifier and timestamp.
- Execution status.
- Checks performed.
- Passed and failed test counts.
- Failed test details.
- Static analysis findings.
- Coverage metrics, if collected.
- AI-generated analysis.
- Recommended next steps.

Requirements:

- View reports in the browser.
- Access previous reports.
- Export reports as JSON.
- Add PDF export in a subsequent release.
- Preserve the relationship between reports and their source test runs.

Acceptance criteria:

- Every report identifies the execution that produced it.
- Reports distinguish unavailable metrics from zero-valued metrics.
- Failed AI analysis does not prevent users from viewing raw test results.

### FR-08: Test History

**Priority:** P1 — Post-MVP enhancement

Requirements:

- List previous test executions.
- Filter by repository, branch, status, and date.
- Compare consecutive runs.
- Identify recurring failures.
- Track changes in pass rate and coverage.

Acceptance criteria:

- Historical results are retrieved from the database.
- Comparisons use compatible metrics and clearly identify missing data.
- Failed and timed-out runs remain available for review.

### FR-09: GitHub Webhooks and Continuous Testing

**Priority:** P2 — Future enhancement

Requirements:

- Receive supported push and pull request events.
- Verify webhook signatures.
- Enqueue test jobs for configured events.
- Prevent duplicate processing of webhook deliveries.
- Display execution results against the associated commit.

Acceptance criteria:

- Invalid webhook signatures are rejected.
- Duplicate deliveries do not create duplicate executions unintentionally.
- Webhook processing is asynchronous and resilient to failures.

---

## 6. Non-Functional Requirements

### 6.1 Security

- Store API keys and secrets in environment variables or a secrets manager.
- Never expose the OpenAI API key through `NEXT_PUBLIC_*`.
- Use least-privilege GitHub permissions.
- Verify Clerk authentication and resource ownership on the server.
- Use short-lived, isolated execution environments.
- Apply execution time, CPU, memory, storage, and output limits.
- Restrict worker network access to reduce SSRF, data exfiltration, and abuse risks.
- Do not mount the host Docker socket into untrusted test containers.
- Avoid passing production credentials to repository test processes.
- Redact tokens and other sensitive values from logs.
- Protect API routes against excessive requests and expensive job submissions.
- Avoid sending private source code to OpenAI unless permitted by the user and organizational policy.

### 6.2 Performance

- Dashboard pages should load efficiently under normal usage.
- Test jobs must execute asynchronously.
- Long-running tests must not block ordinary web requests.
- Paginate repository, test-run, and finding lists.
- Limit test log size and AI request payload size.

### 6.3 Reliability

- Persist execution status transitions.
- Handle worker crashes and interrupted jobs.
- Retry transient external service failures when safe.
- Make job processing idempotent where possible.
- Preserve raw test results when report generation fails.
- Distinguish application errors, infrastructure errors, and actual test failures.

### 6.4 Maintainability

- Use strict TypeScript settings.
- Keep API route handlers small.
- Place business logic in service modules.
- Use shared schemas for request validation.
- Apply Prisma migrations.
- Add automated tests for critical authorization and execution workflows.

---

## 7. Application Pages

| Route | Purpose |
|---|---|
| `/` | Landing page and product overview |
| `/sign-in` | Clerk sign-in |
| `/sign-up` | Clerk registration |
| `/dashboard` | QA metrics and recent runs |
| `/repositories` | Connected repository list |
| `/repositories/[repositoryId]` | Repository details and testing controls |
| `/test-runs` | Execution history |
| `/test-runs/[runId]` | Execution details and raw results |
| `/reports/[runId]` | Detailed QA report |
| `/settings` | Account and integration settings |

Use Clerk's catch-all routing convention for authentication pages if required by the installed Clerk version.

### 7.1 Dashboard UI

The dashboard should contain:

- Sidebar navigation.
- Repository connection action.
- Summary metric cards.
- Recent test execution table.
- Test result distribution chart.
- Recent critical and high-severity findings.
- Quick access to reports.

### 7.2 Repository Details UI

Display:

- Repository name and owner.
- Branch selector.
- Commit SHA.
- Last test execution.
- Available QA checks.
- Run tests action.
- Recent test history.

### 7.3 Report UI

Display:

- Overall execution status.
- Summary statistics.
- Failed test list.
- Error details and file locations.
- AI analysis and recommendations.
- Raw execution logs.
- JSON export action.

---

## 8. Proposed Folder Structure

The project must use Next.js without a `src/` directory.

```text
testpilot/
├── app/
│   ├── (auth)/
│   │   ├── sign-in/
│   │   │   └── [[...sign-in]]/
│   │   │       └── page.tsx
│   │   └── sign-up/
│   │       └── [[...sign-up]]/
│   │           └── page.tsx
│   ├── (dashboard)/
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── repositories/
│   │   │   ├── page.tsx
│   │   │   └── [repositoryId]/
│   │   │       └── page.tsx
│   │   ├── test-runs/
│   │   │   ├── page.tsx
│   │   │   └── [runId]/
│   │   │       └── page.tsx
│   │   ├── reports/
│   │   │   └── [runId]/
│   │   │       └── page.tsx
│   │   └── settings/
│   │       └── page.tsx
│   ├── api/
│   │   ├── github/
│   │   │   ├── connect/
│   │   │   │   └── route.ts
│   │   │   ├── callback/
│   │   │   │   └── route.ts
│   │   │   └── repositories/
│   │   │       └── route.ts
│   │   ├── repositories/
│   │   │   └── route.ts
│   │   ├── test-runs/
│   │   │   ├── route.ts
│   │   │   └── [runId]/
│   │   │       └── route.ts
│   │   └── webhooks/
│   │       └── github/
│   │           └── route.ts
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── ui/
│   ├── dashboard/
│   ├── repositories/
│   ├── test-runs/
│   └── reports/
├── lib/
│   ├── prisma.ts
│   ├── openai.ts
│   ├── github.ts
│   ├── auth.ts
│   ├── queue.ts
│   └── utils.ts
├── services/
│   ├── github.service.ts
│   ├── repository.service.ts
│   ├── test-run.service.ts
│   ├── ai-analysis.service.ts
│   └── report.service.ts
├── worker/
│   ├── runner.ts
│   ├── sandbox.ts
│   └── parsers/
│       ├── vitest.parser.ts
│       ├── jest.parser.ts
│       └── playwright.parser.ts
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── types/
│   ├── github.ts
│   ├── repository.ts
│   └── test-report.ts
├── public/
├── .env.example
├── .gitignore
├── middleware.ts
├── next.config.ts
├── package.json
├── tsconfig.json
├── playwright.config.ts
├── vitest.config.ts
└── README.md
```

**Note:** The actual Prisma configuration file depends on the installed Prisma version. Configure the appropriate schema, adapter, and environment loading conventions for that version. The worker may share the same repository while running as a separate process.

---

## 9. Database Requirements

Use PostgreSQL with Prisma.

### 9.1 User

Fields:

- `id`
- `clerkUserId` — unique
- `createdAt`
- `updatedAt`

Purpose: Links application data to a Clerk identity.

### 9.2 Repository

Fields:

- `id`
- `userId`
- `githubRepositoryId`
- `owner`
- `name`
- `fullName`
- `defaultBranch`
- `isConnected`
- `createdAt`
- `updatedAt`

Constraints:

- Enforce appropriate uniqueness for GitHub repository identifiers and the user's connection.
- Store integration credentials separately and securely.

### 9.3 TestRun

Fields:

- `id`
- `repositoryId`
- `branch`
- `commitSha`
- `status`
- `startedAt`
- `completedAt`
- `durationMs`
- `totalTests`
- `passedTests`
- `failedTests`
- `skippedTests`
- `errorTests`
- `coveragePercentage`
- `createdAt`

The status should distinguish queued, running, passed, failed, cancelled, and infrastructure-error outcomes.

### 9.4 TestResult

Fields:

- `id`
- `testRunId`
- `testName`
- `testFile`
- `status`
- `durationMs`
- `errorMessage`
- `stackTrace`
- `createdAt`

### 9.5 QAReport

Fields:

- `id`
- `testRunId`
- `summary`
- `analysisJson`
- `model`
- `analysisStatus`
- `createdAt`
- `updatedAt`

Use suitable foreign keys, indexes, unique constraints, and deletion policies. Keep large logs in bounded storage or a dedicated artifact store rather than storing unlimited output in ordinary database columns.

---

## 10. API Requirements

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/github/connect` | Start GitHub authorization |
| GET | `/api/github/callback` | Handle GitHub authorization callback |
| GET | `/api/github/repositories` | List authorized repositories |
| POST | `/api/repositories` | Save a repository connection |
| GET | `/api/test-runs` | List authorized test runs |
| POST | `/api/test-runs` | Create a test execution job |
| GET | `/api/test-runs/[runId]` | Retrieve run status and results |
| POST | `/api/webhooks/github` | Process verified GitHub events |
| POST | `/api/ai/analyze` | Generate analysis for an authorized stored test run |

All endpoints must authenticate the user where applicable, validate input, enforce ownership, and return consistent error responses.

The AI endpoint should accept a test-run identifier and retrieve authoritative results from the database. It should not blindly trust arbitrary client-supplied test results.

---

## 11. OpenAI Integration

### 11.1 Configuration

Use the official OpenAI JavaScript/TypeScript SDK.

Environment variables:

```env
OPENAI_API_KEY=
OPENAI_MODEL=
```

The API key must remain server-side.

### 11.2 Analysis Workflow

1. Retrieve the completed test run from PostgreSQL.
2. Verify the authenticated user has permission to access it.
3. Collect relevant test failures, static analysis findings, and coverage data.
4. Remove secrets and truncate excessive logs.
5. Send a bounded, structured request to OpenAI.
6. Validate the returned analysis against a defined schema.
7. Save the analysis and its model metadata.
8. Display the report to the user.

### 11.3 AI Output Structure

The analysis should contain:

- `summary`
- `overallAssessment`
- `findings`
- `recommendedActions`
- `suggestedTestCases`
- `limitations`

Each finding should include, where available:

- Title.
- Severity.
- Evidence.
- Likely cause.
- Affected file or test.
- Recommended action.
- Confidence or uncertainty description.

AI severity classifications must not be confused with the underlying test result. A failed assertion is observed evidence; its root cause is a hypothesis until independently verified.

### 11.4 Cost and Reliability

- Use a configurable model.
- Limit input tokens and response size.
- Set request timeouts.
- Handle rate limits and transient errors.
- Track usage where available.
- Cache or reuse analysis when the inputs are identical and policy permits.
- Do not automatically resend full repository source code when test logs are sufficient.

---

## 12. Testing Strategy

TestPilot itself must also be tested.

### Unit Testing

Use Vitest to test:

- Validation schemas.
- Test result parsers.
- Pass-rate calculations.
- Severity classification logic.
- Report formatting.
- Service functions.

### Integration Testing

Test:

- Prisma database operations.
- Clerk authorization enforcement.
- GitHub integration error handling.
- Test-run status transitions.
- OpenAI response parsing.
- Report persistence.

Mock external services where appropriate.

### End-to-End Testing

Use Playwright to verify:

1. User signs in.
2. Dashboard loads.
3. Repository connection flow works.
4. User starts a test run.
5. Test status updates.
6. Results appear in the report.
7. AI analysis is displayed.
8. Unauthorized users cannot access protected resources.

### Security Testing

Include tests for:

- Cross-user resource access.
- Invalid authentication.
- Tampered repository identifiers.
- Malicious repository scripts.
- Oversized logs and API payloads.
- Secret leakage.
- Invalid GitHub webhook signatures.
- Repeated job submissions.

---

## 13. User Workflow

1. User opens TestPilot.
2. User signs in with Clerk.
3. User connects a GitHub account or installs the GitHub App.
4. User selects a repository and branch.
5. User selects available QA checks.
6. TestPilot creates a test run.
7. A worker retrieves the selected commit in an isolated environment.
8. The worker executes configured checks.
9. Structured results and execution metadata are stored.
10. The user opens the QA report.
11. The OpenAI API analyzes the stored results.
12. The user reviews findings and suggested actions.
13. The user exports the report or starts another test run.

---

## 14. MVP Scope

The first release should prioritize the smallest complete end-to-end workflow.

### Included

- Clerk authentication.
- GitHub repository connection.
- Repository selection.
- Commit-specific test runs.
- ESLint and TypeScript checks.
- Vitest execution for supported repositories.
- Isolated test worker.
- PostgreSQL persistence through Prisma.
- QA dashboard.
- Test history.
- OpenAI-powered analysis.
- Report detail page.
- JSON report export.
- Basic authorization and error handling.

### Excluded from MVP

- Multiple organization workspaces and advanced role management.
- AI-generated code modifications.
- Automatic pull request creation.
- Full-scale distributed test orchestration.
- Comprehensive support for every programming language and test framework.
- Advanced billing and subscription management.
- Automated production deployment decisions.

---

## 15. Implementation Milestones

### Milestone 1: Project Foundation

- Initialize Next.js with TypeScript.
- Configure Tailwind CSS and UI components.
- Integrate Clerk.
- Configure Prisma and PostgreSQL.
- Create the initial database schema.

**Deliverable:** Authenticated application with working database connectivity.

### Milestone 2: GitHub Integration

- Configure a GitHub App.
- Implement authorization and repository listing.
- Save repository metadata.
- Implement ownership validation.

**Deliverable:** Users can connect and select repositories.

### Milestone 3: Automated Testing

- Create test-run records.
- Implement an asynchronous job queue.
- Build the isolated worker.
- Run ESLint, TypeScript, and Vitest.
- Parse and persist results.

**Deliverable:** A user can execute checks against a selected commit and view real results.

### Milestone 4: Dashboard and Reports

- Build dashboard metrics.
- Implement test-run history.
- Display individual test failures.
- Add report detail pages and JSON export.

**Deliverable:** Complete non-AI QA reporting.

### Milestone 5: OpenAI Analysis

- Configure the OpenAI SDK.
- Implement the analysis service.
- Validate structured AI output.
- Store generated reports.
- Handle usage limits and failures.

**Deliverable:** AI-generated analysis grounded in actual execution evidence.

### Milestone 6: Security and Deployment

- Verify resource-level authorization.
- Harden the worker sandbox.
- Add rate limits and execution quotas.
- Configure production environment variables.
- Deploy the web application and worker separately.
- Run the end-to-end test suite.

**Deliverable:** An MVP ready for controlled demonstration.

---

## 16. Risks and Mitigations

| Risk | Mitigation |
|---|---|
| Malicious repository code | Isolated disposable execution environments |
| Exposed GitHub credentials | Least-privilege integration and secure token storage |
| Unauthorized report access | Server-side ownership checks |
| OpenAI hallucinations | Evidence-grounded prompts and schema validation |
| High API costs | Input limits, usage monitoring, and request quotas |
| Long-running tests | Background queue and execution timeouts |
| Inconsistent test output | Framework-specific parsers and normalized result schemas |
| Worker crashes | Persistent job states, safe retries, and failure reporting |
| Database connection exhaustion | Connection pooling and appropriate Prisma deployment configuration |
| Incomplete coverage metrics | Clearly indicate when coverage was not collected |

---

## 17. Definition of Done

The MVP is considered complete when:

- Users can sign in and sign out.
- Users can authorize and connect GitHub repositories.
- Repository access is restricted to authorized users.
- Users can start a test run against a specific commit.
- Supported checks execute in an isolated worker.
- Results are persisted in PostgreSQL through Prisma.
- Users can view execution status and individual failures.
- The OpenAI API can generate a structured analysis from stored results.
- Reports remain accessible even when AI analysis fails.
- Users can export reports as JSON.
- Unit, integration, end-to-end, and critical authorization tests pass.
- Environment secrets are excluded from source control.
- The deployment documentation describes both the Next.js application and worker.

---

## 18. Final Product Vision

TestPilot will provide a unified QA workflow for repository analysis, automated testing, AI-assisted failure investigation, and report generation.

Its primary value is not replacing conventional test frameworks. It is connecting those frameworks to a clear, traceable reporting system that helps engineers understand what failed, why it may have failed, and what to test or investigate next.

**MVP principle:** Execute real tests first, preserve reliable evidence, and use OpenAI to turn that evidence into actionable QA insights.