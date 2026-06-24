# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Development
npm run dev          # Start Express server with nodemon (auto-reload)
npm run dev:front    # Build Svelte/Vite frontend in watch mode (run alongside dev)

# Testing
npm run test:unit          # Run Vitest unit tests once
npm run test:unit:watch    # Run Vitest in watch mode
npm run test:e2e           # Run Playwright e2e tests (requires server on :3000)

# Code quality
npm run lint         # ESLint on src/ and tests/
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier write
npm run format:check # Prettier check (used in CI)

# Docker
docker compose up --build   # Start app + PostgreSQL; runs migrations + seeds admin on startup

# Database
npx prisma migrate dev       # Apply new migrations
npx prisma studio            # Open Prisma visual editor
```

## Architecture

TimeFlow is an employee time-tracking web app for SMEs. It is a classic server-rendered MVC app with a small Svelte component layer for calendar UIs.

**Stack:** Express 5 + EJS templates (server side) | Svelte 5 + Vite (bundled to `public/dist/`) | PostgreSQL 16 + Prisma 7

**Request flow:**
1. `src/server.js` → starts server on `PORT`
2. `src/app.js` → mounts middlewares (session, static, EJS), then all route files
3. Middleware guards in `src/middlewares/auth.middleware.js` protect routes:
   - `requireSetupComplete()` — redirects to `/setup` if no admin exists (checked once per process)
   - `requireAuth()` — redirects to `/login` if no session
   - `requireAdmin()` — 403 if role ≠ admin
4. Routes call Prisma directly or via `src/models/workSession.model.js`

**Route modules:**
- `auth.routes.js` — `/login`, `/logout`
- `setup.routes.js` — `/setup` (first-run admin creation)
- `admin.routes.js` — `/admin/**` (dashboard, employees, sessions, schedule, change requests)
- `employee.routes.js` — `/employee/**` (dashboard, clock in/out, schedule, overtime)
- `schedule.routes.js` — `/schedule/**` (API for slot management)

**Frontend components** (`src/frontend/components/`): `CalendarAdmin.svelte` and `CalendarEmployee.svelte` are mounted on EJS pages via `src/frontend/main.js`. Vite bundles everything to `public/dist/bundle.js`.

**Schedule validation** lives in `src/services/schedule.service.js`: slot hours must be 07:00–20:00, max consecutive hours per employee, weekly hours limit (default 35h).

## Database

Six Prisma models: `User` (role: admin|employee), `WorkSession` (clock in/out records), `ScheduleSlot` (type: work|break), `EmployeeRestrictions` (weekly target, max consecutive hours), `OvertimeDeclaration`, `ScheduleChangeRequest` (status: pending|approved|rejected).

Schema is in `prisma/schema.prisma`. Migrations are in `prisma/migrations/`.

## Environment

Copy `.env` for local dev — it already contains working defaults for Docker:

| Variable | Default |
|---|---|
| `DATABASE_URL` | `postgresql://timeflow:timeflow_dev@localhost:5433/timeflow` |
| `PORT` | `3000` |
| `SESSION_SECRET` | `dev_secret_change_in_production` |
| `NODE_ENV` | `development` |

The Docker PostgreSQL container exposes port **5433** (not 5432) to avoid conflicts.

## Testing notes

- **Unit tests** (`tests/unit/`) use Vitest with Node environment; Prisma is mocked via `vi.mock`.
- **E2E tests** (`tests/*.spec.js`) use Playwright against a live server. `tests/seed-test.js` is the global setup that seeds the test database.
- The `test` script in package.json is a placeholder — always use `test:unit` or `test:e2e`.

## Code style

ESLint flat config (`eslint.config.mjs`): backend files use CommonJS globals, `src/frontend/` uses ESM + browser globals, Svelte files have their own plugin rules, test files have Vitest globals. Prettier enforces single quotes, 2-space indent, trailing commas (es5), 100-char print width.
