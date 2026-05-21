'use client';
import { useState } from 'react';
import type { Activity } from '@/lib/types';
import { CATEGORY_META } from '@/lib/categoryMeta';

type Props = {
  activity: Activity;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDidIt: () => void;
  onMoreLikeThis?: () => void;
};

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
      className={`relative border border-muted rounded-3xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-all duration-300 animate-slide-up ${
        done ? 'opacity-50' : 'opacity-100'
      }`}
      style={{ background: meta.tintVar }}
    >
      <div className="flex items-start justify-between gap-2">
        {onMoreLikeThis ? (
          <button
            onClick={onMoreLikeThis}
            title={`Show me more ${meta.label} ideas`}
            className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft bg-white/60 hover:bg-white px-2.5 py-1 rounded-full transition border border-transparent hover:border-ink-soft/30"
          >
            <span aria-hidden>{meta.emoji}</span> {meta.label}{' '}
            <span className="text-ink-soft/70 ml-0.5">→</span>
          </button>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-soft bg-white/60 px-2.5 py-1 rounded-full">
            <span aria-hidden>{meta.emoji}</span> {meta.label}
          </span>
        )}
        <button
          aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          onClick={onToggleFavorite}
          className="text-xl shrink-0 text-primary hover:scale-110 transition"
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>

      <h3
        className={`display font-semibold text-ink text-lg leading-snug ${
          done ? 'line-through' : ''
        }`}
      >
        {activity.title}
      </h3>
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

      {celebrating && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-5xl animate-pop-in">
          🎉
        </div>
      )}
    </div>
  );
}
