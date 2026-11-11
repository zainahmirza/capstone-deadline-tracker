# Deadline Tracker

Track courses, assignments and due dates in one place. Paste a syllabus and AI extracts the deadlines for you.

**Live:** https://capstone-deadline-tracker.vercel.app

## Run locally (< 5 min)

```bash
npm install
cp .env.example .env.local   # add GEMINI_API_KEY (free key: https://aistudio.google.com)
npm run dev                  # http://localhost:3000
npm test                     # unit/component tests
npm run test:coverage        # coverage report
```

The app works without a key; only "Import from syllabus" needs it (it shows an error and links to manual entry).

## Architecture

| Path | Role |
|---|---|
| `app/page.tsx` | Dashboard: due in 7 days, overdue, counts by status |
| `app/courses`, `app/assignments` | Add/delete courses; list, filter, change status, delete assignments |
| `app/assignments/new` | Manual assignment form |
| `app/assignments/import` | AI import: paste text → extract → review → save |
| `app/api/extract/route.ts` | Server-only route handler that calls the LLM |
| `lib/extract.ts` | Prompt + validation of the model's JSON output |
| `lib/storage.ts` | localStorage persistence (no backend) |
| `components/` | `AssignmentRow`, `ExtractionReview`, `SiteNav` |

## AI integration

- **What:** the user pastes a syllabus; the model returns a JSON array of `{title, dueDate, notes}`.
- **Why:** typing every deadline by hand is the slowest part of using a tracker.
- **Model:** Google Gemini (`gemini-2.5-flash`, free tier) called from the server route with JSON output mode, temperature 0. The key lives only in `GEMINI_API_KEY` (never `NEXT_PUBLIC_`).
- **Prompt:** system instruction in `lib/extract.ts`: only include items with a specific date, never invent items, return `[]` if none.
- **Safety:** output is untrusted. `parseExtraction` strips code fences, requires an array, drops items with empty titles or impossible dates, dedupes, and caps lengths. The user reviews and unticks anything wrong before saving.
- **Fails safely:** missing key, timeout (25 s), non-200, or invalid JSON → an error message with an "Add manually" link. Nothing is saved without review.

## Known limitations / future work

- Data is per-browser (localStorage); no accounts or sync.
- Assignments can't be edited after creation (only status/delete); courses can't be edited.
- Pasted text only (no PDF upload); 15,000 character limit.
- No calendar view; removed stub pages (calendar, settings) to avoid shipping unfinished screens.
- Pre-existing lint warnings (`react-hooks/set-state-in-effect`) from reading localStorage in effects.

## Rollback / monitoring

Vercel keeps every deployment. Rollback = Vercel dashboard → Deployments → previous good deploy → "Promote to Production" (or `git revert` and push to `main`). `/health` shows the app is serving.
