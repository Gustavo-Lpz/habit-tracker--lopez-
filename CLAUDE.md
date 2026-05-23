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

- **App Router** — all screens are Client Components using the Supabase browser client. No Server Components for data fetching.
- **Supabase Auth** — handles registration, login, and session management. Route protection via `middleware.ts` using `@supabase/ssr` — intercepts requests before rendering, no content flash.
- **Row-Level Security (RLS)** — every Supabase table must enforce RLS so users can only access their own rows.
- **Mutations** — direct calls to the Supabase browser client from Client Components. No Server Actions.
- **Data fetching** — use the Supabase browser client inside Client Components. History screen uses SWR. No `createServerClient` for data fetching.

## Classified Specs

### Auth
- Register and login with email + password via Supabase Auth.
- Logout ends the session and redirects to login.
- Any unauthenticated access to a protected page redirects to login immediately.

### Habits (CRUD)
- Users create habits with name, description (max 200 chars), and frequency (`daily` | `weekly`).
- Habits can be edited or deleted. Deleting a habit is a soft delete (`deleted_at`); prevents future check-ins but preserves history.
- Empty state (no habits) must render without errors.

### Check-ins
- One check-in per user per day — global uniqueness `UNIQUE(user_id, date)`, independent of which habit.
- Check-in type: `training` or `rest`.
- `training` check-ins require at least one exercise row (muscle group + exercise name + weight, all free text, max 100 chars each). Stored in a separate `exercises` table with FK to `check_ins`.
- `rest` check-ins require no additional data.
- Check-ins are **immutable** once saved — no edits, no deletes. UI shows read-only view if the date already has a check-in.
- Retroactive check-ins are allowed: the date comes from the client, no limit on how far back.

### History & Max Weights
- History lists past training sessions with date, muscle groups, exercises, and weights.
- Max weight per exercise is derived from the user's own check-in history (highest weight recorded across all sessions for that exercise).

### Streak Logic
- Current streak = count of the most recent consecutive days with `training` check-in. Calculated on-the-fly.
- A `rest` check-in **breaks** the streak. A day with **no check-in** also **breaks** the streak.
- Best streak (`best_streak INT`) is persisted on the user record. Updated whenever the current streak exceeds it; never decremented.
- `/progress` shows both: current streak and best streak.

### Dashboard (`/dashboard`)
- Shown after login. Displays: current streak, last check-in recorded, active habits list with quick access to today's check-in, and links to `/history` and `/progress`.

### Share Progress
- From `/progress`, generates plain-text summary: "Entrené X días en total." + max weights per exercise.
- Copies to clipboard. Also triggers Web Share API if the browser supports it (same plain-text content). Silent fallback to clipboard-only if Web Share is not supported.

## Key Business Rules

- Users never see other users' data; enforce at DB level via RLS and at query level by filtering on `user_id`.
- The app targets desktop first; mobile must be functional but not polished.
- No automated notifications, no third-party integrations, no advanced analytics.
