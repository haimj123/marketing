import type { ReactNode } from "react";
import { AppHeader } from "./shell/app-header";

/** Shared shell for the reading pages. Body copy stays near 65 characters. */
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
    <>
      <AppHeader back title={title} />
      <div className="app py-5">
        <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900">
          {title}
        </h1>
        {lead && <p className="mt-2 text-base text-ink-600">{lead}</p>}
        <div className="mt-5 space-y-4 text-[15px] leading-relaxed text-ink-600 [&_a]:font-semibold [&_a]:text-blue-700 [&_a]:underline [&_h2]:mt-7 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:mb-1.5 [&_strong]:text-ink-900 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
        <div className="h-8" />
      </div>
    </>
  );
}
