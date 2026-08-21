"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";

/**
 * Writes the query into the URL rather than holding results in client state,
 * so the search screen keeps using the same server-rendered listing path as
 * every other browse surface — same filters, same sort, same ranking.
 */
export function SearchField({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [value, setValue] = React.useState(initialQuery);
  const first = React.useRef(true);

  React.useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    const timer = window.setTimeout(() => {
      const next = new URLSearchParams(params.toString());
      if (value.trim()) next.set("q", value.trim());
      else next.delete("q");
      next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    }, 220);
    return () => window.clearTimeout(timer);
    // params is intentionally excluded: including it re-fires the effect on
    // every URL write and the field fights itself.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, pathname, router]);

  return (
    <div className="flex h-11 w-full items-center gap-2 rounded-pill bg-ink-050 px-4 focus-within:ring-2 focus-within:ring-blue-500">
      <Search aria-hidden className="size-[18px] shrink-0 text-ink-600" />
      <label htmlFor="search-field" className="sr-only">
        Search organizations or causes
      </label>
      <input
        id="search-field"
        type="search"
        autoComplete="off"
        autoFocus={!initialQuery}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Organization, city or EIN"
        className="h-full w-full bg-transparent text-base outline-none placeholder:text-ink-600 [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          aria-label="Clear search"
          className="press tap44 -mr-2 flex size-8 shrink-0 items-center justify-center rounded-full text-ink-600"
        >
          <X aria-hidden className="size-4" />
        </button>
      )}
    </div>
  );
}
