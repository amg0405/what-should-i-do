import type { Activity, Pool, Filters, SampleOptions, TimeBucket, Category, BudgetTier } from './types';

const BUDGET_CAP_SGD: Record<Exclude<BudgetTier, 'free'>, number> = {
  under5: 5,
  under10: 10,
  under50: 50,
};

function matchesBudget(a: Activity, tier: BudgetTier | 'any'): boolean {
  if (tier === 'any') return true;
  if (tier === 'free') {
    return (a.tags.cost_sgd ?? 0) === 0 || a.tags.cost === 'free';
  }
  const cap = BUDGET_CAP_SGD[tier];
  if (typeof a.tags.cost_sgd === 'number') return a.tags.cost_sgd <= cap;
  // legacy fallback when cost_sgd missing
  if (tier === 'under5') return a.tags.cost === 'free';
  if (tier === 'under10') return a.tags.cost === 'free' || a.tags.cost === 'low';
  return true; // under50 includes any non-medium
}

const TIME_BUCKETS: Record<TimeBucket, (m: number) => boolean> = {
  '15min': (m) => m <= 20,
  '1hr': (m) => m > 20 && m <= 75,
  '3hr': (m) => m > 75 && m <= 200,
  fullday: (m) => m > 200,
};

// Anti-doomscroll: physical + social + (real-world) creative
const ANTI_DOOMSCROLL_CATS: Category[] = ['physical', 'social', 'creative', 'nostalgic'];

// Substrings that imply phone/screen use — exclude these when anti-doomscroll is on
const PHONE_WORDS = [
  'phone',
  'video',
  'tiktok',
  'instagram',
  'reel',
  'scroll',
  'app ',
  ' app',
  'screen',
  'youtube',
  'edit a',
  'edit one',
  'meme',
  'voice note',
  'text ',
  'whatsapp',
  'snap ',
  'snapchat',
  'twitter',
  'post a',
  'post one',
  'story ',
  'discord',
  'rewatch',
  'emulator',
  'online',
  'spotify',
  'netflix',
  'browse',
  'stream',
  'watch one',
  'watch a',
  'watch the',
  'binge',
  'movie',
  'series',
  'episode',
  'podcast',
  ' tv ',
  'webseries',
  'website',
  ' web ',
  ' web,',
  ' web.',
  ' wifi',
  'free online',
  'google',
  'kahoot',
  'leetcode',
  'duolingo',
];

function isPhoneActivity(a: Activity): boolean {
  const haystack = `${a.title} ${a.description}`.toLowerCase();
  return PHONE_WORDS.some((w) => haystack.includes(w));
}

export function sample(pool: Pool, filters: Filters, opts: SampleOptions = {}): Activity[] {
  const { count = 6, antiDoomscroll = false, currentTimeOfDay, excludeIds = [] } = opts;
  const effectiveMood = antiDoomscroll ? 'restless' : filters.mood;
  const exclude = new Set(excludeIds);

  let candidates = pool.activities.filter(
    (a) =>
      !exclude.has(a.id) &&
      a.tags.energy.includes(filters.energy) &&
      a.tags.mood.includes(effectiveMood) &&
      TIME_BUCKETS[filters.time](a.duration_min),
  );

  if (antiDoomscroll) {
    candidates = candidates.filter(
      (a) => ANTI_DOOMSCROLL_CATS.includes(a.tags.category) && !isPhoneActivity(a),
    );
  }

  if (filters.budget && filters.budget !== 'any') {
    candidates = candidates.filter((a) => matchesBudget(a, filters.budget!));
  }

  if (filters.rainy) {
    candidates = candidates.filter((a) => a.tags.indoor);
  }

  if (candidates.length === 0) return [];

  const weighted: { activity: Activity; weight: number }[] = candidates.map((a) => {
    let w = 1;
    if (currentTimeOfDay && a.tags.timeOfDay.includes(currentTimeOfDay)) w *= 2;
    if (antiDoomscroll && !a.tags.indoor) w *= 1.8;
    return { activity: a, weight: w };
  });

  return diversifiedSample(weighted, count, 2);
}

// Variant: filter to a single category (used by "Show me more like this")
export function sampleByCategory(
  pool: Pool,
  category: Category,
  count: number,
  excludeIds: string[] = [],
): Activity[] {
  const exclude = new Set(excludeIds);
  const candidates = pool.activities.filter(
    (a) => a.tags.category === category && !exclude.has(a.id),
  );
  if (candidates.length === 0) return [];
  const weighted = candidates.map((a) => ({ activity: a, weight: 1 }));
  return weightedSampleWithoutReplacement(weighted, count);
}

function weightedSampleWithoutReplacement<T>(
  items: { activity: T; weight: number }[],
  count: number,
): T[] {
  const pool = [...items];
  const out: T[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const total = pool.reduce((s, it) => s + it.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < pool.length; idx++) {
      r -= pool[idx].weight;
      if (r <= 0) break;
    }
    if (idx >= pool.length) idx = pool.length - 1;
    out.push(pool[idx].activity);
    pool.splice(idx, 1);
  }
  return out;
}

function diversifiedSample(
  items: { activity: Activity; weight: number }[],
  count: number,
  maxPerCategory: number,
): Activity[] {
  const remaining = [...items];
  const out: Activity[] = [];
  const catCount: Partial<Record<Category, number>> = {};

  while (out.length < count && remaining.length > 0) {
    const allowed = remaining.filter(
      (it) => (catCount[it.activity.tags.category] ?? 0) < maxPerCategory,
    );
    const usePool = allowed.length > 0 ? allowed : remaining;

    const total = usePool.reduce((s, it) => s + it.weight, 0);
    let r = Math.random() * total;
    let idx = 0;
    for (; idx < usePool.length; idx++) {
      r -= usePool[idx].weight;
      if (r <= 0) break;
    }
    if (idx >= usePool.length) idx = usePool.length - 1;
    const chosen = usePool[idx];
    out.push(chosen.activity);
    catCount[chosen.activity.tags.category] = (catCount[chosen.activity.tags.category] ?? 0) + 1;

    const mainIdx = remaining.indexOf(chosen);
    if (mainIdx >= 0) remaining.splice(mainIdx, 1);
  }
  return out;
}
