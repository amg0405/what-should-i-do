'use client';
import { useEffect, useMemo, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getPool } from '@/lib/pool';
import { sample } from '@/lib/sampler';
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

const DEFAULT_FILTERS: Filters = {
  audience: 'teen',
  time: '1hr',
  energy: 'medium',
  mood: 'curious',
};

function FirstVisitModal({ onChoose }: { onChoose: (a: Audience) => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
        <h2 className="text-lg font-semibold mb-2">Who are you roughly?</h2>
        <p className="text-sm text-gray-600 mb-4">
          We&apos;ll tune suggestions to your life situation. You can switch later.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => onChoose('teen')}
            className="px-4 py-3 bg-gray-900 text-white rounded-lg hover:bg-gray-700"
          >
            I&apos;m 22 or younger (school/college)
          </button>
          <button
            onClick={() => onChoose('adult')}
            className="px-4 py-3 bg-white border border-gray-300 rounded-lg hover:border-gray-500"
          >
            I&apos;m older than 22 (working)
          </button>
        </div>
      </div>
    </div>
  );
}

function PageInner() {
  const searchParams = useSearchParams();
  const [audience, setAudience] = usePersistedAudience();
  const [filters, setFilters] = usePersistedFilters(DEFAULT_FILTERS);
  const { favorites, toggle: toggleFavorite } = useFavorites();
  const { record, recentShownIds } = useHistory();
  const [shown, setShown] = useState<Activity[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromUrl = decodeFilters(searchParams);
    if (fromUrl) {
      setFilters(fromUrl);
      setAudience(fromUrl.audience);
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generate = (overrideAudience?: Audience, opts: { antiDoomscroll?: boolean } = {}) => {
    const aud = overrideAudience ?? audience ?? 'teen';
    const pool = getPool(aud);
    const next = sample(
      pool,
      { ...filters, audience: aud },
      {
        count: 6,
        antiDoomscroll: opts.antiDoomscroll,
        currentTimeOfDay: getTimeOfDay(),
        excludeIds: recentShownIds(20),
      },
    );
    setShown(next);
    next.forEach((a) => record(a.id, 'shown'));
  };

  useEffect(() => {
    if (hydrated && audience && shown.length === 0) generate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated, audience]);

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
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <header className="flex items-center justify-between mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">What should I do?</h1>
          <div className="flex items-center gap-3">
            <AudienceSwitcher
              value={audience}
              onChange={(a) => {
                setAudience(a);
                setFilters({ ...filters, audience: a });
                setShown([]);
              }}
            />
            <a href="/favorites" className="text-sm text-gray-600 hover:text-gray-900 underline">
              Favorites
            </a>
          </div>
        </header>

        <section className="bg-white border border-gray-200 rounded-2xl p-5 mb-6">
          <FilterChips filters={filters} onChange={setFilters} />
          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              onClick={() => generate()}
              className="px-5 py-2.5 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-700"
            >
              Show me ideas
            </button>
            <AntiDoomscrollButton onClick={() => generate(undefined, { antiDoomscroll: true })} />
            <div className="ml-auto">
              <ShareButton filters={filters} />
            </div>
          </div>
        </section>

        <MenuGrid
          activities={shown}
          favorites={favorites}
          onToggleFavorite={toggleFavorite}
          onDidIt={(id) => record(id, 'did_it')}
        />

        {shown.length > 0 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => generate()}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 underline"
            >
              Refresh ↻
            </button>
          </div>
        )}

        <footer className="text-center text-xs text-gray-400 mt-12">
          Pool last updated: {generatedDate}
        </footer>
      </div>
    </main>
  );
}

export default function Page() {
  return (
    <Suspense fallback={null}>
      <PageInner />
    </Suspense>
  );
}
