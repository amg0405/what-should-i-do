'use client';
import { useCallback, useEffect, useMemo, useRef, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPool } from '@/lib/pool';
import { sample, sampleByCategory } from '@/lib/sampler';
import { decodeFilters } from '@/lib/share';
import { getTimeOfDay } from '@/lib/timeOfDay';
import {
  useFavorites,
  useHistory,
  usePersistedAudience,
  usePersistedFilters,
} from '@/lib/storage';
import type { Audience, Filters, Activity } from '@/lib/types';
import AudienceSwitcher from '@/components/AudienceSwitcher';
import FilterChips from '@/components/FilterChips';
import MenuGrid from '@/components/MenuGrid';
import AntiDoomscrollButton from '@/components/AntiDoomscrollButton';
import ShareButton from '@/components/ShareButton';
import { ToastProvider } from '@/components/Toast';

const DEFAULT_FILTERS: Filters = {
  audience: 'teen',
  time: '1hr',
  energy: 'medium',
  mood: 'curious',
};

const SUBTITLES = [
  '…when I&apos;m bored?',
  '…instead of doomscrolling?',
  '…with this random Tuesday?',
  '…that&apos;s actually fun?',
  '…that future-me will thank me for?',
];

function FirstVisitModal({ onChoose }: { onChoose: (a: Audience) => void }) {
  return (
    <div className="fixed inset-0 bg-ink/30 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-slide-up">
      <div className="bg-bg-2 rounded-3xl p-7 max-w-sm w-full shadow-xl border border-muted animate-pop-in">
        <div className="text-4xl mb-2">👋</div>
        <h2 className="display text-2xl font-semibold mb-2 text-ink">What&apos;s your vibe?</h2>
        <p className="text-sm text-ink-soft mb-5">
          Tells us how to flavour the ideas. You can switch any time.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onChoose('teen')}
            className="px-4 py-3.5 bg-ink text-bg-2 rounded-2xl hover:bg-ink/85 font-medium text-left flex items-center gap-3"
          >
            <span className="text-2xl">🧑‍🎓</span>
            <span>Still in school / college</span>
          </button>
          <button
            onClick={() => onChoose('adult')}
            className="px-4 py-3.5 bg-card border-2 border-muted rounded-2xl hover:border-ink font-medium text-left flex items-center gap-3"
          >
            <span className="text-2xl">💼</span>
            <span>Working life</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function RotatingSubtitle() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % SUBTITLES.length), 3200);
    return () => clearInterval(id);
  }, []);
  return (
    <span
      key={i}
      className="block text-ink-soft text-base sm:text-lg font-normal animate-fade-swap"
      dangerouslySetInnerHTML={{ __html: SUBTITLES[i] }}
    />
  );
}

function PageInner() {
  const searchParams = useSearchParams();
  const [audience, setAudience] = usePersistedAudience();
  const [filters, setFilters] = usePersistedFilters(DEFAULT_FILTERS);
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { record, recentShownIds, doneIds, history } = useHistory();
  const [shown, setShown] = useState<Activity[]>([]);
  const [doomMode, setDoomMode] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const lastSig = useRef<string>('');

  const doneCount = useMemo(() => {
    const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return history.filter((h) => h.action === 'did_it' && h.ts > oneWeekAgo).length;
  }, [history]);

  useEffect(() => {
    const fromUrl = decodeFilters(searchParams);
    if (fromUrl) {
      setFilters(fromUrl);
      setAudience(fromUrl.audience);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = useCallback(
    (overrideAudience?: Audience, opts: { antiDoomscroll?: boolean } = {}) => {
      const aud = overrideAudience ?? audience ?? 'teen';
      const pool = getPool(aud);
      const next = sample(
        pool,
        { ...filters, audience: aud },
        {
          count: 6,
          antiDoomscroll: opts.antiDoomscroll ?? doomMode,
          currentTimeOfDay: getTimeOfDay(),
          excludeIds: [...recentShownIds(20), ...doneIds()],
        },
      );
      setShown(next);
      next.forEach((a) => record(a.id, 'shown'));
    },
    [audience, filters, doomMode, recentShownIds, doneIds, record],
  );

  const moreLikeThis = useCallback(
    (activity: Activity) => {
      const aud = audience ?? 'teen';
      const pool = getPool(aud);
      const next = sampleByCategory(pool, activity.tags.category, 6, doneIds());
      setShown(next);
      next.forEach((a) => record(a.id, 'shown'));
    },
    [audience, doneIds, record],
  );

  // Live-update shown when filters or audience change
  useEffect(() => {
    if (!hydrated || !audience) return;
    const sig = `${audience}|${filters.time}|${filters.energy}|${filters.mood}|${doomMode}`;
    if (sig === lastSig.current) return;
    lastSig.current = sig;
    generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, audience, filters.time, filters.energy, filters.mood, doomMode]);

  const generatedDate = useMemo(() => {
    if (!audience) return '';
    return new Date(getPool(audience).generated_at).toLocaleDateString();
  }, [audience]);

  if (!hydrated) return null;
  if (!audience)
    return (
      <FirstVisitModal
        onChoose={(a) => {
          setAudience(a);
          setFilters({ ...filters, audience: a });
        }}
      />
    );

  return (
    <main className="min-h-screen">
      <div className="max-w-5xl mx-auto px-4 py-6 sm:py-10">
        <header className="mb-6 sm:mb-8">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <a href="/" className="display text-2xl sm:text-3xl font-semibold tracking-tight text-ink">
              WhatShouldIDo<span className="text-primary">?</span>
            </a>
            <div className="flex items-center gap-2">
              <AudienceSwitcher
                value={audience}
                onChange={(a) => {
                  setAudience(a);
                  setFilters({ ...filters, audience: a });
                }}
              />
              <a
                href="/favorites"
                className="px-3 py-1.5 rounded-full text-sm text-ink hover:bg-card transition"
                title="Favorites"
              >
                ♥ {favorites.length || ''}
              </a>
            </div>
          </div>
          <div className="mt-2">
            <RotatingSubtitle />
          </div>
        </header>

        <section className="bg-bg-2 border border-muted rounded-3xl p-5 sm:p-6 mb-6 shadow-sm">
          <FilterChips filters={filters} onChange={setFilters} />
          <div className="mt-5 pt-5 border-t border-muted space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setDoomMode(false);
                  generate(undefined, { antiDoomscroll: false });
                }}
                className="w-full sm:w-auto px-5 py-2.5 bg-primary text-white rounded-full font-medium hover:bg-primary-hover shadow-sm hover:shadow"
              >
                🎲 Surprise me
              </button>
              <AntiDoomscrollButton
                onClick={() => {
                  setDoomMode(true);
                  generate(undefined, { antiDoomscroll: true });
                }}
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              {doneCount > 0 ? (
                <span className="text-xs text-success font-semibold">
                  {doneCount} done this week 🔥
                </span>
              ) : (
                <span />
              )}
              <ShareButton filters={filters} />
            </div>
          </div>
          {doomMode && (
            <div className="mt-3 text-xs text-ink-soft">
              Anti-doomscroll mode on — showing offline, no-phone activities.{' '}
              <button onClick={() => setDoomMode(false)} className="underline">
                turn off
              </button>
            </div>
          )}
        </section>

        <MenuGrid
          activities={shown}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDidIt={(id) => record(id, 'did_it')}
          onMoreLikeThis={moreLikeThis}
        />

        {shown.length > 0 && (
          <div className="flex justify-center mt-8">
            <button
              onClick={() => generate()}
              className="px-5 py-2.5 rounded-full text-sm bg-card border-2 border-muted hover:border-ink font-medium text-ink"
            >
              ↻ Show me 6 different ones
            </button>
          </div>
        )}

        <footer className="text-center text-xs text-ink-soft mt-12 pb-6">
          Fresh ideas every Monday · pool refreshed {generatedDate} ✨
        </footer>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <ToastProvider>
      <Suspense fallback={null}>
        <PageInner />
      </Suspense>
    </ToastProvider>
  );
}
