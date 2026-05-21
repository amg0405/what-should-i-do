'use client';

export default function AntiDoomscrollButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 rounded-full text-sm bg-amber-100 text-amber-900 border border-amber-300 hover:bg-amber-200 transition"
    >
      I&apos;ve been doomscrolling →
    </button>
  );
}
