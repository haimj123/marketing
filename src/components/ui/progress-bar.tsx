import { cn } from "@/lib/cn";
import { formatCompactCents, formatPercent, daysSince, timeAgo } from "@/lib/format";

/**
 * There is no transaction data behind these numbers and there never will be —
 * the organization types them in.
 *
 * The full bar therefore refuses to render without its "as reported" line: a
 * progress bar with no date on it is a claim presented as a fact.
 *
 * The card variant has no room for that line, and the brief's card spec is one
 * tight row. The compromise: a fresh figure reads clean, and a figure that has
 * gone stale says so right there in warning colour rather than waiting for the
 * profile page. Fresh data gets the clean card; old data cannot hide on it.
 */
const STALE_DAYS = 30;

export function ProgressBar({
  raisedCents,
  goalCents,
  updatedAt,
  className,
}: {
  raisedCents: number | null | undefined;
  goalCents: number | null | undefined;
  updatedAt: string | null | undefined;
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
      <Track pct={pct} label={`${pct} percent of goal, as reported by the organization`} />
      <p className="mt-1.5 text-xs text-ink-600">
        As reported by the organization, {timeAgo(updatedAt)}
      </p>
    </div>
  );
}

/** The one-line variant that sits under an organization card. */
export function CardProgress({
  raisedCents,
  goalCents,
  updatedAt,
  className,
}: {
  raisedCents: number | null | undefined;
  goalCents: number | null | undefined;
  updatedAt: string | null | undefined;
  className?: string;
}) {
  if (!goalCents) return null;
  const raised = raisedCents ?? 0;
  const pct = formatPercent(raised, goalCents);
  const stale = daysSince(updatedAt) >= STALE_DAYS;

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Track
        pct={pct}
        className="w-14 shrink-0"
        label={`${pct} percent of goal, as reported by the organization ${timeAgo(updatedAt)}`}
      />
      <p className="tabular truncate text-sm text-ink-600">
        <span className="font-semibold text-ink-900">{pct}%</span> of{" "}
        {formatCompactCents(goalCents)}
        {stale && (
          <span className="text-warning"> · updated {timeAgo(updatedAt)}</span>
        )}
      </p>
    </div>
  );
}

function Track({
  pct,
  label,
  className,
}: {
  pct: number;
  label: string;
  className?: string;
}) {
  return (
    <div
      className={cn("h-1 w-full overflow-hidden rounded-pill bg-bronze-100", className)}
      role="progressbar"
      aria-valuenow={pct}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
    >
      <div
        className="h-full rounded-pill bg-bronze-600"
        style={{ width: `${Math.min(100, pct)}%` }}
      />
    </div>
  );
}
