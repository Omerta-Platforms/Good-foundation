# Good Foundation Group of Schools — Portal

A school management system built with Next.js, TypeScript, and Supabase. Covers a public marketing site, a public result checker, and three role-based dashboards (Admin, Teacher, Student).

## Features

- **Public website** — Home, About, Admissions, Contact, all on a shared milk-and-black visual identity
- **Result Checker** — public lookup by admission number + password + session + term, without exposing any other student data
- **Student dashboard** — profile, attendance, fees, results, downloadable report card (PDF)
- **Teacher dashboard** — manage assigned classes, enter/edit/publish results
- **Admin dashboard** — full CRUD for students, teachers, classes, subjects, positions
- **Three separate logins** — Student and Staff (Supabase Auth, email/password), Admin (shared-password cookie gate)
- **Dark/light mode** — system-aware theme toggle
- **Responsive** — mobile-first, built with Tailwind CSS

## Tech stack

| | |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (student/staff) + shared-password cookie (admin) |
| Icons | Lucide React |
| PDF generation | pdf-lib |
| Notifications | react-hot-toast |

## Getting started

### Prerequisites

- Node.js 18.17+
- A Supabase project

### 1. Install

```bash
git clone <your-repo-url>
cd <repo-folder>
npm install
```

### 2. Environment variables

Create `.env.local` in the project root:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key   # server-only, never expose to the client
ADMIN_DASHBOARD_PASSWORD=choose-a-strong-shared-password    # gates /admin/dashboard
```

- `SUPABASE_SERVICE_ROLE_KEY` bypasses Row Level Security — it's used only in API routes (`supabaseAdmin` client) and must never be imported into a `'use client'` file.
- `ADMIN_DASHBOARD_PASSWORD` is checked by `/api/admin/login`; a correct password sets an `admin_session` cookie that `middleware.ts` checks on every `/admin/dashboard` request.

### 3. Database setup

Run your schema SQL in the Supabase SQL editor. It must include:

- `pgcrypto` extension enabled (used for hashing/verifying the result-checker password)
- A `hash_student_password(p_password TEXT)` RPC that hashes with `crypt()` / `gen_salt('bf')` — called by `POST /api/students` when a student is created or their password is set
- A `check_student_results(...)` RPC — verifies a submitted password against `students.password_hash` and returns only published results, never the hash itself

If `hash_student_password` is missing, creating a student will fail with "Failed to process password."

### 4. Run

```bash
npm run dev
```

Visit `http://localhost:3000`.

### Other scripts

```bash
npm run build   # production build
npm run start   # run the production build
npm run lint    # lint
```

## Project structure

```
src/
  app/
    page.tsx                  # public homepage
    about/ admissions/ contact/
    result-checker/           # public result lookup
    login/                    # student login
    login/admin/ login/staff/ # admin & teacher logins
    admin/dashboard/
    teacher/dashboard/
    student/dashboard/
    api/                      # route handlers (students, teachers, classes, results, etc.)
  components/ui/              # shared Button, Card, Input, ThemeToggle
  lib/
    supabase/                 # browser, server, and admin (service-role) clients
    utils/                    # grading, PDF report cards, misc helpers
  middleware.ts                # route gating for /admin/dashboard and Supabase session refresh
```

## Notes

- The admin dashboard is **not** protected by Supabase Auth — it's a single shared password behind `middleware.ts` + an httpOnly cookie. Treat `ADMIN_DASHBOARD_PASSWORD` like any other production secret.
- Student and teacher accounts use Supabase Auth; each login page double-checks the user's `role` metadata and matching table row before letting them in, and signs them back out if either check fails.
- The public result checker never receives `password_hash` from the server — verification happens inside the `check_student_results` Postgres function, and only published results are returned.
- 
