"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/** 999px radius, 36px height, blue-050 fill with a blue-700 border when on. */
export function Chip({
  active,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 rounded-full border px-3.5 text-sm font-semibold transition-colors",
        active
          ? "border-brand-700 bg-brand-050 text-brand-900"
          : "border-ink-300 bg-white text-ink-600 hover:border-ink-600 hover:text-ink-900",
        className,
      )}
      {...props}
    />
  );
}

export function StaticChip({
  className,
  children,
  tone = "neutral",
}: {
  className?: string;
  children: React.ReactNode;
  tone?: "neutral" | "brand" | "bronze";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
        tone === "neutral" && "bg-ink-050 text-ink-600",
        tone === "brand" && "bg-brand-050 text-brand-700",
        tone === "bronze" && "bg-bronze-100 text-bronze-600",
        className,
      )}
    >
      {children}
    </span>
  );
}
