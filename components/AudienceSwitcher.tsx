'use client';
import type { Audience } from '@/lib/types';

const LABELS: Record<Audience, { text: string; emoji: string }> = {
  teen: { text: 'School mode', emoji: '🧑‍🎓' },
  adult: { text: 'Work mode', emoji: '💼' },
};

export default function AudienceSwitcher({
  value,
  onChange,
}: {
  value: Audience;
  onChange: (a: Audience) => void;
}) {
  const other: Audience = value === 'teen' ? 'adult' : 'teen';
  const otherMeta = LABELS[other];
  const meta = LABELS[value];

  return (
    <button
      onClick={() => onChange(other)}
      className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-sm bg-card border border-muted hover:border-ink-soft transition"
      title={`Switch to ${otherMeta.text}`}
    >
      <span>{meta.emoji}</span>
      <span className="font-medium text-ink">{meta.text}</span>
      <span className="text-ink-soft text-xs">· switch</span>
    </button>
  );
}
