import type { Category } from './types';

export const CATEGORY_META: Record<
  Category,
  { emoji: string; label: string; tintVar: string; heroGradient: string }
> = {
  creative: {
    emoji: '🎨',
    label: 'Creative',
    tintVar: 'var(--card-tint-creative)',
    heroGradient: 'linear-gradient(135deg, #FFB5D8 0%, #FF7AB6 100%)',
  },
  physical: {
    emoji: '🏃',
    label: 'Physical',
    tintVar: 'var(--card-tint-physical)',
    heroGradient: 'linear-gradient(135deg, #6EE7B7 0%, #06A77D 100%)',
  },
  social: {
    emoji: '🫶',
    label: 'Social',
    tintVar: 'var(--card-tint-social)',
    heroGradient: 'linear-gradient(135deg, #FFD4A3 0%, #FF8E53 100%)',
  },
  restful: {
    emoji: '🧘',
    label: 'Calm',
    tintVar: 'var(--card-tint-restful)',
    heroGradient: 'linear-gradient(135deg, #C7D2FE 0%, #818CF8 100%)',
  },
  nostalgic: {
    emoji: '🍜',
    label: 'Nostalgic',
    tintVar: 'var(--card-tint-nostalgic)',
    heroGradient: 'linear-gradient(135deg, #FED7AA 0%, #FB923C 100%)',
  },
  learning: {
    emoji: '📚',
    label: 'Learn',
    tintVar: 'var(--card-tint-learning)',
    heroGradient: 'linear-gradient(135deg, #DDD6FE 0%, #A78BFA 100%)',
  },
  productive: {
    emoji: '✨',
    label: 'Productive',
    tintVar: 'var(--card-tint-productive)',
    heroGradient: 'linear-gradient(135deg, #FEF3C7 0%, #FACC15 100%)',
  },
};
