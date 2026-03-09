# learning monorepo

A Bun-powered monorepo for a modern full-stack setup:

- `apps/web` — `Next.js` frontend with App Router, Tailwind CSS v4, and `shadcn/ui`-ready structure
- `apps/cms` — separate `Payload CMS` backend app
- `packages/db` — shared `Drizzle ORM` package for PostgreSQL
- `packages/config` — shared local ports and service URLs
- `docker-compose.yml` — local PostgreSQL, Redis, and RabbitMQ
- root `ESLint` + `Prettier` — flat lint config and shared formatting rules

## Versions used

Latest stable packages were used where practical on March 9, 2026.

- Bun `1.3.10`
- Turbo `2.8.14`
- Frontend Next.js `16.1.6`
- Payload `3.79.0`
- CMS Next.js `15.4.11` (kept on a Payload-safe release line)
- React `19.2.4`
- Tailwind CSS `4.2.1`
- Drizzle ORM `0.45.1`
- PostgreSQL driver `pg 8.20.0`
- Redis client `ioredis 5.10.0`
- RabbitMQ client `amqplib 0.10.9`

## Monorepo layout

```text
apps/
  cms/
  web/
packages/
  config/
  db/
```

## Prerequisites

Install these locally:

- Bun `>= 1.3.10`
- Docker Desktop
- Node.js `>= 20.9` for ecosystem compatibility

## Local setup

1. Copy env files:

   ```bash
   cp .env.example .env
   cp apps/cms/.env.example apps/cms/.env
   ```

   > Both files are required. Next.js only reads env files from the app's own directory (`apps/cms`), not the monorepo root. Without `apps/cms/.env`, Payload won't have `DATABASE_URL` or `PAYLOAD_SECRET`.

2. Start local infrastructure:

   ```bash
   docker compose up -d
   ```

3. Install dependencies:

   ```bash
   bun install
   ```

4. Generate the Drizzle migration (shared `packages/db`):

   ```bash
   bun run db:generate
   bun run db:push
   ```

5. Run Payload migrations (creates all CMS tables in PostgreSQL):

   ```bash
   bun run --cwd apps/cms payload migrate
   ```

   > Do **not** use `push: true` in `payload.config.ts`. When `push` is enabled, Payload runs `drizzle-kit push` on startup which shows an **interactive terminal prompt** if it detects existing tables. That prompt blocks the process from responding to any HTTP requests — the browser will hang indefinitely. Always use `push: false` and run `payload migrate` manually instead.

6. Generate Payload helpers (only needed after changing collections):

   ```bash
   bun run --cwd apps/cms payload:importmap
   bun run --cwd apps/cms payload:types
   ```

7. Start each app in its **own terminal**:

   Terminal 1 — CMS (Payload admin on port 4001):
   ```bash
   bun run dev:cms
   ```

   Terminal 2 — Web frontend (port 4000):
   ```bash
   bun run dev:web
   ```

   > Do not use `bun run dev` (Turbo parallel) for development. Running both apps at the same time causes them to compete for CPU during webpack compilation. The CMS first-compile takes 30–120 s — if the web app is also compiling in parallel, requests time out and the browser shows a blank page or hangs.

8. **Create your first admin user** (fresh install only):

   On the very first run after a clean database, Payload has no users. Navigate to:

   ```
   http://localhost:4001/admin/create-first-user
   ```

   Enter an email and password to create the initial admin account. You will be redirected to the dashboard automatically. This step is required — without it `/admin` redirects to login, and login will always fail because there are no users in the database.

## Code quality

- Lint: `bun run lint`
- Auto-fix lint issues: `bun run lint:fix`
- Format all files: `bun run format`
- Check formatting only: `bun run format:check`

Formatting is handled by `Prettier`, while code-quality rules are handled by the root flat `ESLint` config.

## Local URLs

- Frontend: http://localhost:4000
- CMS: http://localhost:4001
- Payload admin: http://localhost:4001/admin
- RabbitMQ management: http://localhost:15672

## Notes on deployment

### Frontend on Vercel

Deploy `apps/web` to Vercel.

Recommended Vercel settings:

- Root directory: `apps/web`
- Install command: `bun install`
- Build command: `bun run build`
- Output: default Next.js output

Set at least:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_CMS_URL`

### Backend deployment for Payload

You said you were unsure about backend deployment. The practical recommendation is:

- deploy `apps/web` to **Vercel**
- deploy `apps/cms` to a **container-friendly host** such as Railway, Fly.io, Render, or a VPS

Why:

- Payload can run on Vercel in some setups, but a separate CMS backend with PostgreSQL, Redis, RabbitMQ, uploads, and background-style integrations is usually easier to manage on a long-running container host.
- RabbitMQ especially points toward a non-Vercel backend architecture.

Recommended backend target:

- **Railway** for easiest setup
- **Fly.io** if you want more infra control
- **Render** if you want simple managed services

### Suggested production split

- Vercel: `apps/web`
- Railway/Fly/Render: `apps/cms`
- Managed PostgreSQL: Neon, Supabase, Railway Postgres, or RDS
- Managed Redis: Upstash or Redis Cloud
- Managed RabbitMQ: CloudAMQP or self-hosted RabbitMQ

## Accounts you will likely need

You asked to be told when accounts are needed. For deployment you will likely need:

- Vercel account
- One backend hosting account: Railway, Fly.io, or Render
- PostgreSQL provider account unless self-hosted
- Redis provider account unless self-hosted
- RabbitMQ provider account unless self-hosted

If you want the lowest-friction path, use:

- Vercel
- Railway
- Upstash Redis
- CloudAMQP
- Neon Postgres

## Payload CMS gotchas

- **`push: false` always** — never enable `push: true` in `payload.config.ts`. It triggers an interactive `drizzle-kit push` prompt on startup that blocks all HTTP requests.
- **Both `.env` files are required** — root `.env` and `apps/cms/.env`. Next.js only loads from the app directory.
- **Separate terminals** — run `dev:cms` and `dev:web` in separate terminals, not together via Turbo. The CMS webpack compile is heavy (~60s cold) and starves the other app.
- **First run requires creating a user** — on a fresh DB there are no users. Go to `http://localhost:4001/admin/create-first-user` before trying to log in.
- **First compile is slow** — the admin route compiles ~5000 modules on first load. The browser will appear to hang for 30–120s then render. This is normal.
- **`bun run dev` (Turbo) is fine for CI/build** — but use separate terminals locally for the reason above.
- **After changing collections** — regenerate the importMap and types: `bun run --cwd apps/cms payload:importmap && bun run --cwd apps/cms payload:types`, then create and apply a new migration: `bun run --cwd apps/cms payload migrate:create --name <name>` followed by `bun run --cwd apps/cms payload migrate`.

## Next steps

1. Add your real collections and auth flows to `apps/cms/src/collections/`
2. Deploy `apps/web` to Vercel
3. Deploy `apps/cms` to Railway or Fly.io
