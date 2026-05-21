'use client';

export default function AntiDoomscrollButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2.5 rounded-full text-sm font-medium bg-accent text-ink border-2 border-ink hover:translate-y-[-1px] transition"
    >
      I&apos;ve been doomscrolling →
    </button>
  );
}
