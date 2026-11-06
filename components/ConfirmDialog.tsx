"use client";
import { useEffect, useRef } from "react";

/** In-theme replacement for window.confirm(). */
export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  cancelLabel = "Keep playing",
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const cancelRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    cancelRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
      e.stopPropagation();
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [open, onCancel]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-4 animate-[fade_.15s_ease-out] sm:place-items-center" onPointerDown={onCancel}>
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cd-title"
        className="w-full max-w-sm animate-pop rounded-lg border-2 border-ink bg-paper p-5 shadow-[6px_6px_0_#171717]"
        onPointerDown={(e) => e.stopPropagation()}
      >
        <h2 id="cd-title" className="text-2xl font-bold tracking-tight">{title}</h2>
        {body && <p className="mt-1 text-sm text-ink/65">{body}</p>}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button ref={cancelRef} className="btn-lime" onClick={onCancel}>{cancelLabel}</button>
          <button className="btn-primary" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
