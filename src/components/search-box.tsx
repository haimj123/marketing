"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search } from "lucide-react";
import { VerificationBadge } from "./verification-badge";
import type { VerificationLevel } from "@/lib/types";
import { cn } from "@/lib/cn";

interface Hit {
  slug: string;
  name: string;
  city: string;
  verificationLevel: VerificationLevel;
  claimStatus: string;
}

export function SearchBox({
  placeholder = "Search organizations, cities or EINs",
  autoFocus,
  className,
  initialQuery = "",
}: {
  placeholder?: string;
  autoFocus?: boolean;
  className?: string;
  initialQuery?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = React.useState(initialQuery);
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(-1);
  const boxRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const q = query.trim();
    if (q.length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results: Hit[] };
        setHits(data.results);
        setActive(-1);
      } catch {
        /* aborted */
      }
    }, 140);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  React.useEffect(() => {
    function onClick(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (active >= 0 && hits[active]) {
      router.push(`/org/${hits[active].slug}`);
    } else if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, hits.length - 1));
      setOpen(true);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, -1));
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  const showList = open && hits.length > 0;

  return (
    <div ref={boxRef} className={cn("relative w-full", className)}>
      <form onSubmit={submit} role="search">
        <label htmlFor="site-search" className="sr-only">
          Search organizations
        </label>
        <div className="flex h-11 items-center gap-2 rounded-[8px] border border-ink-300 bg-ink-050 px-3 focus-within:border-brand-500 focus-within:bg-white">
          <Search aria-hidden className="size-4 shrink-0 text-ink-600" />
          <input
            id="site-search"
            type="search"
            autoComplete="off"
            autoFocus={autoFocus}
            value={query}
            placeholder={placeholder}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={onKeyDown}
            aria-expanded={showList}
            aria-controls="search-suggestions"
            aria-autocomplete="list"
            role="combobox"
            className="h-full w-full bg-transparent text-base outline-none placeholder:text-ink-600"
          />
        </div>
      </form>

      {showList && (
        <ul
          id="search-suggestions"
          role="listbox"
          className="absolute inset-x-0 top-[52px] z-40 overflow-hidden rounded-[8px] border border-ink-300 bg-white shadow-[0_8px_24px_rgba(0,0,0,.12)]"
        >
          {hits.map((hit, i) => (
            <li key={hit.slug} role="option" aria-selected={i === active}>
              <Link
                href={`/org/${hit.slug}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2.5 text-sm",
                  i === active ? "bg-brand-050" : "hover:bg-ink-050",
                )}
              >
                <span className="min-w-0">
                  <span className="block truncate font-semibold text-ink-900">{hit.name}</span>
                  {hit.city && <span className="block truncate text-xs text-ink-600">{hit.city}</span>}
                </span>
                <VerificationBadge level={hit.verificationLevel} asLink={false} />
              </Link>
            </li>
          ))}
          <li>
            <button
              type="button"
              onClick={() => {
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
                setOpen(false);
              }}
              className="w-full border-t border-ink-050 px-3 py-2.5 text-left text-sm font-semibold text-brand-700 hover:bg-ink-050"
            >
              See all results for “{query.trim()}”
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
