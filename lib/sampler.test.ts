import { describe, it, expect } from 'vitest';
import { sample } from './sampler';
import { makeActivity } from './testFixtures';
import type { Pool, Filters } from './types';

const filters: Filters = { audience: 'teen', time: '1hr', energy: 'medium', mood: 'curious' };

function poolOf(...activities: ReturnType<typeof makeActivity>[]): Pool {
  return { generated_at: '2026-05-21', audience: 'teen', activities };
}

describe('sample', () => {
  it('only returns activities matching energy and mood', () => {
    const matching = makeActivity({
      id: 'm',
      duration_min: 30,
      tags: { energy: ['medium'], mood: ['curious'], timeOfDay: ['afternoon'], category: 'productive', indoor: true, cost: 'free' },
    });
    const mismatch = makeActivity({
      id: 'x',
      duration_min: 30,
      tags: { energy: ['high'], mood: ['social'], timeOfDay: ['afternoon'], category: 'productive', indoor: true, cost: 'free' },
    });
    const out = sample(poolOf(matching, mismatch), filters, { count: 1 });
    expect(out.map(a => a.id)).toEqual(['m']);
  });

  it('filters by time bucket (1hr = 20-75 min)', () => {
    const tooShort = makeActivity({ id: 's', duration_min: 10 });
    const justRight = makeActivity({ id: 'r', duration_min: 45 });
    const tooLong = makeActivity({ id: 'l', duration_min: 120 });
    const out = sample(poolOf(tooShort, justRight, tooLong), filters, { count: 5 });
    expect(out.map(a => a.id)).toEqual(['r']);
  });

  it('returns at most count items', () => {
    const items = Array.from({ length: 20 }, (_, i) => makeActivity({ id: `a${i}`, duration_min: 30 }));
    expect(sample(poolOf(...items), filters, { count: 6 }).length).toBe(6);
  });

  it('does not repeat items in a single sample', () => {
    const items = Array.from({ length: 10 }, (_, i) => makeActivity({ id: `a${i}`, duration_min: 30 }));
    const out = sample(poolOf(...items), filters, { count: 6 });
    const ids = out.map(a => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('excludes items by id (history dedup)', () => {
    const items = Array.from({ length: 5 }, (_, i) => makeActivity({ id: `a${i}`, duration_min: 30 }));
    const out = sample(poolOf(...items), filters, { count: 4, excludeIds: ['a0', 'a1'] });
    expect(out.map(a => a.id)).not.toContain('a0');
    expect(out.map(a => a.id)).not.toContain('a1');
    expect(out.length).toBe(3);
  });

  it('anti-doomscroll overrides mood to restless and biases physical/social/creative', () => {
    const physical = makeActivity({
      id: 'p',
      duration_min: 30,
      tags: { energy: ['medium'], mood: ['restless'], timeOfDay: ['afternoon'], category: 'physical', indoor: false, cost: 'free' },
    });
    const restful = makeActivity({
      id: 'r',
      duration_min: 30,
      tags: { energy: ['medium'], mood: ['restless'], timeOfDay: ['afternoon'], category: 'restful', indoor: true, cost: 'free' },
    });
    const out = sample(poolOf(physical, restful), filters, { count: 1, antiDoomscroll: true });
    expect(out[0].id).toBe('p');
  });

  it('returns fewer than count when pool is too small', () => {
    const items = [makeActivity({ id: 'only', duration_min: 30 })];
    expect(sample(poolOf(...items), filters, { count: 6 }).length).toBe(1);
  });
});
