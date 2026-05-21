'use client';
import type { Audience } from '@/lib/types';

const LABELS: Record<Audience, string> = { teen: 'Teen', adult: 'Adult' };

export default function AudienceSwitcher({
  value,
  onChange,
}: {
  value: Audience;
  onChange: (a: Audience) => void;
}) {
  return (
    <div className="inline-flex rounded-full bg-gray-100 p-1">
      {(['teen', 'adult'] as Audience[]).map((a) => (
        <button
          key={a}
          onClick={() => onChange(a)}
          className={`px-4 py-1 rounded-full text-sm transition ${
            value === a ? 'bg-white shadow text-gray-900' : 'text-gray-500'
          }`}
        >
          {LABELS[a]}
        </button>
      ))}
    </div>
  );
}
