"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * One header for every screen that wants one: 56px, white, 1px bottom border,
 * hides on scroll down and comes back on scroll up.
 *
 * Screens opt out by not rendering it — the organization profile is the only
 * one, because its hero runs full-bleed with floating controls over it.
 */
export function AppHeader({
  left,
  title,
  right,
  back,
  border = true,
}: {
  left?: React.ReactNode;
  title?: React.ReactNode;
  right?: React.ReactNode;
  /** Renders a back arrow on the left. Ignored if `left` is given. */
  back?: boolean;
  border?: boolean;
}) {
  const router = useRouter();
  const [hidden, setHidden] = React.useState(false);
  const lastY = React.useRef(0);

  React.useEffect(() => {
    lastY.current = window.scrollY;

    function onScroll() {
      const y = window.scrollY;
      const delta = y - lastY.current;

      // Ignore the rubber-band overscroll at the top, and ignore twitches:
      // a header that flickers on every 2px of movement feels broken.
      if (y < 64) {
        setHidden(false);
      } else if (Math.abs(delta) > 6) {
        setHidden(delta > 0);
      }
      lastY.current = y;
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-30 bg-white transition-transform duration-200 ease-out",
        border && "border-b border-ink-300",
        hidden && "-translate-y-full",
      )}
    >
      <div className="app flex h-header items-center gap-2">
        {left ??
          (back && (
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="press -ml-2 flex size-11 items-center justify-center rounded-full text-ink-900 hover:bg-ink-050"
            >
              <ChevronLeft aria-hidden className="size-6" />
            </button>
          ))}

        {title && (
          <h1 className="min-w-0 flex-1 truncate font-display text-lg font-bold text-ink-900">
            {title}
          </h1>
        )}

        {right && <div className="ml-auto flex shrink-0 items-center gap-1">{right}</div>}
      </div>
    </header>
  );
}
