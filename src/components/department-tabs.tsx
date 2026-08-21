"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * The sticky section tabs from a restaurant page, doing the same job here:
 * an organization with five departments is a menu, and a donor should be able
 * to jump straight to the one they care about.
 */
export function DepartmentTabs({
  sections,
}: {
  sections: { id: string; label: string }[];
}) {
  const [active, setActive] = React.useState(sections[0]?.id);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-140px 0px -60% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-16 z-20 -mx-4 border-b border-ink-300 bg-white px-4 md:-mx-6 md:px-6"
    >
      <ul className="rail py-2">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              aria-current={active === section.id ? "true" : undefined}
              className={cn(
                "inline-flex h-9 items-center whitespace-nowrap rounded-full border px-3.5 text-sm font-semibold transition-colors",
                active === section.id
                  ? "border-blue-700 bg-blue-050 text-blue-900"
                  : "border-transparent text-ink-600 hover:text-ink-900",
              )}
            >
              {section.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
