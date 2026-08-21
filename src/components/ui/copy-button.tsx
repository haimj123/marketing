"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { useToast } from "./toast";
import { cn } from "@/lib/cn";

export function CopyButton({
  value,
  label = "Copy",
  className,
  onCopied,
}: {
  value: string;
  label?: string;
  className?: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  const toast = useToast();

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Older iOS Safari over http. Fall back to a selectable prompt.
      window.prompt("Copy this:", value);
    }
    setCopied(true);
    toast("Copied to clipboard", "success");
    onCopied?.();
    window.setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={copy}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-[8px] border border-ink-300 bg-white px-3 text-sm font-semibold text-brand-700 hover:border-brand-500 hover:bg-brand-050",
        className,
      )}
    >
      {copied ? (
        <Check aria-hidden className="size-4 text-success" />
      ) : (
        <Copy aria-hidden className="size-4" />
      )}
      {copied ? "Copied" : label}
    </button>
  );
}
