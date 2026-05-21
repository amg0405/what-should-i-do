import Anthropic from '@anthropic-ai/sdk';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { createHash } from 'crypto';
import { ActivitySchema, AudienceSchema, type Audience, type Activity, type Pool } from '../lib/types';
import { AUDIENCE_DESCRIPTIONS, SEED_THEMES } from './seedThemes';

const PER_THEME = 50;
const MIN_TOTAL = 250;
const MODEL = 'claude-haiku-4-5';

const client = new Anthropic();

function idFor(title: string): string {
  return createHash('sha1').update(title.toLowerCase().trim()).digest('hex').slice(0, 10);
}

async function generateBatch(audience: Audience, theme: string, target: number): Promise<Activity[]> {
  const prompt = `You are generating activities for a "what should I do when bored" website.

Audience: ${AUDIENCE_DESCRIPTIONS[audience]}

Theme for this batch: ${theme}

Generate exactly ${target} unique activities. Vary duration (5 to 1440 minutes), energy (some low, some high), mood-fit, indoor/outdoor, cost (mostly free, very few medium).

Return STRICT JSON: an array of objects with this schema (no extra fields, no markdown, no commentary):
{
  "title": string (3-120 chars, concrete and actionable — "Watch one episode of Beyblade Metal Fusion" not "Watch TV"),
  "description": string (5-240 chars, one warm sentence),
  "duration_min": integer 5-1440,
  "tags": {
    "energy": array of one or more from ["low","medium","high"],
    "mood": array of one or more from ["calm","curious","restless","social"],
    "timeOfDay": array of one or more from ["morning","afternoon","evening","late_night"],
    "category": one of ["restful","productive","creative","social","physical","learning","nostalgic"],
    "indoor": boolean,
    "cost": one of ["free","low","medium"]
  }
}

Avoid clichés like "learn to code" unless made specific ("do one LeetCode easy on arrays").
Each title must be concrete enough to act on without further thought.

Return ONLY the JSON array. No code fence, no preamble.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    messages: [{ role: 'user', content: prompt }],
  });
  const text = resp.content
    .filter((b): b is Anthropic.TextBlock => b.type === 'text')
    .map((b) => b.text)
    .join('');

  const raw = text.trim().replace(/^```json\s*/, '').replace(/```\s*$/, '');
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (e) {
    console.error('JSON parse failed for theme:', theme);
    console.error('Raw output (first 500 chars):', text.slice(0, 500));
    throw e;
  }
  if (!Array.isArray(parsed)) throw new Error('Expected array');

  const out: Activity[] = [];
  for (const item of parsed) {
    if (typeof item !== 'object' || item === null) continue;
    const withId = { ...(item as object), id: idFor((item as { title?: string }).title ?? '') };
    const result = ActivitySchema.safeParse(withId);
    if (result.success) {
      out.push(result.data);
    } else {
      const issue = result.error.issues[0];
      const path = issue?.path.join('.');
      const offending = path ? path.split('.').reduce<unknown>((acc, k) => (acc as Record<string, unknown> | undefined)?.[k], withId) : undefined;
      console.warn(`Skipping invalid activity: ${issue?.message} at ${path} (value: ${JSON.stringify(offending)})`);
    }
  }
  console.log(`  Theme "${theme.slice(0, 50)}..." -> ${out.length}/${target} valid`);
  return out;
}

async function generatePool(audience: Audience): Promise<Pool> {
  console.log(`\nGenerating ${audience} pool...`);
  const themes = SEED_THEMES[audience];
  const all: Activity[] = [];
  const perTheme = Number(process.env.BATCH_SIZE ?? PER_THEME);

  for (const theme of themes) {
    const batch = await generateBatch(audience, theme, perTheme);
    all.push(...batch);
  }

  const seen = new Set<string>();
  const deduped = all.filter((a) => {
    if (seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });

  console.log(`Total ${audience}: ${deduped.length} unique activities`);
  if (deduped.length < MIN_TOTAL && !process.env.BATCH_SIZE) {
    throw new Error(`Only ${deduped.length} valid activities; need ${MIN_TOTAL}`);
  }

  return {
    generated_at: new Date().toISOString(),
    audience,
    activities: deduped,
  };
}

async function main() {
  const audArg = process.argv[2];
  const parsed = AudienceSchema.safeParse(audArg);
  if (!parsed.success) {
    console.error('Usage: tsx scripts/generate-pool.ts <teen|adult>');
    process.exit(1);
  }
  const audience = parsed.data;
  const pool = await generatePool(audience);
  const dir = join(process.cwd(), 'data');
  mkdirSync(dir, { recursive: true });
  const path = join(dir, `pool.${audience}.json`);
  writeFileSync(path, JSON.stringify(pool, null, 2));
  console.log(`Wrote ${path}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
