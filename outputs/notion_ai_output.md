### Research Report

### 1. Introduction

- Overview
    - TaskWise is a lightweight, web-based task and collaboration manager tailored for students, small teams, and hobby projects. It provides task creation and assignment, project grouping, progress visualization, and collaborative features like comments and mentions.
- Core problem
    - Existing tools are either too complex/expensive for small teams or too simple to support structured workflows. TaskWise targets the gap with an opinionated, minimal, fast, and privacy-conscious tool that reduces coordination overhead while preserving essential capabilities.
- Relevance
    - Distributed and hybrid collaboration, short-lived project teams, and classroom groups need streamlined tooling. Browser-native apps, modern auth, and serverless backends enable fast, low-cost deployments. A focused scope improves adoption and reduces cognitive load.

### 2. Technical Background

- Underlying technologies and principles
    - Web architecture: SPA or multi-page React/Vue frontends. REST/GraphQL APIs. Real-time via WebSockets or Webhooks.
    - Cloud and serverless: Managed databases, object storage, functions-as-a-service for elastic, low-ops infrastructure.
    - Data storage: Relational for transactional integrity and flexible querying. Optional search indices for full text.
    - AuthN/AuthZ: OAuth 2.0/OIDC, session or token-based auth, role- and resource-scoped permissions.
    - Realtime collaboration: Event streams, CRDTs or operational transforms for comment/edit concurrency where needed.
    - Observability and reliability: Centralized logging, tracing, metrics, SLIs/SLOs.
    - Frontend performance: Code splitting, caching, optimistic UI, accessibility, offline-first with PWA.
- Industry trends, innovations, challenges
    - Trends: AI-assisted task management, inbox-to-task capture (email, chat), calendar integration, personal knowledge links.
    - Innovations: Natural language task creation, priority suggestions, focus mode, lightweight automations.
    - Challenges: Context fragmentation across tools, notification fatigue, data portability, privacy compliance (GDPR/CCPA), permissioning edge cases.

### 3. System Architecture / Design Overview

- High-level components
    - Client (Web/PWA)
        - React/Next.js UI with state management (Zustand/Redux), component library (MUI/Chakra/Tailwind), and offline cache (IndexedDB via Workbox).
    - API Gateway and Services
        - GraphQL or REST gateway, backing services for users, projects, tasks, comments, notifications, and AI suggestions.
    - Realtime layer
        - WebSocket server or managed channels (e.g., Pusher/Ably/Supabase Realtime) for task updates, presence, and notifications.
    - Data layer
        - Primary relational DB (PostgreSQL with row-level security).
        - Search engine for query-by-text (OpenSearch/Meilisearch).
        - Object storage for file attachments (S3-compatible).
    - AI services (optional, modular)
        - Task parsing and priority estimation, duplicate detection, due-date extraction. Hosted model endpoints or server-side inference.
    - Integration layer
        - Calendar, email, and chat webhooks. Import/export via CSV/JSON. OAuth/OIDC providers.
    - Observability and platform
        - API metrics, tracing, centralized logs. CI/CD pipelines. Feature flags.
- Interaction and data flow (described)
    1. User requests authenticate via OIDC (Auth0/Clerk/Cognito) and receive a session/JWT.
    2. Client performs CRUD via GraphQL/REST; the gateway routes to microservices or a modular monolith.
    3. Writes go to PostgreSQL; change events are emitted to a message bus (e.g., Postgres logical decoding → Debezium → Kafka) or DB triggers that publish to a realtime broker.
    4. Realtime layer pushes updates to subscribed clients. Search index updates asynchronously.
    5. Background workers handle notifications, reminders, and AI suggestion jobs.
    6. Analytics and telemetry are streamed to a warehouse or time-series store for dashboards.
- Suggested tools, platforms, languages
    - Frontend: TypeScript, React/Next.js, Tailwind or MUI, Vite or Next build.
    - Backend: TypeScript/Node.js (NestJS/Fastify) or Go (Fiber/Echo). GraphQL (Apollo/Helix) or REST (OpenAPI).
    - DB: PostgreSQL + Prisma/Drizzle ORM. Redis for caching and queues.
    - Realtime: [Socket.IO](http://Socket.IO), ws, or managed (Pusher/Ably/Supabase).
    - Infra: Docker, Terraform, GitHub Actions. Deployment on Railway/Render/[Fly.io/Vercel/AWS/GCP](http://Fly.io/Vercel/AWS/GCP).
    - Search: Meilisearch for simplicity, OpenSearch for scalability.
    - Object storage: S3-compatible (AWS S3, MinIO).
    - Auth: Auth0/Clerk/Cognito/Ory.
    - Analytics: PostHog or OpenTelemetry → Grafana/Tempo/Loki/Prometheus.

### 4. Technical Methodology

- Functional scope and workflow
    - Users and organizations
        - Tenancy model: personal workspaces and team workspaces. RBAC: Owner, Admin, Member, Viewer.
    - Projects and groups
        - Projects contain tasks, views, and permissions. Tags and statuses for lightweight taxonomy.
    - Tasks
        - Fields: title, description, assignees, watchers, status, priority, due date, labels, attachments, links, checklist, activity log.
    - Collaboration
        - Comments, mentions, notifications, presence, and audit events. Optional file previews.
    - Views
        - List, board (kanban by status), calendar (due-date), dashboard with metrics and widgets.
- Models, algorithms, protocols, tools
    - AI assistance (optional, phase-gated)
        - NLP for task parsing: extract due dates, assignees, priorities from natural language using rule-based + ML hybrid.
        - Ranking: learning-to-rank or heuristic scoring for priority suggestions.
        - Deduplication: embedding similarity threshold with MinHash/SimHash or cosine similarity in vector store.
    - Realtime
        - WebSocket channels per project/workspace. Backoff and heartbeats. ETag-based cache validation.
        - CRDT-lite: for collaborative checklists/comments, use server authority with conflict resolution via vector clocks and last-write-wins plus merge patches to avoid full CRDT complexity.
    - Security
        - OIDC/OAuth2, short-lived tokens, refresh tokens with rotation. mTLS not needed client-side; TLS everywhere.
        - Row-level security in Postgres and service-level policy checks. Secrets in a vault (AWS Secrets Manager/HashiCorp Vault).
    - Data model (relational sketch)
        - users, organizations, memberships, projects, project_members, tasks, task_assignees, task_labels, comments, attachments, notifications, webhooks, audit_events.
- SDLC and research methodology
    - SDLC: Trunk-based development with feature flags. Automated tests (unit, integration, e2e). Blue-green or canary deployments.
    - Research: Usability tests with students and hobby teams. A/B tests for AI suggestions. Telemetry-driven iteration.

### 5. Implementation Plan

- Phase 1: Planning and requirements
    - Define MVP scope: projects, tasks, assignment, statuses, due dates, list and board views, basic notifications.
    - Non-functional targets: p95 API latency < 200 ms, 99.9% uptime, support for 5k tasks per workspace.
    - Tooling: Notion for specs, Figma for UX, Miro for flows, Mermaid for diagrams.
- Phase 2: Architecture and data design
    - ERD, API schemas (OpenAPI/GraphQL SDL), permission matrix, event schemas.
    - Choose stack: Next.js + NestJS + Postgres + [Socket.IO](http://Socket.IO) + Auth0 + S3 + Meilisearch.
- Phase 3: Core development
    - Backend services: auth integration, projects, tasks, comments, notifications, search indexing, attachments.
    - Frontend: project list, task CRUD, board view, task drawer, comments, notifications center.
    - Realtime: subscription channels, optimistic UI updates.
- Phase 4: QA, security, and performance
    - Tests: Jest/Vitest, Playwright/Cypress for e2e. Load testing with k6/Artillery. Threat modeling (STRIDE), DAST/SAST.
    - Observability: OpenTelemetry instrumentation, Grafana/Prometheus dashboards, error monitoring with Sentry.
- Phase 5: Beta release and telemetry
    - Closed beta for student groups. Collect metrics and feedback. Improve onboarding and empty states.
- Phase 6: Enhancements
    - Calendar view, dashboards, integrations (Google Calendar, email to task), AI-assisted task capture.
- Phase 7: Production hardening
    - Multi-region backups, rate limiting, WAF, data export/import, billing hooks if needed.
- Integration points
    - Calendar: Google/Microsoft. Identity providers. Email ingestion for task creation. Webhooks for automations with Zapier/IFTTT/Make.
- Dependencies and prerequisites
    - Cloud account, domain and TLS certs, object storage, mail provider (SendGrid/Postmark), push notifications (FCM/Web Push), privacy policy and ToS.

### 6. Evaluation Metrics

- Functional and UX
    - Task creation-to-first-view latency
    - Time-to-complete common flows
    - Feature adoption rates and retention
- System performance
    - p95 API latency, WebSocket message delivery time, error rates
    - DB throughput, cache hit rates, search index latency
- Reliability and quality
    - Uptime SLO, incident MTTR, crash-free sessions
    - E2E pass rates, regression density
- Security and compliance
    - Auth failure rates, permission breach tests, dependency vulnerability counts
- Business/usage outcomes
    - Weekly active teams, MAU/WAU ratio
    - Task completion rate, overdue rate reduction
    - Notification acknowledgment rates
- AI-specific (if enabled)
    - Suggestion acceptance rate
    - Precision/recall of entity extraction for due dates and assignees
    - User-reported usefulness scores

### 7. Comparative Analysis

- Comparators
    - Trello: Excellent boards and simplicity, weaker structured task fields and permissions in free tiers.
    - Asana: Rich features and automations, higher complexity and cost for small teams.
    - ClickUp/Notion: Highly flexible, but can be heavy for small, short-lived teams.
- TaskWise positioning
    - Advantages: Opinionated simplicity, faster onboarding, low resource usage, privacy-first, accessible offline-lite PWA.
    - Limitations: Fewer enterprise features, limited custom automation at MVP, smaller integration catalog initially.
    - Innovations: Modular AI assist focused on capture and prioritization, realtime-by-default UX, frictionless import/export to avoid lock-in.

### 8. Challenges and Limitations

- Technical
    - Realtime scaling and fan-out: Use partitioned channels, backpressure, and message compaction. Consider managed realtime infra at early stages.
    - Permission edge cases: Central policy engine with unit tests and contract tests; RLS in DB plus service checks.
    - Search consistency: Eventual consistency with user-visible indexing states and retry queues.
    - Offline support: Conflict resolution strategy and clear UX for sync status.
- Operational
    - Notification fatigue: Digesting and preference centers.
    - Data migration: Versioned schemas and background migrations.
    - Cost control: Serverless for burst, compute autoscaling, and cold-cache warmers.
- Privacy and compliance
    - Data retention policies, export/delete APIs, DPA and subprocessor transparency.

### 9. Future Enhancements

- AI and automation
    - Natural language to task with entity extraction and smart defaults.
    - Priority/risk scoring using behavioral signals and deadlines.
    - Automatic backlogs and sprint suggestions for student teams.
- Integrations
    - Bi-directional calendar sync, Slack/Discord bots, GitHub issues sync for hobby dev teams.
    - Email-to-task pipelines with threading.
- Advanced views and analytics
    - Custom dashboards, burn-up/down charts, workload heatmaps.
    - Goal and OKR-lite tracking for small teams.
- Collaboration depth
    - Shared notes and lightweight docs linked to tasks.
    - Meeting notes to action items extraction.
- Platform
    - Mobile apps with offline-first, push notifications.
    - Multi-tenant admin, audit exports, fine-grained API tokens.

### 10. Conclusion

- Technical feasibility
    - A modern TypeScript stack with Postgres, WebSockets, and serverless complements the lightweight scope. The architecture supports real-time collaboration, robust permissions, and future AI augmentation with modest operational overhead.
- Innovation and impact
    - TaskWise delivers the essentials with exceptional responsiveness and simplicity, plus optional AI that assists rather than overwhelms. It fills a clear niche for students and small teams needing focus and low friction.
- Path forward
    - Build an MVP with core CRUD, board/list views, notifications, and clean onboarding. Validate with pilots, then layer in calendar, dashboards, and targeted AI.

### 11. References (Optional)

- OAuth 2.0 and OpenID Connect: https://oauth.net/2/ and https://openid.net/connect/
- OWASP ASVS and Top 10: https://owasp.org/www-project-application-security-verification-standard/
- Architectural patterns for scalable web apps: https://microservices.io/
- Web performance and PWA: https://web.dev/fast/
- Postgres row-level security: https://www.postgresql.org/docs/current/ddl-rowsecurity.html
- OpenAPI Specification: https://www.openapis.org/
- Event-driven architectures: https://martinfowler.com/articles/201701-event-driven.html