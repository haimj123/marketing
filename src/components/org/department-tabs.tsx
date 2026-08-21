"use client";

import * as React from "react";
import { cn } from "@/lib/cn";

/**
 * The menu-section tabs. 44px, white, 1px bottom border, sticky under the
 * header, active tab underlined 2px in blue.
 *
 * Scroll-spy is the detail that makes this feel native, and the detail most
 * implementations get wrong. Two things matter: the observer's rootMargin has
 * to account for the sticky bar's own height, or the tab flips a section too
 * early; and a tap has to suspend the spy while the smooth scroll runs, or the
 * sections it passes through fight the tab you just chose.
 */
export function DepartmentTabs({ sections }: { sections: { id: string; label: string }[] }) {
  const [active, setActive] = React.useState(sections[0]?.id);
  const railRef = React.useRef<HTMLUListElement>(null);
  const suspended = React.useRef(false);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (suspended.current) return;
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActive(visible.target.id);
      },
      { rootMargin: "-108px 0px -55% 0px", threshold: 0 },
    );

    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  // Keep the active tab in view as the spy moves it.
  React.useEffect(() => {
    const el = railRef.current?.querySelector<HTMLElement>(`[data-tab="${active}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  }, [active]);

  function go(e: React.MouseEvent, id: string) {
    e.preventDefault();
    setActive(id);
    suspended.current = true;
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      suspended.current = false;
    }, 700);
  }

  if (sections.length < 2) return null;

  return (
    <nav
      aria-label="Sections"
      className="sticky top-0 z-20 border-b border-ink-300 bg-white"
    >
      <ul ref={railRef} className="rail bleed h-11 items-stretch gap-0">
        {sections.map((section) => (
          <li key={section.id}>
            <a
              href={`#${section.id}`}
              data-tab={section.id}
              onClick={(e) => go(e, section.id)}
              aria-current={active === section.id ? "true" : undefined}
              className={cn(
                "press flex h-11 items-center whitespace-nowrap border-b-2 px-3 text-sm font-semibold transition-colors",
                active === section.id
                  ? "border-blue-700 text-blue-700"
                  : "border-transparent text-ink-600",
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
