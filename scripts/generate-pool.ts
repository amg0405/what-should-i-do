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
  const prompt = `You are writing activity cards for a Singapore-based website that helps people figure out what to do when bored. The product is professional, fun, globally readable, but specifically usable in Singapore.

Audience: ${AUDIENCE_DESCRIPTIONS[audience]}

Theme for this batch: ${theme}

VOICE:
Slightly chaotic, warm friend texting you on a Saturday. Professional polish — globally readable for an international audience but specifically usable for someone living in Singapore. NOT a productivity coach, NOT a guidance counsellor, NOT a LinkedIn influencer. Avoid slang-heavy "bro" energy.

GOOD voice:
- "Bumboat to Pulau Ubin and rent a creaky bike for an hour"
- "Order the most random hawker dish at Maxwell, no menu peeking"
- "Kopi-o + kaya toast at the nearest coffeeshop. No phone."
- "Walk one Park Connector segment you've never tried"
- "Sunset at Marina Barrage rooftop. Bring a friend if you have one."
- "Design a fake Pokemon gym leader card for yourself"
- "Breathe 4-7-8 for 10 min. Sounds dumb. Works scary well."

BAD voice (NEVER):
- "Reflect on your quarterly goals" (corporate)
- "Write a thank-you email to a professor" (school-suckup)
- "Watch a TED talk on the future of your industry" (LinkedIn-coach)
- "Message your parents' friends and thank them" (guilt-trippy)
- "A calming breathing pattern designed to slow heart rate" (Wikipedia stub)

LOCATION + COST:
Most activities should be Singapore-specific or work seamlessly in Singapore. Reference real places where it fits: hawker centres (Maxwell, Old Airport Rd, Tiong Bahru, Ghim Moh, Adam Road, Tampines Round Market), parks (East Coast Park, Bishan-AMK, MacRitchie, Botanic Gardens, Marina Barrage, Pulau Ubin), neighbourhoods (Tiong Bahru, Joo Chiat, Holland V, Tanjong Pagar, Bras Basah, Kampong Glam), cultural (NGS, NMS, ArtScience, The Projector, Esplanade outdoor stage, NLB branches), transport (MRT lines, Park Connectors, SG Bike, EZ-Link, bumboat to Ubin), food (kopi, kaya toast, chendol, ice kachang, mee goreng, chicken rice, kway teow).

COST in S$ INCLUDING return MRT/bus fare (~S$2-4 per round trip). Be honest about cost_sgd.

Title rules:
- Strong verb + specific image. Concrete enough to act on with zero further thought.
- 3-100 chars. No parenthetical instructions in the title.
- Specific names beat generic ones: "Maxwell hawker", "Park Connector", "Bras Basah library", "Marina Barrage rooftop" beat "hawker", "park", "library", "rooftop".
- Mix Singapore-flavored entries with culturally global ones (e.g., journal, sketch, read, breathe, call a friend) so the pool stays varied. Aim ~60% SG-specific, ~40% globally applicable.

Description rules:
- 5-200 chars. One punchy line with personality, optional gentle dare.
- Don't moralize. Don't explain the obvious. One emoji max if it earns its place.

Generate exactly ${target} unique activities. Vary duration (5 to 1440 minutes), energy, mood, indoor/outdoor, and cost across the full range from free to S$50.

Return STRICT JSON: an array of objects with this exact schema (no extra fields, no markdown, no commentary):
{
  "title": string (3-120 chars, in the voice above),
  "description": string (5-240 chars, one punchy line),
  "duration_min": integer 5-1440,
  "tags": {
    "energy": array of one or more from ["low","medium","high"],
    "mood": array of one or more from ["calm","curious","restless","social"],
    "timeOfDay": array of one or more from ["morning","afternoon","evening","late_night"],
    "category": SINGLE STRING (not array) from ["restful","productive","creative","social","physical","learning","nostalgic"],
    "indoor": boolean,
    "cost": one of ["free","low","medium"],
    "cost_sgd": integer (0 = free; for anything paid, include all-in cost incl. return MRT/bus fare ~S$2-4),
    "budget_tier": one of ["free","under5","under10","under50"] (derive from cost_sgd: 0->"free", <=5->"under5", <=10->"under10", <=50->"under50"),
    "location": one of ["home","neighbourhood","island-wide","online"],
    "includes_transport": boolean (true if cost_sgd already covers MRT/bus fare),
    "sg_local": boolean (true if the activity references a Singapore-specific place / phrase / cultural moment)
  }
}

Return ONLY the JSON array. No code fence, no preamble.`;

  const resp = await client.messages.create({
    model: MODEL,
    max_tokens: 16000,
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
