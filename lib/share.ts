import { AudienceSchema, TimeBucketSchema, EnergySchema, MoodSchema, BudgetTierSchema } from './types';
import type { Filters, BudgetTier } from './types';

export function encodeFilters(f: Filters): URLSearchParams {
  const p = new URLSearchParams({ a: f.audience, t: f.time, e: f.energy, m: f.mood });
  if (f.budget && f.budget !== 'any') p.set('b', f.budget);
  if (f.rainy) p.set('r', '1');
  return p;
}

export function decodeFilters(params: URLSearchParams): Filters | null {
  const a = AudienceSchema.safeParse(params.get('a'));
  const t = TimeBucketSchema.safeParse(params.get('t'));
  const e = EnergySchema.safeParse(params.get('e'));
  const m = MoodSchema.safeParse(params.get('m'));
  if (!a.success || !t.success || !e.success || !m.success) return null;
  const result: Filters = { audience: a.data, time: t.data, energy: e.data, mood: m.data };
  const b = params.get('b');
  if (b) {
    const parsed = BudgetTierSchema.safeParse(b);
    if (parsed.success) result.budget = parsed.data as BudgetTier;
  }
  if (params.get('r') === '1') result.rainy = true;
  return result;
}
