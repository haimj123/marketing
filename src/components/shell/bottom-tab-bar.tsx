"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  HandHeart,
  House,
  LayoutGrid,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useDonor } from "@/lib/donor-store";
import { cn } from "@/lib/cn";

interface Tab {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Routes that should also light this tab up. */
  match?: string[];
}

const TABS: Tab[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/categories", label: "Categories", icon: LayoutGrid, match: ["/c/"] },
  { href: "/search", label: "Search", icon: Search },
  { href: "/giving-list", label: "Giving", icon: HandHeart },
  {
    href: "/account",
    label: "Account",
    icon: UserRound,
    match: ["/maaser", "/history", "/favorites"],
  },
];

/**
 * Fixed, 56px, five tabs, 24px glyph over a 10px label.
 *
 * Lucide ships outline icons only. Rather than hand-draw filled twins, the
 * active tab fills the glyph with --blue-050 under a --blue-700 stroke: it
 * reads as filled at 24px and keeps one icon set.
 *
 * Icon choice is constrained by that trick. `CircleUserRound` fills into a
 * blank disc — its enclosing circle paints over the person inside — so the
 * Account tab uses `UserRound`, which has no enclosing circle and fills into a
 * clean silhouette. Check any future icon swap filled, not just outlined.
 */
export function BottomTabBar() {
  const pathname = usePathname();
  const { givingList, ready } = useDonor();
  const pending = givingList.filter((i) => i.status === "pending").length;

  function isActive(tab: Tab): boolean {
    if (tab.href === "/") return pathname === "/";
    if (pathname.startsWith(tab.href)) return true;
    return tab.match?.some((prefix) => pathname.startsWith(prefix)) ?? false;
  }

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-ink-300 bg-white pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex h-tabbar max-w-app items-stretch">
        {TABS.map((tab) => {
          const active = isActive(tab);
          const Icon = tab.icon;
          const badge = tab.href === "/giving-list" && ready && pending > 0;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={tab.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "press relative flex h-full flex-col items-center justify-center gap-1",
                  active ? "text-blue-700" : "text-ink-600",
                )}
              >
                <span className="relative">
                  <Icon
                    aria-hidden
                    className="size-6"
                    strokeWidth={active ? 2.2 : 1.8}
                    fill={active ? "var(--color-blue-050)" : "none"}
                  />
                  {badge && (
                    <span className="tabular absolute -right-2 -top-1 flex min-w-4 items-center justify-center rounded-full bg-blue-700 px-1 text-[10px] font-bold leading-4 text-white">
                      {pending}
                    </span>
                  )}
                </span>
                <span className={cn("text-2xs", active ? "font-bold" : "font-semibold")}>
                  {tab.label}
                </span>
                {badge && (
                  <span className="sr-only">
                    , {pending} {pending === 1 ? "organization" : "organizations"} waiting
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
