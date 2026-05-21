'use client';
import { useState } from 'react';
import { encodeFilters } from '@/lib/share';
import type { Filters } from '@/lib/types';

export default function ShareButton({ filters }: { filters: Filters }) {
  const [copied, setCopied] = useState(false);
  const onClick = async () => {
    const url = `${window.location.origin}/?${encodeFilters(filters).toString()}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      window.prompt('Copy this link:', url);
    }
  };
  return (
    <button
      onClick={onClick}
      className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 underline"
    >
      {copied ? 'Copied ✓' : 'Share these filters'}
    </button>
  );
}
