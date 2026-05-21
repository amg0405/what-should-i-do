'use client';
import { useEffect, useRef, useState } from 'react';
import { encodeFilters } from '@/lib/share';
import { useToast } from './Toast';
import type { Filters, Activity } from '@/lib/types';

type Props = {
  filters?: Filters;
  activity?: Activity;
  label?: string;
  variant?: 'link' | 'icon';
};

function getShareUrl(filters?: Filters): string {
  if (typeof window === 'undefined') return '';
  const base = window.location.origin;
  if (filters) return `${base}/?${encodeFilters(filters).toString()}`;
  return `${base}/`;
}

function getShareText(activity?: Activity): string {
  if (activity) return `Bored? Try this: ${activity.title}`;
  return `I'm bored. Help me pick:`;
}

export default function ShareMenu({ filters, activity, label, variant = 'link' }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [open]);

  const url = getShareUrl(filters);
  const text = getShareText(activity);

  const tryNative = async () => {
    if (typeof navigator !== 'undefined' && 'share' in navigator) {
      try {
        await navigator.share({ title: 'WhatShouldIDo?', text, url });
        return true;
      } catch {
        return false;
      }
    }
    return false;
  };

  const onTrigger = async () => {
    if (await tryNative()) return;
    setOpen((v) => !v);
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast('Link copied ✨');
    } catch {
      window.prompt('Copy this link:', url);
    }
    setOpen(false);
  };

  const onWhatsApp = () => {
    const msg = encodeURIComponent(`${text} ${url}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    setOpen(false);
  };

  const onTelegram = () => {
    window.open(
      `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
      '_blank',
    );
    setOpen(false);
  };

  if (variant === 'icon') {
    return (
      <div className="relative" ref={ref}>
        <button
          onClick={onTrigger}
          aria-label="Share this idea"
          className="text-ink-soft hover:text-ink text-lg leading-none transition"
          title="Share with a friend"
        >
          ↗
        </button>
        {open && <Menu onCopy={onCopy} onWhatsApp={onWhatsApp} onTelegram={onTelegram} />}
      </div>
    );
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={onTrigger}
        className="px-3 py-1.5 text-sm text-ink-soft hover:text-ink underline-offset-4 hover:underline"
      >
        ↗ {label ?? 'Share with a friend'}
      </button>
      {open && <Menu onCopy={onCopy} onWhatsApp={onWhatsApp} onTelegram={onTelegram} />}
    </div>
  );
}

function Menu(props: { onCopy: () => void; onWhatsApp: () => void; onTelegram: () => void }) {
  return (
    <div className="absolute right-0 sm:right-0 bottom-full mb-2 z-30 bg-bg-2 border border-muted rounded-2xl shadow-xl p-2 min-w-[200px] animate-pop-in">
      <button
        onClick={props.onWhatsApp}
        className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-card flex items-center gap-2"
      >
        <span>💬</span> WhatsApp
      </button>
      <button
        onClick={props.onTelegram}
        className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-card flex items-center gap-2"
      >
        <span>✈️</span> Telegram
      </button>
      <button
        onClick={props.onCopy}
        className="w-full text-left px-3 py-2 text-sm rounded-xl hover:bg-card flex items-center gap-2"
      >
        <span>🔗</span> Copy link
      </button>
    </div>
  );
}
