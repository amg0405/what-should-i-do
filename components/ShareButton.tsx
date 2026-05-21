'use client';
import { encodeFilters } from '@/lib/share';
import { useToast } from './Toast';
import type { Filters } from '@/lib/types';

export default function ShareButton({ filters }: { filters: Filters }) {
  const toast = useToast();
  const onClick = async () => {
    const url = `${window.location.origin}/?${encodeFilters(filters).toString()}`;
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'What should I do?', url });
        return;
      } catch {
        /* user cancelled or no support — fall through to clipboard */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied — share with a friend ✨');
    } catch {
      window.prompt('Copy this link:', url);
    }
  };
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm text-ink-soft hover:text-ink underline-offset-4 hover:underline"
    >
      ↗ Share these filters
    </button>
  );
}
