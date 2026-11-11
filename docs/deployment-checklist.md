# Deployment checklist (fill in before submitting)

- [ ] `npm run build` passes locally (or on a Vercel preview)
- [ ] `npm test` passes
- [ ] `GEMINI_API_KEY` set in Vercel → Settings → Environment Variables (Production + Preview); not in repo, not `NEXT_PUBLIC_`
- [ ] `.env.local` is git-ignored (`git status` shows no secrets)
- [ ] Preview deploy tested at 375px and 1280px
- [ ] AI import tested: success, bad input, and with key removed (error + manual link shown)
- [ ] Lighthouse mobile ≥ 90 (record: ____ )
- [ ] axe/WAVE: no AA violations (record: ____ )
- [ ] Rollback plan known: Vercel → Deployments → promote previous build
- [ ] Signed off by: __________  Date: __________
