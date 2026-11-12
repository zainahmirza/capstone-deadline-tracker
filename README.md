# Deadline Tracker

Track courses, assignments and due dates in one place. Paste a syllabus and AI extracts the deadlines for you.

**Live:** https://capstone-deadline-tracker.vercel.app

## Run locally (under 5 minutes)

```bash
npm install
cp .env.example .env.local   # on Windows: copy .env.example .env.local
# edit .env.local and add your GROQ_API_KEY (free key: https://console.groq.com/keys)
npm run dev                  # http://localhost:3000
npm test                     # unit/component tests
npm run test:coverage        # coverage report
```

The app works without a key. Only "Import syllabus" needs it; without one it shows an error and links to manual entry.

### Environment variables

| Name | Purpose |
|---|---|
| `GROQ_API_KEY` | Server-only key for the AI import. Never commit it, never prefix it with `NEXT_PUBLIC_`. |
| `GROQ_MODEL` | Model ID, default `openai/gpt-oss-20b` |
| `NEXT_PUBLIC_APP_NAME` | Display name (optional) |

## Architecture

| Path | Role |
|---|---|
| `app/page.tsx` | Dashboard: due in the next 7 days, overdue, counts by status |
| `app/courses` | Add and delete courses |
| `app/assignments` | List, filter by course/status, change status, delete |
| `app/assignments/new` | Manual assignment form |
| `app/assignments/import` | AI import: paste text, extract, review, save |
| `app/api/extract/route.ts` | Server-only route handler that calls the LLM |
| `lib/extract.ts` | Prompt and validation of the model's JSON output |
| `lib/storage.ts` | localStorage persistence (no backend) |
| `components/` | `AssignmentRow`, `ExtractionReview`, `SiteNav` |
| `tests/` | Vitest + React Testing Library tests |

## AI integration

- **What it does:** the user pastes a syllabus; the model returns `{title, dueDate, notes}` items.
- **Why:** typing every deadline by hand is the slowest part of using a deadline tracker.
- **Model and provider:** Groq (OpenAI-compatible API), model `openai/gpt-oss-20b` with low reasoning effort, JSON output mode, temperature 0. A second model, `openai/gpt-oss-120b`, is tried if the first is unavailable. The key is read only on the server in `app/api/extract/route.ts`.
- **Prompt:** the system prompt in `lib/extract.ts` says to include only items with a specific date, never invent items or dates, and return an empty list if nothing is found.
- **Validation:** model output is treated as untrusted. `parseExtraction` strips code fences, requires a list, drops items with empty titles or impossible dates, removes duplicates and caps lengths. The user reviews and can untick any item before anything is saved.

## How it fails safely

- Missing key, timeout (25 s per attempt), HTTP errors, temporary overload (one retry, then the fallback model) or invalid JSON all show an error message with an "Add manually" link.
- Nothing is saved without the user's review.
- Empty results show a "no dated assignments found" message.

## Known limitations and future work

- Data is stored per browser in localStorage; there are no accounts or sync.
- Assignments can't be edited after creation (only status and delete); courses can't be edited.
- The import accepts pasted text only (no PDF upload), up to 15,000 characters.
- No calendar view. The empty Calendar and Settings pages were removed rather than shipped unfinished.
- Free-tier AI models can be slow or rate-limited at busy times.

## Deployment, rollback and monitoring

- Hosted on Vercel; every push to `main` deploys automatically and branches get preview URLs.
- Set `GROQ_API_KEY` and `GROQ_MODEL` in Vercel (Settings, Environment Variables), then redeploy.
- **Rollback:** Vercel dashboard, Deployments, open the last good deployment, then "Promote to Production" (or "Instant Rollback"). Alternatively `git revert` the bad commit and push.
- **Monitoring:** `/health` confirms the app is serving; Vercel logs show errors from `/api/extract`.
- The checklist is in `docs/deployment-checklist.md`.