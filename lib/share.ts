import { AudienceSchema, TimeBucketSchema, EnergySchema, MoodSchema } from './types';
import type { Filters } from './types';

export function encodeFilters(f: Filters): URLSearchParams {
  return new URLSearchParams({ a: f.audience, t: f.time, e: f.energy, m: f.mood });
}

export function decodeFilters(params: URLSearchParams): Filters | null {
  const a = AudienceSchema.safeParse(params.get('a'));
  const t = TimeBucketSchema.safeParse(params.get('t'));
  const e = EnergySchema.safeParse(params.get('e'));
  const m = MoodSchema.safeParse(params.get('m'));
  if (!a.success || !t.success || !e.success || !m.success) return null;
  return { audience: a.data, time: t.data, energy: e.data, mood: m.data };
}
