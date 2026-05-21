import type { Activity, Pool, Filters, SampleOptions, TimeBucket, Category } from './types';

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

  if (candidates.length === 0) return [];

  const weighted: { activity: Activity; weight: number }[] = candidates.map((a) => {
    let w = 1;
    if (currentTimeOfDay && a.tags.timeOfDay.includes(currentTimeOfDay)) w *= 2;
    if (antiDoomscroll && !a.tags.indoor) w *= 1.8;
    return { activity: a, weight: w };
  });

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
