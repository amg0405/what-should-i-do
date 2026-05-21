import type { Activity } from './types';

export function makeActivity(overrides: Partial<Activity> & { id?: string; tags?: Partial<Activity['tags']> }): Activity {
  return {
    id: overrides.id ?? Math.random().toString(36).slice(2),
    title: overrides.title ?? 'Test activity',
    description: overrides.description ?? 'desc',
    duration_min: overrides.duration_min ?? 30,
    tags: {
      energy: overrides.tags?.energy ?? ['medium'],
      mood: overrides.tags?.mood ?? ['curious'],
      timeOfDay: overrides.tags?.timeOfDay ?? ['afternoon'],
      category: overrides.tags?.category ?? 'productive',
      indoor: overrides.tags?.indoor ?? true,
      cost: overrides.tags?.cost ?? 'free',
    },
  };
}
