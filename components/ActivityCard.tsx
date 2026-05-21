'use client';
import type { Activity } from '@/lib/types';

type Props = {
  activity: Activity;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDidIt: () => void;
};

export default function ActivityCard({ activity, isFavorite, onToggleFavorite, onDidIt }: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold text-gray-900 leading-tight">{activity.title}</h3>
        <button
          aria-label={isFavorite ? 'Unfavorite' : 'Favorite'}
          onClick={onToggleFavorite}
          className="text-xl shrink-0 text-rose-500 hover:scale-110 transition"
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <p className="text-sm text-gray-600">{activity.description}</p>
      <div className="flex items-center justify-between mt-auto pt-2">
        <span className="text-xs text-gray-500">~{activity.duration_min} min</span>
        <button
          onClick={onDidIt}
          className="text-xs text-emerald-700 hover:text-emerald-900 underline"
        >
          Did it ✓
        </button>
      </div>
    </div>
  );
}
