'use client';
import type { Filters, TimeBucket, Energy, Mood } from '@/lib/types';

const TIME_LABELS: Record<TimeBucket, string> = {
  '15min': '15 min',
  '1hr': '1 hr',
  '3hr': '3 hrs',
  fullday: 'Full day',
};
const ENERGY_LABELS: Record<Energy, string> = { low: 'Low', medium: 'Medium', high: 'High' };
const MOOD_LABELS: Record<Mood, string> = {
  calm: 'Calm',
  curious: 'Curious',
  restless: 'Restless',
  social: 'Social',
};

type Props = {
  filters: Filters;
  onChange: (f: Filters) => void;
};

function ChipRow<T extends string>(props: {
  label: string;
  value: T;
  options: Record<T, string>;
  onChange: (v: T) => void;
}) {
  const keys = Object.keys(props.options) as T[];
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs uppercase tracking-wide text-gray-500 w-16 shrink-0">
        {props.label}
      </span>
      {keys.map((k) => (
        <button
          key={k}
          onClick={() => props.onChange(k)}
          className={`px-3 py-1.5 rounded-full text-sm border transition ${
            props.value === k
              ? 'bg-gray-900 text-white border-gray-900'
              : 'bg-white text-gray-700 border-gray-300 hover:border-gray-500'
          }`}
        >
          {props.options[k]}
        </button>
      ))}
    </div>
  );
}

export default function FilterChips({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-3">
      <ChipRow
        label="Time"
        value={filters.time}
        options={TIME_LABELS}
        onChange={(v) => onChange({ ...filters, time: v })}
      />
      <ChipRow
        label="Energy"
        value={filters.energy}
        options={ENERGY_LABELS}
        onChange={(v) => onChange({ ...filters, energy: v })}
      />
      <ChipRow
        label="Mood"
        value={filters.mood}
        options={MOOD_LABELS}
        onChange={(v) => onChange({ ...filters, mood: v })}
      />
    </div>
  );
}
