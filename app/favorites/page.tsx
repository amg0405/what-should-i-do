'use client';
import { useEffect, useState } from 'react';
import { getPool } from '@/lib/pool';
import { useFavorites } from '@/lib/storage';
import ActivityCard from '@/components/ActivityCard';
import type { Activity } from '@/lib/types';

export default function FavoritesPage() {
  const { favorites, toggle } = useFavorites();
  const [items, setItems] = useState<Activity[]>([]);

  useEffect(() => {
    const teen = getPool('teen').activities;
    const adult = getPool('adult').activities;
    const all = [...teen, ...adult];
    const byId = new Map(all.map((a) => [a.id, a]));
    setItems(favorites.map((id) => byId.get(id)).filter((a): a is Activity => !!a));
  }, [favorites]);

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Favorites</h1>
          <a href="/" className="text-sm text-gray-600 hover:text-gray-900 underline">
            ← Back
          </a>
        </header>
        {items.length === 0 ? (
          <p className="text-gray-500">No favorites yet. Tap ♡ on any suggestion to save it.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((a) => (
              <ActivityCard
                key={a.id}
                activity={a}
                isFavorite={true}
                onToggleFavorite={() => toggle(a.id)}
                onDidIt={() => {}}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
