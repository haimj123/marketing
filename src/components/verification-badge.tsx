import { BadgeCheck, FileText, Pencil, Quote, ShieldQuestion } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { VERIFICATION_LABEL } from "@/lib/format";
import type { VerificationLevel } from "@/lib/types";

const ICON = {
  unverified: ShieldQuestion,
  irs_listed: FileText,
  claimed: Pencil,
  claim_verified: BadgeCheck,
  endorsed: Quote,
} as const;

/**
 * Bronze appears here and on progress fills and the maaser ring. Nowhere else.
 * The three lower rungs stay neutral so the badge keeps meaning something.
 */
const TONE: Record<VerificationLevel, string> = {
  unverified: "bg-ink-050 text-ink-600 border-ink-300",
  irs_listed: "bg-ink-050 text-ink-600 border-ink-300",
  claimed: "bg-blue-050 text-blue-700 border-blue-050",
  claim_verified: "bg-bronze-100 text-bronze-600 border-bronze-100",
  endorsed: "bg-bronze-100 text-bronze-600 border-bronze-500",
};

export function VerificationBadge({
  level,
  size = "sm",
  asLink = true,
  className,
}: {
  level: VerificationLevel;
  size?: "sm" | "md";
  asLink?: boolean;
  className?: string;
}) {
  const Icon = ICON[level];
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-semibold",
        TONE[level],
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className,
      )}
    >
      <Icon aria-hidden className={size === "sm" ? "size-3.5" : "size-4"} />
      {VERIFICATION_LABEL[level]}
    </span>
  );

  if (!asLink) return content;
  return (
    <Link href="/verification" title="How verification works" className="inline-flex">
      {content}
    </Link>
  );
}
