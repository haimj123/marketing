"use client";

import * as React from "react";
import type { Gift, GivingListItem, MaaserSettings } from "./types";

/**
 * The donor's own data — giving list, maaser ledger, favourites, income
 * settings — kept on their device.
 *
 * Accounts are M6. Until Supabase Auth is wired in, this store is the whole
 * persistence layer, and that is a deliberate order of operations: the maaser
 * tracker is the feature that earns the account, so it has to be worth using
 * before anyone is asked to create one. The shape below is the same shape the
 * `gifts`, `giving_list_items`, `favorites` and `donor_profiles` tables take,
 * so signing in later becomes an upload, not a rewrite.
 *
 * Income is the most sensitive field in the product. On device it never leaves
 * the browser; server-side it is encrypted at rest (see `donorProfiles`).
 */

const KEY = "shaare-tzadaka:donor:v1";

export interface DonorState {
  gifts: Gift[];
  givingList: GivingListItem[];
  favorites: string[];
  maaser: MaaserSettings | null;
}

const EMPTY: DonorState = { gifts: [], givingList: [], favorites: [], maaser: null };

function read(): DonorState {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<DonorState>;
    return {
      gifts: parsed.gifts ?? [],
      givingList: parsed.givingList ?? [],
      favorites: parsed.favorites ?? [],
      maaser: parsed.maaser ?? null,
    };
  } catch {
    return EMPTY;
  }
}

function write(state: DonorState) {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // Private browsing, or storage full. The session still works; nothing persists.
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `id-${Math.random().toString(36).slice(2)}-${Date.now()}`;
}

interface DonorContextValue extends DonorState {
  /** False until the first client render has read localStorage. */
  ready: boolean;
  addToGivingList: (item: Omit<GivingListItem, "id" | "addedAt" | "status">) => void;
  removeFromGivingList: (id: string) => void;
  setGivingListAmount: (id: string, amountCents: number) => void;
  markGivingListItem: (id: string, status: GivingListItem["status"]) => void;
  clearCompletedGivingList: () => void;
  logGift: (gift: Omit<Gift, "id">) => void;
  removeGift: (id: string) => void;
  toggleFavorite: (slug: string) => void;
  setMaaser: (settings: MaaserSettings | null) => void;
}

const DonorContext = React.createContext<DonorContextValue | null>(null);

export function DonorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<DonorState>(EMPTY);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    setState(read());
    setReady(true);
  }, []);

  const update = React.useCallback((fn: (prev: DonorState) => DonorState) => {
    setState((prev) => {
      const next = fn(prev);
      write(next);
      return next;
    });
  }, []);

  const value = React.useMemo<DonorContextValue>(
    () => ({
      ...state,
      ready,
      addToGivingList: (item) =>
        update((prev) => {
          const existing = prev.givingList.find(
            (i) =>
              i.orgSlug === item.orgSlug &&
              (i.campaignId ?? null) === (item.campaignId ?? null) &&
              i.status === "pending",
          );
          if (existing) {
            return {
              ...prev,
              givingList: prev.givingList.map((i) =>
                i.id === existing.id ? { ...i, amountCents: item.amountCents } : i,
              ),
            };
          }
          return {
            ...prev,
            givingList: [
              ...prev.givingList,
              { ...item, id: newId(), addedAt: new Date().toISOString(), status: "pending" },
            ],
          };
        }),
      removeFromGivingList: (id) =>
        update((prev) => ({
          ...prev,
          givingList: prev.givingList.filter((i) => i.id !== id),
        })),
      setGivingListAmount: (id, amountCents) =>
        update((prev) => ({
          ...prev,
          givingList: prev.givingList.map((i) => (i.id === id ? { ...i, amountCents } : i)),
        })),
      markGivingListItem: (id, status) =>
        update((prev) => ({
          ...prev,
          givingList: prev.givingList.map((i) => (i.id === id ? { ...i, status } : i)),
        })),
      clearCompletedGivingList: () =>
        update((prev) => ({
          ...prev,
          givingList: prev.givingList.filter((i) => i.status === "pending"),
        })),
      logGift: (gift) =>
        update((prev) => ({ ...prev, gifts: [{ ...gift, id: newId() }, ...prev.gifts] })),
      removeGift: (id) =>
        update((prev) => ({ ...prev, gifts: prev.gifts.filter((g) => g.id !== id) })),
      toggleFavorite: (slug) =>
        update((prev) => ({
          ...prev,
          favorites: prev.favorites.includes(slug)
            ? prev.favorites.filter((s) => s !== slug)
            : [...prev.favorites, slug],
        })),
      setMaaser: (settings) => update((prev) => ({ ...prev, maaser: settings })),
    }),
    [state, ready, update],
  );

  return <DonorContext.Provider value={value}>{children}</DonorContext.Provider>;
}

export function useDonor(): DonorContextValue {
  const ctx = React.useContext(DonorContext);
  if (!ctx) throw new Error("useDonor must be used inside <DonorProvider>");
  return ctx;
}

/* --------------------------------------------------------- maaser maths */

export function fiscalYearStart(settings: MaaserSettings, now = new Date()): Date {
  const [month, day] = settings.fiscalYearStart.split("-").map(Number);
  const thisYear = new Date(Date.UTC(now.getUTCFullYear(), (month || 1) - 1, day || 1));
  if (thisYear.getTime() > now.getTime()) {
    return new Date(Date.UTC(now.getUTCFullYear() - 1, (month || 1) - 1, day || 1));
  }
  return thisYear;
}

export interface MaaserSummary {
  obligationCents: number;
  givenCents: number;
  remainingCents: number;
  percentComplete: number;
  yearStart: Date;
  yearEnd: Date;
  giftsThisYear: Gift[];
}

export function summariseMaaser(
  settings: MaaserSettings,
  gifts: Gift[],
  now = new Date(),
): MaaserSummary {
  const yearStart = fiscalYearStart(settings, now);
  const yearEnd = new Date(yearStart);
  yearEnd.setUTCFullYear(yearEnd.getUTCFullYear() + 1);

  const giftsThisYear = gifts.filter((g) => {
    const t = new Date(g.givenAt).getTime();
    return t >= yearStart.getTime() && t < yearEnd.getTime();
  });

  const obligationCents = Math.round((settings.annualIncomeCents * settings.percent) / 100);
  const givenCents = giftsThisYear.reduce((sum, g) => sum + g.amountCents, 0);

  return {
    obligationCents,
    givenCents,
    remainingCents: Math.max(0, obligationCents - givenCents),
    percentComplete: obligationCents > 0 ? (givenCents / obligationCents) * 100 : 0,
    yearStart,
    yearEnd,
    giftsThisYear,
  };
}
