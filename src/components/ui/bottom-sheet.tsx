"use client";

import * as React from "react";

/**
 * Slides up over a fading backdrop, 16px top radius, 4px drag handle, and it
 * can be thrown away downward.
 *
 * Drag-to-dismiss is pointer-events rather than a gesture library: it is forty
 * lines, it works with touch, mouse and pen, and it does not add a dependency
 * to a project whose whole argument is that it costs nothing to run.
 */
export function BottomSheet({
  open,
  onClose,
  title,
  footer,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  /** Pinned below the scroll area — filter sheets put their actions here. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  const [drag, setDrag] = React.useState(0);
  const startY = React.useRef<number | null>(null);
  const sheetRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    setDrag(0);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // Focus the sheet so Escape works and screen readers land inside it.
    sheetRef.current?.focus();

    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  function onPointerDown(e: React.PointerEvent) {
    startY.current = e.clientY;
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    if (startY.current === null) return;
    // Downward only. Dragging up should not detach the sheet from the bottom.
    setDrag(Math.max(0, e.clientY - startY.current));
  }

  function onPointerUp() {
    if (startY.current === null) return;
    startY.current = null;
    if (drag > 96) onClose();
    else setDrag(0);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-ink-900/40"
        style={{ animation: "fade-in 200ms ease-out" }}
      />

      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        style={{
          transform: `translateY(${drag}px)`,
          transition: startY.current === null ? "transform 200ms ease-out" : "none",
          animation: drag === 0 ? "sheet-in 240ms cubic-bezier(.32,.72,0,1)" : undefined,
        }}
        className="relative flex max-h-[85dvh] w-full max-w-app flex-col rounded-t-sheet bg-white shadow-sheet outline-none"
      >
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="shrink-0 cursor-grab touch-none pb-1 pt-2.5 active:cursor-grabbing"
        >
          <div aria-hidden className="mx-auto h-1 w-10 rounded-pill bg-ink-300" />
        </div>

        <h2 className="app shrink-0 pb-2 pt-1 font-display text-lg font-bold text-ink-900">
          {title}
        </h2>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>

        {footer && (
          <div className="shrink-0 border-t border-ink-300 bg-white pb-[env(safe-area-inset-bottom)]">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
