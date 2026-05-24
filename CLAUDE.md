# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fitness Habit Tracker — a web app where users log daily training or rest sessions, track consecutive-day streaks, and view workout history and max weights per exercise.

**Stack:** Next.js 15 (App Router) · Supabase (Postgres + Auth) · TypeScript strict · Tailwind CSS · Vercel

## Commands

```bash
npm run dev        # start dev server (localhost:3000)
npm run build      # production build
npm run lint       # ESLint
```

> No test suite is required per project spec.

## Architecture

- **App Router** — use `app/` directory with Client Components and `createBrowserClient()` for all data fetching. Server Actions with `createServerClient()` for all mutations.
- **Supabase Auth** — handles registration, login, and session management. All protected routes must redirect unauthenticated users to `/login`.
- **Row-Level Security (RLS)** — every Supabase table must enforce RLS so users can only access their own rows. Never bypass RLS in server actions.
- **Server Actions** — prefer Next.js Server Actions over API routes for mutations (create/edit operations).
- **Data fetching** — fetch data in Client Components using the Supabase browser client (`createBrowserClient`). Use SWR for `/history`. Use `createServerClient` only in Server Actions and `middleware.ts`.

### Architecture Decision Records

Three architectural decisions are formally recorded in [`docs/decisions/`](docs/decisions/):

| ADR | Decision | Chosen |
|-----|----------|--------|
| [ADR-0001](docs/adr/0001-modelo-de-datos.md) | Data model | 5 tables: `habits`, `check_ins`, `session_exercises`, `profiles`, `badges` |
| [ADR-0002](docs/adr/0002-estrategia-autenticacion.md) | Auth strategy | Central middleware with `@supabase/ssr` |
| [ADR-0003](docs/adr/0003-frontera-cliente-servidor.md) | Client/server boundary | Client Components everywhere with browser client; Server Actions for mutations |

### Database Schema

```sql
habits (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid REFERENCES auth.users NOT NULL,
  name            text NOT NULL,
  description     text CHECK (length(description) <= 200),
  frequency_type  text NOT NULL CHECK (frequency_type IN ('daily', 'weekly')),
  frequency_count int,
  deleted_at      timestamptz,
  created_at      timestamptz DEFAULT now()
)

check_ins (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  habit_id    uuid REFERENCES habits(id) NOT NULL,
  date        date NOT NULL,
  type        text NOT NULL CHECK (type IN ('training', 'rest')),
  created_at  timestamptz DEFAULT now(),
  UNIQUE (user_id, habit_id, date)
)

session_exercises (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  check_in_id   uuid REFERENCES check_ins(id) ON DELETE CASCADE NOT NULL,
  exercise_name text NOT NULL,
  muscle_group  text NOT NULL,
  weight        numeric NOT NULL
)

profiles (
  user_id     uuid PRIMARY KEY REFERENCES auth.users,
  best_streak int NOT NULL DEFAULT 0
)

badges (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid REFERENCES auth.users NOT NULL,
  badge_type  text NOT NULL CHECK (badge_type IN ('week_1', 'days_30')),
  unlocked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_type)
)
```

RLS is enabled on all tables. `session_exercises` policies filter via `check_in_id → check_ins.user_id`. Habits use soft delete (`deleted_at IS NOT NULL` excludes active habits; their check-ins remain visible in history and max weights).

### Auth Implementation

- `middleware.ts` — refreshes session token and redirects unauthenticated requests to `/login` before any Server Component runs.
- `createServerClient()` — use in Server Actions and `middleware.ts` only.
- `createBrowserClient()` — use in all Client Components for data fetching.

### Mutation Pattern

```
Client Component → Server Action (validation + createServerClient()) → write to Supabase → re-fetch via SWR or router.refresh()
```

## Classified Specs

### Auth
- Register and login with email + password via Supabase Auth.
- Logout ends the session and redirects to login.
- Any unauthenticated access to a protected page redirects to login immediately.

### Habits (CRUD)
- Users create habits with name, description, and frequency (`daily` | `weekly`).
- Habits can be edited or deleted. Deleting a habit prevents future check-ins on it.
- Empty state (no habits) must render without errors.

### Check-ins
- Per-day check-in marks the day as `training` or `rest`.
- `training` check-ins require at least one muscle group, with exercises and weights per exercise.
- `rest` check-ins require no additional data.
- Check-ins are **immutable** once saved — no edits, no deletes.
- Only one check-in per user per date is allowed; the system rejects duplicates and surfaces the existing record.
- Retroactive check-ins are allowed: the saved date is the user-selected date, not today.

### History & Max Weights
- History lists past training sessions with date, muscle groups, exercises, and weights.
- Max weight per exercise is derived from the user's own check-in history (highest weight recorded across all sessions for that exercise).

### Streak Logic
- Streak = the count of the most recent consecutive days where the check-in type is `training`.
- A `rest` check-in **breaks** the streak.
- A day with **no check-in** also **breaks** the streak.
- Current streak and best historical streak (`best_streak` in `profiles` table) are both shown in `/progress`. `best_streak` is updated when the current streak surpasses it and never decremented.

### Share Progress (chosen extension)
- From the progress view, the user can generate a plain-text summary (total training days + max weights per exercise).
- Content is always copied to the clipboard. If the browser supports the Web Share API, the native share dialog is also offered. If not, only clipboard copy runs — no error shown.
- No public URL or persistent sharing.

## Key Business Rules

- Users never see other users' data; enforce at DB level via RLS and at query level by filtering on `user_id`.
- The app targets desktop first; mobile must be functional but not polished.
- No automated notifications, no third-party integrations, no advanced analytics.
