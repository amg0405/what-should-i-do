# What Should I Do?

A zero-cost website that suggests activities when you're bored. Suggestions are AI-generated weekly and served as static JSON — the live site never calls an LLM.

## Stack

Next.js 14 · Tailwind · TypeScript · Claude Haiku 4.5 (build-time only) · Vercel · GitHub Actions

## Local dev

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests
```

## Regenerate the activity pool

```bash
export ANTHROPIC_API_KEY=sk-...
npm run generate:pool teen
npm run generate:pool adult
```

Pools live in `data/pool.{teen,adult}.json` and are committed to the repo. The live site bundles them — no runtime LLM calls.

## Deploy

Push `main` to GitHub, import into Vercel. No env vars required at runtime.

## Weekly refresh

GitHub Action `.github/workflows/refresh-pool.yml` runs every Monday and commits a fresh pool. Requires `ANTHROPIC_API_KEY` set as a repo secret.

## Architecture

- `app/` — Next.js App Router pages
- `components/` — UI components
- `lib/` — pure logic (sampler, share encoding, time-of-day) and localStorage hooks
- `data/` — pre-generated activity pools (committed JSON)
- `scripts/` — pool generation (runs in CI, never at request time)
