import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { ReactNode } from "react";

/** Section header: 20/700 title, chevron on the right, then the content. */
export function FeedSection({
  title,
  subtitle,
  href,
  children,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  children: ReactNode;
}) {
  const id = `section-${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const inner = (
    <>
      <span className="min-w-0">
        <span className="block truncate font-display text-xl font-bold text-ink-900">{title}</span>
        {subtitle && <span className="block truncate text-sm text-ink-600">{subtitle}</span>}
      </span>
      {href && <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-900" />}
    </>
  );

  return (
    <section className="pt-6" aria-labelledby={id}>
      <h2 id={id} className="mb-3">
        {href ? (
          <Link href={href} className="press flex items-center justify-between gap-3">
            {inner}
          </Link>
        ) : (
          <span className="flex items-center justify-between gap-3">{inner}</span>
        )}
      </h2>
      {children}
    </section>
  );
}
