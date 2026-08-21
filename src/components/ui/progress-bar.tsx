import { cn } from "@/lib/cn";
import { formatCompactCents, formatPercent, timeAgo } from "@/lib/format";

/**
 * There is no transaction data behind these numbers and there never will be —
 * the organization types them in. So the component refuses to render a bar
 * without the "as reported" line: a progress bar with no date on it is a
 * claim presented as a fact.
 */
export function ProgressBar({
  raisedCents,
  goalCents,
  updatedAt,
  compact,
  className,
}: {
  raisedCents: number | null | undefined;
  goalCents: number | null | undefined;
  updatedAt: string | null | undefined;
  compact?: boolean;
  className?: string;
}) {
  if (!goalCents) return null;
  const raised = raisedCents ?? 0;
  const pct = formatPercent(raised, goalCents);

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="tabular text-sm font-semibold text-ink-900">
          {formatCompactCents(raised)}{" "}
          <span className="font-normal text-ink-600">of {formatCompactCents(goalCents)}</span>
        </span>
        <span className="tabular text-sm font-semibold text-bronze-600">{pct}%</span>
      </div>
      <div
        className="h-2 w-full overflow-hidden rounded-full bg-bronze-100"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct} percent of goal, as reported by the organization`}
      >
        <div
          className="h-full rounded-full bg-bronze-500"
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
      {!compact && (
        <p className="mt-1.5 text-xs text-ink-600">
          As reported by the organization, {timeAgo(updatedAt)}
        </p>
      )}
    </div>
  );
}
