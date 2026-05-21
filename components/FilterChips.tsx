'use client';
import type { Filters, TimeBucket, Energy, Mood, BudgetTier } from '@/lib/types';

const TIME_LABELS: Record<TimeBucket, string> = {
  '15min': '15 min',
  '1hr': '1 hr',
  '3hr': '3 hrs',
  fullday: 'All day',
};
const ENERGY_LABELS: Record<Energy, string> = { low: '🪫 Low', medium: '🔋 Medium', high: '⚡ High' };
const MOOD_LABELS: Record<Mood, string> = {
  calm: '🧘 Calm',
  curious: '🤔 Curious',
  restless: '🫨 Restless',
  social: '🫶 Social',
};
const BUDGET_LABELS: Record<BudgetTier | 'any', string> = {
  any: 'Any',
  free: 'Free',
  under5: '≤ S$5',
  under10: '≤ S$10',
  under50: '≤ S$50',
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
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-semibold uppercase tracking-[0.15em] text-ink-soft">
        {props.label}
      </span>
      <div className="flex items-center gap-2 flex-wrap">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => props.onChange(k)}
            className={`px-3.5 py-1.5 rounded-full text-sm border transition font-medium ${
              props.value === k
                ? 'bg-ink text-bg-2 border-ink shadow-sm'
                : 'bg-card text-ink border-muted hover:border-ink-soft'
            }`}
          >
            {props.options[k]}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function FilterChips({ filters, onChange }: Props) {
  return (
    <div className="flex flex-col gap-4">
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
      <ChipRow
        label="Budget"
        value={filters.budget ?? 'any'}
        options={BUDGET_LABELS}
        onChange={(v) => onChange({ ...filters, budget: v })}
      />
    </div>
  );
}
