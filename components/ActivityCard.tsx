'use client';
import { useState } from 'react';
import type { Activity } from '@/lib/types';
import { CATEGORY_META } from '@/lib/categoryMeta';
import ShareMenu from './ShareMenu';

type Props = {
  activity: Activity;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDidIt: () => void;
  onMoreLikeThis?: () => void;
};

function priceLabel(a: Activity): string {
  if (typeof a.tags.cost_sgd === 'number') {
    if (a.tags.cost_sgd === 0) return 'Free';
    return `~S$${a.tags.cost_sgd}${a.tags.includes_transport ? ' incl. fare' : ''}`;
  }
  if (a.tags.cost === 'free') return 'Free';
  if (a.tags.cost === 'low') return '~S$5';
  return 'S$$$';
}

export default function ActivityCard({
  activity,
  isFavorite,
  onToggleFavorite,
  onDidIt,
  onMoreLikeThis,
}: Props) {
  const [done, setDone] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const meta = CATEGORY_META[activity.tags.category];

  const handleDidIt = () => {
    if (done) return;
    setCelebrating(true);
    onDidIt();
    setTimeout(() => {
      setDone(true);
      setCelebrating(false);
    }, 600);
  };

  return (
    <div
      className={`group relative bg-card border border-muted rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up ${
        done ? 'opacity-50' : 'opacity-100'
      }`}
    >
      <div
        className="h-24 sm:h-28 relative flex items-end justify-between px-4 pb-3"
        style={{ background: meta.heroGradient }}
      >
        <div className="absolute inset-0 opacity-30" aria-hidden>
          <div className="absolute -right-4 -top-4 text-8xl">{meta.emoji}</div>
        </div>
        <div className="relative z-10 flex items-end justify-between w-full">
          {onMoreLikeThis ? (
            <button
              onClick={onMoreLikeThis}
              title={`More ${meta.label} ideas`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-black/30 backdrop-blur-sm hover:bg-black/45 px-2.5 py-1 rounded-full transition"
            >
              {meta.emoji} {meta.label} <span className="opacity-70 ml-0.5">→</span>
            </button>
          ) : (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
              {meta.emoji} {meta.label}
            </span>
          )}
          <span className="text-xs font-semibold text-white bg-black/30 backdrop-blur-sm px-2.5 py-1 rounded-full">
            {priceLabel(activity)}
          </span>
        </div>
      </div>

      <div className="p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <h3
            className={`display font-semibold text-ink text-lg leading-snug flex-1 ${
              done ? 'line-through' : ''
            }`}
          >
            {activity.title}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            <ShareMenu activity={activity} variant="icon" />
            <button
              aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
              onClick={onToggleFavorite}
              className="text-xl text-primary hover:scale-110 transition"
            >
              {isFavorite ? '♥' : '♡'}
            </button>
          </div>
        </div>

        <p className="text-sm text-ink-soft leading-relaxed">{activity.description}</p>

        <div className="flex items-center justify-between mt-auto pt-2">
          <span className="text-xs text-ink-soft font-medium">~{activity.duration_min} min</span>
          {done ? (
            <span className="text-xs text-success font-semibold">Done ✓</span>
          ) : (
            <button
              onClick={handleDidIt}
              className="text-xs text-success font-semibold hover:underline"
            >
              {celebrating ? 'Nice! 🎉' : 'Did it ✓'}
            </button>
          )}
        </div>
      </div>

      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-6xl animate-pop-in">
          🎉
        </div>
      )}
    </div>
  );
}
