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

- **App Router** — use `app/` directory with server components by default; client components only when interactivity is required.
- **Supabase Auth** — handles registration, login, and session management. All protected routes must redirect unauthenticated users to `/login`.
- **Row-Level Security (RLS)** — every Supabase table must enforce RLS so users can only access their own rows. Never bypass RLS in server actions.
- **Server Actions** — prefer Next.js Server Actions over API routes for mutations (create/edit operations).
- **Data fetching** — fetch data in Server Components using the Supabase server client (`createServerClient`). Use the browser client only inside client components.

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
- Only the current active streak is shown; historical longest streak is out of scope.

### Share Progress (chosen extension)
- From the progress view, the user can generate a plain-text summary (total training days + max weights per exercise) and copy it to the clipboard.
- No public URL or external sharing — clipboard copy only.

## Key Business Rules

- Users never see other users' data; enforce at DB level via RLS and at query level by filtering on `user_id`.
- The app targets desktop first; mobile must be functional but not polished.
- No automated notifications, no third-party integrations, no advanced analytics.
