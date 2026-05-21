'use client';
import { createContext, useCallback, useContext, useState } from 'react';

type ToastMsg = { id: number; text: string };

const ToastCtx = createContext<(text: string) => void>(() => {});

export function useToast() {
  return useContext(ToastCtx);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);

  const push = useCallback((text: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, text }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none w-[calc(100%-2rem)] max-w-md">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="animate-pop-in bg-ink text-bg-2 px-4 py-2.5 rounded-2xl shadow-lg text-sm font-medium text-center"
          >
            {t.text}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
