"use client";

import { formatCents } from "@/lib/format";

/**
 * The signature element. A bronze arc filling across the giving year, the
 * remaining obligation in large tabular numerals at the centre.
 *
 * Nothing else on the site uses this shape, and that is the point: with no
 * transaction to bring a donor back, this screen is the reason they return.
 */
export function MaaserRing({
  givenCents,
  obligationCents,
  size = 260,
}: {
  givenCents: number;
  obligationCents: number;
  size?: number;
}) {
  const stroke = size * 0.075;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const ratio = obligationCents > 0 ? Math.min(1, givenCents / obligationCents) : 0;
  const remaining = Math.max(0, obligationCents - givenCents);
  const complete = remaining === 0 && obligationCents > 0;
  const pct = Math.round(ratio * 100);

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        role="img"
        aria-label={`${pct} percent of your maaser given this year`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bronze-100)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-bronze-500)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ratio)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: "stroke-dashoffset 600ms ease" }}
        />
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        {complete ? (
          <>
            <span className="text-sm font-semibold text-ink-600">Maaser complete</span>
            <span className="tabular mt-1 font-display text-3xl font-extrabold text-bronze-600">
              {formatCents(givenCents)}
            </span>
            <span className="mt-1 text-xs text-ink-600">given this year</span>
          </>
        ) : (
          <>
            <span className="text-sm font-semibold text-ink-600">Still to give</span>
            <span className="tabular mt-1 font-display text-3xl font-extrabold text-ink-900">
              {formatCents(remaining)}
            </span>
            <span className="tabular mt-1 text-xs text-ink-600">
              {formatCents(givenCents)} of {formatCents(obligationCents)} · {pct}%
            </span>
          </>
        )}
      </div>
    </div>
  );
}
