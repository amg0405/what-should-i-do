'use client';
import ActivityCard from './ActivityCard';
import type { Activity } from '@/lib/types';

type Props = {
  activities: Activity[];
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onDidIt: (id: string) => void;
};

export default function MenuGrid({ activities, favorites, onToggleFavorite, onDidIt }: Props) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-16 px-4">
        <div className="text-5xl mb-3">🤷</div>
        <p className="text-ink-soft">Nothing matches these filters. Loosen one up.</p>
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((a, i) => (
        <div key={a.id} style={{ animationDelay: `${i * 60}ms` }} className="animate-slide-up">
          <ActivityCard
            activity={a}
            isFavorite={favorites.includes(a.id)}
            onToggleFavorite={() => onToggleFavorite(a.id)}
            onDidIt={() => onDidIt(a.id)}
          />
        </div>
      ))}
    </div>
  );
}
