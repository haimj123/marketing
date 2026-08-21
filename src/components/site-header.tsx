import Image from "next/image";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { SearchBox } from "./search-box";
import { GivingListBadge } from "./giving-list-badge";

/** 64px, white, 1px bottom border. Wordmark left, search centre, account right. */
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-ink-300 bg-white print:hidden">
      <div className="page flex h-16 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <Image
            src="/logo.png"
            alt=""
            width={40}
            height={40}
            priority
            className="size-9 object-contain"
          />
          <span className="font-display text-lg font-extrabold tracking-tight text-brand-900">
            Shaare <span className="text-brand-700">Tzadaka</span>
          </span>
        </Link>

        <div className="mx-auto hidden w-full max-w-lg md:block">
          <SearchBox />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-1 md:ml-0">
          <GivingListBadge />
          <Link
            href="/maaser"
            className="inline-flex h-10 items-center gap-2 rounded-[8px] px-3 text-sm font-semibold text-ink-900 hover:bg-ink-050"
          >
            <CircleUserRound aria-hidden className="size-5" />
            <span className="hidden sm:inline">Maaser</span>
          </Link>
        </div>
      </div>

      <div className="page pb-3 md:hidden">
        <SearchBox />
      </div>
    </header>
  );
}
