# Tax & Finance Assistant Algeria (SME-Tax)

Smart tax advisor for Algerian SMEs — Arabic RTL UI, JWT auth, penalty calculator, tax calendar, knowledge base, news, and admin panel.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080, path: /api)
- `pnpm --filter @workspace/sme-tax run dev` — run the frontend (port 22912, path: /)
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/scripts run seed` — seed DB with tax rules, knowledge Q&As, news, admin user
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, shadcn/ui, wouter, TanStack Query
- API: Express 5, JWT auth (custom HMAC tokens, no library needed)
- DB: PostgreSQL + Drizzle ORM, drizzle-zod
- Validation: Zod v4, Orval codegen from OpenAPI spec
- Build: esbuild (CJS bundle for API server)

## Where things live

- `lib/api-spec/openapi.yaml` — OpenAPI contract (source of truth for all API shapes)
- `lib/api-client-react/src/generated/api.ts` — generated React Query hooks
- `lib/api-zod/src/generated/api.ts` — generated Zod schemas (used server-side)
- `lib/db/src/schema/` — Drizzle table definitions (users, companies, tax_rules, penalties, knowledge, news, reminders)
- `artifacts/api-server/src/routes/` — Express route handlers (auth, company, dashboard, penalties, calendar, reminders, knowledge, news, rules, admin)
- `artifacts/api-server/src/lib/` — penalty-engine.ts, calendar-engine.ts, auth.ts
- `artifacts/sme-tax/src/` — React frontend (App.tsx, pages/, lib/auth.ts)
- `scripts/src/seed.ts` — DB seeder

## Architecture decisions

- **Contract-first API**: OpenAPI spec → Orval codegen → React Query hooks + Zod schemas. Never write raw fetch calls in the frontend.
- **JWT auth without a library**: custom HMAC-SHA256 tokens stored in localStorage as `auth_token`, sent as `Authorization: Bearer <token>` header. Password hashing via SHA-256 + static salt.
- **Calendar events generated dynamically**: no calendar_events table — events are computed per-request from the company's tax regime using `calendar-engine.ts`. Simpler and always in sync with the current year.
- **Reminders are derived**: reminders computed from calendar events (days until due) rather than persisted. The reminders table exists for future persistence if needed.
- **Penalty engine from Algerian law**: `penalty-engine.ts` encodes the exact penalty schedules from the Algerian tax code PDFs — G50 (15%→35%), G12 (10%/20%/25%), G12BIS fixed fines, IBS/IRG progressive, CNAS 10%.

## Product

- Arabic RTL UI (dir=rtl) — all labels/messages in Arabic, French technical terms (G50, TVA, etc.) unchanged
- Regime-aware tax calendar (real / simplified_real / forfaitaire) with urgency color-coding
- Penalty calculator for 7 declaration types with full breakdown table
- Knowledge base Q&A (8 seed items) searchable by category and regime
- Tax news and announcements feed
- Admin panel: user management, tax rule editing, platform stats
- Seed admin account: `admin@smetax.dz` / `Admin@2024`

## User preferences

- Full Arabic UI — no English text visible to end users
- Tax regime labels: real = النظام الحقيقي, simplified_real = النظام الحقيقي المبسط, forfaitaire = النظام الجزافي

## Gotchas

- Orval overwrites `lib/api-zod/src/index.ts` and adds stale exports. The codegen script in `lib/api-spec/package.json` runs a post-process node command to strip them — never remove it.
- Calendar events are 0-indexed by id from the engine — ids reset each request. Don't use them as stable DB keys.
- The `ListCalendarEventsQueryParams` / `ListKnowledgeItemsQueryParams` / `ListRulesQueryParams` are the generated Zod names — not the OpenAPI operationId suffixed `Params`.

## Pointers

- `pnpm-workspace` skill — workspace structure, TypeScript setup, package details
- `lib/api-spec/openapi.yaml` — full API contract with all request/response shapes
