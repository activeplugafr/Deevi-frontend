"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { cn } from "@/lib/cn";

type ToastKind = "success" | "error" | "info";
interface Toast {
  id: number;
  kind: ToastKind;
  message: string;
}

interface ToastApi {
  show: (message: string, kind?: ToastKind) => void;
  success: (m: string) => void;
  error: (m: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const KIND_STYLE: Record<ToastKind, string> = {
  success: "border-success-600/30 bg-white text-ink",
  error: "border-danger-600/30 bg-white text-ink",
  info: "border-line bg-white text-ink",
};
const DOT: Record<ToastKind, string> = {
  success: "bg-success-600",
  error: "bg-danger-600",
  info: "bg-brand-600",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id));
  }, []);

  const show = useCallback(
    (message: string, kind: ToastKind = "info") => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t, { id, kind, message }]);
      setTimeout(() => remove(id), 4200);
    },
    [remove],
  );

  const api: ToastApi = {
    show,
    success: (m) => show(m, "success"),
    error: (m) => show(m, "error"),
  };

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        className="fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:bottom-6 pointer-events-none"
        aria-live="polite"
        role="status"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-xl border px-4 py-3 shadow-lg shadow-black/5 animate-[fadeIn_.15s_ease-out]",
              KIND_STYLE[t.kind],
            )}
          >
            <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", DOT[t.kind])} />
            <p className="text-sm leading-snug">{t.message}</p>
            <button
              onClick={() => remove(t.id)}
              className="ml-auto text-muted hover:text-ink"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within <ToastProvider>");
  return ctx;
}
