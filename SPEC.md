# SPEC.md — Deadline Tracker

## What it is

A web app for university students to keep track of courses, assignments and due dates in one place, so nothing gets missed.

## Who it's for

Students juggling several courses at once, each with its own deadlines, quizzes and project dates.

## Screens (routes)

| Route | Screen | Purpose |
|---|---|---|
| `/` | Dashboard | What's due soon, overdue items, quick stats |
| `/courses` | Courses | List of courses, add/edit a course |
| `/assignments` | Assignments | All assignments, filter by course and status |
| `/assignments/new` | Add assignment | Form: title, course, due date, status |
| `/calendar` | Calendar | Month view of deadlines |
| `/settings` | Settings | Display name, reminder preferences |
| `/health` | Health check | Shows the app is up and fetching data |

## Data

- **Course:** id, name, code, color
- **Assignment:** id, title, courseId, dueDate, status (`todo` / `in-progress` / `done`), notes

## Stack

- Next.js (App Router) + TypeScript
- Tailwind CSS with base design tokens (colors, spacing, type scale)
- Server Components by default, Client Components only where there's interactivity (forms, filters)
- Deployed on Vercel, with a preview URL on every push
- Frontend only: mock data first, then localStorage

## Out of scope (for now)

Login, a real backend, notifications, sharing with other users.

## Done when

- Every screen above exists as a routed page
- Works at 375px (phone) and 1280px (desktop)
- Deployed with no build errors
- No secrets committed to the repo
