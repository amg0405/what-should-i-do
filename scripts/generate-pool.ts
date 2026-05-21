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
  const prompt = `You are writing activity cards for a website that helps people figure out what to do when bored.

Audience: ${AUDIENCE_DESCRIPTIONS[audience]}

Theme for this batch: ${theme}

VOICE (this is the most important part):
Write like a slightly chaotic, warm friend texting you on a Saturday — NOT like a productivity coach, a guidance counsellor, or a LinkedIn influencer.

GOOD examples of the voice:
- "Make Frooti-flavoured ice pops in your freezer"
- "Recreate Maggi with egg the way you ate it after school"
- "Design a fake Pokemon gym leader card for yourself"
- "Quiz yourself like it's exam season — but no consequences"
- "Breathe like a Navy SEAL for 10 minutes. Sounds dumb. Works scary well."
- "Steal 15 minutes of free wisdom from a stranger on stage"

BAD examples (NEVER write like this):
- "Message your parents' friends who hosted you once and thank them" (preachy, guilt-trippy)
- "Watch a TED talk on the future of your industry" (LinkedIn-coach generic)
- "Send a detailed voice note to a friend explaining why you've been distant" (therapy homework)
- "Write a thank-you email to a professor" (school-suckup energy)
- "Reflect on your goals for the next quarter" (boring corporate-speak)
- "A calming breathing pattern designed to slow heart rate and ease anxiety" (Wikipedia stub)

Title rules:
- Strong verb + specific image. Concrete enough to act on with zero further thought.
- 3-100 chars. No parenthetical instructions in the title (save those for description).
- Names of specific things are better than generic categories: "Pokemon", "Beyblade", "Maggi", "Frooti", "cricket gully" beat "video game", "noodles", "drink", "sport".
- Avoid: any title that sounds like a self-help listicle, a school assignment, or LinkedIn advice.

Description rules:
- 5-200 chars. One punchy line with personality. Optional wink, gentle dare, or vivid image.
- DO NOT explain what an obvious thing is. ("Take a walk" doesn't need "Walking is a form of locomotion.")
- DO NOT moralize. ("This will make you a better person.")
- One emoji max, only if it adds something. Often zero is better.

Generate exactly ${target} unique activities. Vary duration (5 to 1440 minutes), energy (some low, some high), mood-fit, indoor/outdoor, cost (mostly free, very few medium).

Return STRICT JSON: an array of objects with this schema (no extra fields, no markdown, no commentary):
{
  "title": string (3-120 chars, concrete and actionable, in the voice above),
  "description": string (5-240 chars, one punchy line),
  "duration_min": integer 5-1440,
  "tags": {
    "energy": array of one or more from ["low","medium","high"],
    "mood": array of one or more from ["calm","curious","restless","social"],
    "timeOfDay": array of one or more from ["morning","afternoon","evening","late_night"],
    "category": SINGLE STRING (not array) — one of ["restful","productive","creative","social","physical","learning","nostalgic"],
    "indoor": boolean,
    "cost": one of ["free","low","medium"]
  }
}

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
