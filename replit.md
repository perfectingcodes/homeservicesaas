# RankRight

Live SEO audits for home service businesses. Add a client (name + website + city), run an audit, and get a weighted score + categorized findings (GBP, on-page SEO, performance, NAP, technical) with plain-language fixes.

## Run & Operate

- `pnpm --filter @workspace/db run push` — push the v1 schema to the DB (first time)
- `pnpm --filter @workspace/scripts run seed` — seed one agency + one user + one client
- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm --filter @workspace/seo-tool-demo run dev` — run the web app (Vite)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas

### Required env

- `DATABASE_URL` — Postgres connection string
- `GOOGLE_API_KEY` (or `GOOGLE_PLACES_API_KEY` + `PAGESPEED_API_KEY`) — used for Places New + PageSpeed Insights
- `TOKEN_ENC_KEY` — 32-byte key (hex or base64) used by `@workspace/shared` AES-GCM helper. Generate one with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- `PORT` — required by api-server (default 5000)
- `DEV_USER_PROVIDER_ID` (optional, non-prod) — provider id used when no `x-user-id` / bearer is sent; defaults to `dev-user`

### Dev sign-in

The web app uses a header-based auth shim (`x-user-id`/`Authorization: Bearer …`) so Clerk or Supabase Auth can be dropped in by replacing `lib/auth.ts`. In dev, the login page just stores a `providerId` in localStorage which the api-client-react `setAuthTokenGetter` forwards on every request.

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5 (`artifacts/api-server`)
- Web: React + Vite + Tailwind 4 + shadcn (`artifacts/seo-tool-demo`)
- DB: PostgreSQL + Drizzle ORM (`lib/db`)
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec in `lib/api-spec/openapi.yaml`)
- Audit engine: `lib/audit` (Places New + PageSpeed Insights + page-fetch + checks + runner)
- Shared crypto/types: `lib/shared`
- Build: esbuild (api-server), Vite (web)

## Where things live

- DB schema: `lib/db/src/schema/*.ts`
- API contract (source of truth): `lib/api-spec/openapi.yaml` → regenerate with `pnpm --filter @workspace/api-spec run codegen`
- API routes: `artifacts/api-server/src/routes/{clients,audits,me,health}.ts`
- Audit checks: `lib/audit/src/checks/{performance,gbp,seo,tech,nap,analytics}.ts`
- Check weights: `lib/audit/src/checks/types.ts` (`CHECK_WEIGHTS`)
- Audit runner: `lib/audit/src/runner.ts`
- Web theme tokens: `artifacts/seo-tool-demo/src/index.css`
- Auth glue (web): `artifacts/seo-tool-demo/src/lib/{auth,queryClient}.ts`
- Auth middleware (API): `artifacts/api-server/src/middlewares/auth.ts`

## Architecture decisions

- **OpenAPI is the API contract.** Edit `lib/api-spec/openapi.yaml`, then `pnpm --filter @workspace/api-spec run codegen` regenerates the Zod schemas and React Query hooks. Don't hand-write request types.
- **Stubs over half-implementations.** GA4 and GSC checks return `status: "stub"` so the result view can render "Connect to verify" cards without scoring against them. Stub checks are excluded from the weighted score.
- **All audit work is server-side.** The web app only calls `/audits` and renders the result; running a real audit takes ~30–60s.
- **Auth is a thin shim.** `requireUser` maps an `x-user-id` (or `Bearer …`) header to a `users` row → `agency_id`. Every query is scoped by `agency_id`. To swap in Clerk/Supabase: replace the header in `lib/queryClient.ts` and (optionally) verify the JWT in the middleware.
- **Encryption helper is in place but unused in v1.** Module 2 (OAuth tokens for GBP / GA4) will store tokens in `client_connections.access_token_enc` via `encrypt()` from `@workspace/shared`.

## Product

- Agency-scoped tenancy: one user → one agency → many clients
- Add client (name, website, city, phone)
- Run audit: snapshots homepage + up to 3 service pages, calls Google Places New + PageSpeed Insights mobile, runs 17 real checks + 2 stub checks
- Weighted score 0–100, categorized findings, "Fix this next" top-5 ranked by impact = weight × (100 − score)

## Gotchas

- The vite production build (`pnpm --filter @workspace/seo-tool-demo run build`) needs the `@rollup/rollup-darwin-arm64` binary, which the workspace deliberately excludes for Replit/Linux. Build on Linux; type-check anywhere.
- Express 5 types `req.params.x` as `string | string[]`. Cast/coerce when passing to Drizzle's `eq()`.
- `req.auth` is augmented in `artifacts/api-server/src/types/express.d.ts` — keep that file in the tsconfig include.
- Stub checks (`ga4_connected`, `gsc_connected`) are skipped from the weighted score — adding new connect-to-verify checks, use the same `status: "stub"` pattern.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
