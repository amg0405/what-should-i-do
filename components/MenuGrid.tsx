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
      <div className="text-center py-12 text-gray-500">
        No suggestions match these filters. Try widening them.
      </div>
    );
  }
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {activities.map((a) => (
        <ActivityCard
          key={a.id}
          activity={a}
          isFavorite={favorites.includes(a.id)}
          onToggleFavorite={() => onToggleFavorite(a.id)}
          onDidIt={() => onDidIt(a.id)}
        />
      ))}
    </div>
  );
}
