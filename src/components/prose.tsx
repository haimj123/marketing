import type { ReactNode } from "react";

/** Shared shell for the static pages. */
export function Prose({
  title,
  lead,
  children,
}: {
  title: string;
  lead?: string;
  children: ReactNode;
}) {
  return (
    <div className="page max-w-2xl py-10">
      <h1 className="font-display text-3xl font-extrabold tracking-tight text-ink-900">{title}</h1>
      {lead && <p className="mt-3 text-lg text-ink-600">{lead}</p>}
      <div className="mt-8 space-y-6 text-base leading-relaxed text-ink-600 [&_a]:font-semibold [&_a]:text-brand-700 [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:mb-2 [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-6">
        {children}
      </div>
    </div>
  );
}
