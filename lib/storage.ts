'use client';
import { useEffect, useState, useCallback } from 'react';
import type { Filters, Audience } from './types';

const FAVORITES_KEY = 'wsid:favorites';
const HISTORY_KEY = 'wsid:history';
const AUDIENCE_KEY = 'wsid:audience';
const FILTERS_KEY = 'wsid:filters';
const HISTORY_LIMIT = 50;

type HistoryEntry = { id: string; ts: number; action: 'shown' | 'did_it' };

function read<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota or disabled */
  }
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);
  useEffect(() => {
    setFavorites(read<string[]>(FAVORITES_KEY, []));
  }, []);

  const toggle = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      write(FAVORITES_KEY, next);
      return next;
    });
  }, []);

  return { favorites, toggle };
}

export function useHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  useEffect(() => {
    setHistory(read<HistoryEntry[]>(HISTORY_KEY, []));
  }, []);

  const record = useCallback((id: string, action: HistoryEntry['action']) => {
    setHistory((prev) => {
      const next = [...prev, { id, ts: Date.now(), action }].slice(-HISTORY_LIMIT);
      write(HISTORY_KEY, next);
      return next;
    });
  }, []);

  const recentShownIds = useCallback(
    (n = 20) => history.filter((h) => h.action === 'shown').slice(-n).map((h) => h.id),
    [history],
  );

  const doneIds = useCallback(
    () => Array.from(new Set(history.filter((h) => h.action === 'did_it').map((h) => h.id))),
    [history],
  );

  return { history, record, recentShownIds, doneIds };
}

export function usePersistedAudience(): [Audience | null, (a: Audience) => void] {
  const [audience, setAudience] = useState<Audience | null>(null);
  useEffect(() => {
    setAudience(read<Audience | null>(AUDIENCE_KEY, null));
  }, []);
  const update = useCallback((a: Audience) => {
    setAudience(a);
    write(AUDIENCE_KEY, a);
  }, []);
  return [audience, update];
}

export function usePersistedFilters(initial: Filters): [Filters, (f: Filters) => void] {
  const [filters, setFilters] = useState<Filters>(initial);
  useEffect(() => {
    const saved = read<Filters | null>(FILTERS_KEY, null);
    if (saved) setFilters(saved);
  }, []);
  const update = useCallback((f: Filters) => {
    setFilters(f);
    write(FILTERS_KEY, f);
  }, []);
  return [filters, update];
}
