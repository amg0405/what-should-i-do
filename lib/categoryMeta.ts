import type { Category } from './types';

export const CATEGORY_META: Record<Category, { emoji: string; label: string; tintVar: string }> = {
  creative: { emoji: '🎨', label: 'Creative', tintVar: 'var(--card-tint-creative)' },
  physical: { emoji: '🏃', label: 'Physical', tintVar: 'var(--card-tint-physical)' },
  social: { emoji: '🫶', label: 'Social', tintVar: 'var(--card-tint-social)' },
  restful: { emoji: '🧘', label: 'Calm', tintVar: 'var(--card-tint-restful)' },
  nostalgic: { emoji: '🍜', label: 'Nostalgic', tintVar: 'var(--card-tint-nostalgic)' },
  learning: { emoji: '📚', label: 'Learn', tintVar: 'var(--card-tint-learning)' },
  productive: { emoji: '✨', label: 'Productive', tintVar: 'var(--card-tint-productive)' },
};
