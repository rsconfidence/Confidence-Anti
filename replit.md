# Professional Portfolio Website

A full-stack developer portfolio with projects, case studies, gallery, blog, and contact form — backed by PostgreSQL and a live Express API.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 8080)
- `pnpm --filter @workspace/portfolio run dev` — run the portfolio frontend (port 21113)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string (auto-provisioned)

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, Tailwind CSS, Framer Motion, Wouter routing
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — API contract (source of truth)
- `lib/db/src/schema/` — Drizzle table definitions (projects, case-studies, gallery, blog, contact, skills)
- `artifacts/api-server/src/routes/` — Express route handlers
- `artifacts/portfolio/src/` — React frontend (pages + components)
- `lib/api-client-react/src/generated/` — Generated React Query hooks (do not edit)
- `lib/api-zod/src/generated/` — Generated Zod validation schemas (do not edit)

## Architecture decisions

- OpenAPI-first: spec in `lib/api-spec/openapi.yaml` gates all codegen; never hand-write hooks or Zod schemas that Orval already generates
- Frontend-only filtering for projects (category/tech/year) rather than DB-level — dataset is small and fast enough
- Gallery lightbox, project filter, and blog search are all client-side for instant UX with no extra round trips
- Contact submissions saved to DB; email delivery can be layered on later (Resend) without schema changes
- No auth on first build — the contact submissions endpoint is admin-only in spirit; add auth when needed

## Product

- `/` — Hero landing page with featured projects, skills, and recent blog posts
- `/about` — Professional bio, journey, and tech expertise
- `/projects` — Filterable portfolio grid with stats
- `/projects/:slug` — Individual project detail with gallery and links
- `/case-studies` — Deep-dive case study list and detail pages
- `/gallery` — Image gallery with lightbox and category filter
- `/blog` — Blog listing with search and category filter
- `/blog/:slug` — Blog post with table of contents
- `/resume` — Work history, education, skills, certifications
- `/contact` — Contact form (saved to DB) + newsletter signup

## Gotchas

- Always run `pnpm --filter @workspace/api-spec run codegen` after changing `openapi.yaml`
- Do NOT edit generated files in `lib/api-client-react/src/generated/` or `lib/api-zod/src/generated/`
- Blog post `content` field accepts markdown; the frontend renders it directly
- The `featured` boolean on projects controls what shows on the homepage hero section
- `pnpm --filter @workspace/db run push` applies schema to the dev DB; production is handled by Replit Publish

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
