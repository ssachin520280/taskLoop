"use client";

import { createContext, useContext, useMemo, useRef, useState, type ReactNode } from "react";

type ToastTone = "success" | "error" | "info";

type Toast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
};

type ToastInput = Omit<Toast, "id" | "tone"> & {
  tone?: ToastTone;
};

type ToastContextValue = {
  toast: (input: ToastInput) => void;
};

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

const toneClassName: Record<ToastTone, string> = {
  error: "border-red-200 bg-red-50 text-red-950",
  info: "border-stone-200 bg-white text-[var(--ink)]",
  success: "border-emerald-200 bg-emerald-50 text-emerald-950"
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextToastId = useRef(0);

  const value = useMemo<ToastContextValue>(
    () => ({
      toast(input) {
        nextToastId.current += 1;
        const id = nextToastId.current;
        setToasts((current) => [...current, { id, tone: input.tone ?? "info", ...input }]);
        window.setTimeout(() => {
          setToasts((current) => current.filter((toast) => toast.id !== id));
        }, 4200);
      }
    }),
    []
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 grid w-[min(24rem,calc(100vw-2rem))] gap-3">
        {toasts.map((toast) => (
          <div key={toast.id} className={`rounded-2xl border p-4 shadow-lg shadow-black/10 ${toneClassName[toast.tone]}`}>
            <p className="text-sm font-black">{toast.title}</p>
            {toast.description ? <p className="mt-1 text-sm opacity-80">{toast.description}</p> : null}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used inside ToastProvider");
  }

  return context;
}
