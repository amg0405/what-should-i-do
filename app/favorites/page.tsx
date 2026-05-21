'use client';
import { useEffect, useState } from 'react';
import { getPool } from '@/lib/pool';
import { useFavorites } from '@/lib/storage';
import ActivityCard from '@/components/ActivityCard';
import { ToastProvider, useToast } from '@/components/Toast';
import type { Activity } from '@/lib/types';

function FavoritesInner() {
  const { favorites, toggle } = useFavorites();
  const [items, setItems] = useState<Activity[]>([]);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    const teen = getPool('teen').activities;
    const adult = getPool('adult').activities;
    const all = [...teen, ...adult];
    const byId = new Map(all.map((a) => [a.id, a]));
    setItems(favorites.map((id) => byId.get(id)).filter((a): a is Activity => !!a));
  }, [favorites]);

  const pickOne = () => {
    if (items.length === 0) return;
    const pick = items[Math.floor(Math.random() * items.length)];
    setHighlighted(pick.id);
    toast(`Do this one: ${pick.title.slice(0, 40)}${pick.title.length > 40 ? '…' : ''}`);
    setTimeout(() => setHighlighted(null), 4000);
    if (typeof window !== 'undefined') {
      const el = document.getElementById(`fav-${pick.id}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <header className="flex items-center justify-between mb-6 gap-3 flex-wrap">
          <a href="/" className="display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
            ← Back
          </a>
          <h1 className="display text-xl sm:text-2xl font-semibold text-ink">
            ♥ Saved · {items.length}
          </h1>
        </header>

        {items.length === 0 ? (
          <div className="text-center py-20 px-4">
            <div className="text-6xl mb-4">📂</div>
            <p className="display text-xl font-semibold text-ink mb-2">Nothing here yet</p>
            <p className="text-ink-soft mb-6">
              Tap ♡ on any idea on the main page to save it for later.
            </p>
            <a
              href="/"
              className="inline-block px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-hover"
            >
              Find something →
            </a>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-6">
              <button
                onClick={pickOne}
                className="px-6 py-3 bg-accent text-ink border-2 border-ink rounded-full font-semibold hover:translate-y-[-1px] transition shadow-sm"
              >
                🎲 Pick one for me
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((a) => (
                <div
                  key={a.id}
                  id={`fav-${a.id}`}
                  className={`transition-all ${
                    highlighted === a.id
                      ? 'ring-4 ring-accent scale-[1.02] rounded-3xl'
                      : ''
                  }`}
                >
                  <ActivityCard
                    activity={a}
                    isFavorite={true}
                    onToggleFavorite={() => toggle(a.id)}
                    onDidIt={() => {}}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default function FavoritesPage() {
  return (
    <ToastProvider>
      <FavoritesInner />
    </ToastProvider>
  );
}
