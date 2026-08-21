"use client";

import * as React from "react";

interface Toast {
  id: number;
  message: string;
  tone: "default" | "success";
}

const ToastContext = React.createContext<((message: string, tone?: Toast["tone"]) => void) | null>(
  null,
);

/** Slides up from just above the tab bar, dark fill, auto-dismiss at 3s. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);
  const seq = React.useRef(0);

  const push = React.useCallback((message: string, tone: Toast["tone"] = "default") => {
    const id = ++seq.current;
    setToasts((t) => [...t, { id, message, tone }]);
    window.setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3000);
  }, []);

  return (
    <ToastContext.Provider value={push}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--spacing-tabbar)+env(safe-area-inset-bottom)+12px)] z-50 flex flex-col items-center gap-2 px-4"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{ animation: "toast-in 200ms ease-out" }}
            className="pointer-events-auto w-full max-w-[calc(var(--container-app)-32px)] rounded-card bg-ink-900 px-4 py-3 text-sm font-medium text-white shadow-toast"
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = React.useContext(ToastContext);
  return ctx ?? (() => {});
}
