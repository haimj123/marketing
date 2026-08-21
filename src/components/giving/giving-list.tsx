"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, Copy, ListChecks, SkipForward, Trash2 } from "lucide-react";
import { ButtonLink } from "../ui/button";
import { EmptyState } from "../ui/empty-state";
import { useToast } from "../ui/toast";
import { Markdown } from "@/lib/markdown";
import { useDonor } from "@/lib/donor-store";
import { PAYMENT_LABEL, formatCents, paymentDeepLink } from "@/lib/format";
import type { GivingListItem, Organization } from "@/lib/types";

/**
 * The guided give-through. With no checkout, a multi-organization list cannot
 * be paid in one action — so it becomes a queue the donor walks: one
 * organization on screen, handle copied, app opened, come back, mark it given,
 * advance. Each "I gave" writes straight to the maaser ledger.
 *
 * This is a better fit for tzedaka than a cart was ever going to be: the donor
 * sees each organization on its own, one decision at a time.
 */
export function GivingList() {
  const {
    givingList,
    ready,
    removeFromGivingList,
    markGivingListItem,
    setGivingListAmount,
    clearCompletedGivingList,
    logGift,
  } = useDonor();
  const toast = useToast();

  const [orgs, setOrgs] = React.useState<Record<string, Organization>>({});
  const [running, setRunning] = React.useState(false);

  const pending = React.useMemo(
    () => givingList.filter((i) => i.status === "pending"),
    [givingList],
  );
  const done = React.useMemo(() => givingList.filter((i) => i.status !== "pending"), [givingList]);
  const slugs = React.useMemo(
    () => [...new Set(givingList.map((i) => i.orgSlug))].sort().join(","),
    [givingList],
  );

  React.useEffect(() => {
    if (!slugs) return;
    let cancelled = false;
    void (async () => {
      const res = await fetch(`/api/orgs?slugs=${encodeURIComponent(slugs)}`);
      const data = (await res.json()) as { organizations: Organization[] };
      if (!cancelled) setOrgs(Object.fromEntries(data.organizations.map((o) => [o.slug, o])));
    })();
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  if (!ready) {
    return <div className="skeleton mx-4 h-40 rounded-card" aria-hidden />;
  }

  if (givingList.length === 0) {
    return (
      <EmptyState
        icon={<ListChecks aria-hidden className="size-7" strokeWidth={1.5} />}
        title="Your giving list is empty"
        body="Add organizations as you browse, then walk the list one at a time. Nothing is charged — it is a queue for you, not a pledge to anyone."
        action={<ButtonLink href="/categories">Browse categories</ButtonLink>}
      />
    );
  }

  const total = pending.reduce((sum, i) => sum + i.amountCents, 0);

  if (running && pending.length > 0) {
    const item = pending[0];
    return (
      <GiveThroughStep
        item={item}
        org={orgs[item.orgSlug]}
        position={givingList.filter((i) => i.status !== "pending").length + 1}
        total={givingList.length}
        onStop={() => setRunning(false)}
        onGiven={() => {
          logGift({
            orgSlug: item.orgSlug,
            orgName: item.orgName,
            ein: orgs[item.orgSlug]?.ein ?? null,
            campaignId: item.campaignId ?? null,
            amountCents: item.amountCents,
            currency: "USD",
            givenAt: new Date().toISOString(),
            paymentMethodType: orgs[item.orgSlug]?.paymentMethods[0]?.type ?? null,
            note: item.campaignTitle ?? undefined,
          });
          markGivingListItem(item.id, "given");
          toast(`${formatCents(item.amountCents)} logged to ${item.orgName}`, "success");
          if (pending.length <= 1) setRunning(false);
        }}
        onSkip={() => {
          markGivingListItem(item.id, "skipped");
          if (pending.length <= 1) setRunning(false);
        }}
      />
    );
  }

  return (
    <div className="app pb-6">
      {pending.length > 0 && (
        <section className="pt-4">
          <p className="tabular text-sm text-ink-600">
            {pending.length} to give ·{" "}
            <span className="font-semibold text-ink-900">{formatCents(total)}</span> intended
          </p>

          <ul className="mt-3 divide-y divide-ink-300 border-y border-ink-300">
            {pending.map((item) => (
              <li key={item.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/org/${item.orgSlug}`}
                    className="press block truncate font-semibold text-ink-900"
                  >
                    {item.orgName}
                  </Link>
                  {item.campaignTitle && (
                    <span className="block truncate text-sm text-ink-600">
                      {item.campaignTitle}
                    </span>
                  )}
                </div>

                <label className="shrink-0">
                  <span className="sr-only">Intended amount for {item.orgName}</span>
                  <div className="flex h-11 w-24 items-center rounded-card border border-ink-300 px-2 focus-within:border-blue-500">
                    <span className="text-ink-600">$</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      defaultValue={(item.amountCents / 100).toString()}
                      onBlur={(e) => {
                        const cents = Math.round(
                          Number(e.target.value.replace(/[^0-9.]/g, "")) * 100,
                        );
                        if (cents > 0) setGivingListAmount(item.id, cents);
                      }}
                      className="tabular h-full w-full bg-transparent text-sm outline-none"
                    />
                  </div>
                </label>

                <button
                  type="button"
                  onClick={() => removeFromGivingList(item.id)}
                  aria-label={`Remove ${item.orgName} from giving list`}
                  className="press flex size-11 shrink-0 items-center justify-center rounded-full text-ink-600"
                >
                  <Trash2 aria-hidden className="size-4" />
                </button>
              </li>
            ))}
          </ul>

          <button
            type="button"
            onClick={() => setRunning(true)}
            className="press mt-4 flex h-13 w-full items-center justify-center gap-2 rounded-card bg-blue-700 py-4 font-semibold text-white"
          >
            Start giving
            <ArrowRight aria-hidden className="size-4" />
          </button>
        </section>
      )}

      {done.length > 0 && (
        <section className="pt-8">
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-display text-xl font-bold text-ink-900">Finished</h2>
            <button
              type="button"
              onClick={clearCompletedGivingList}
              className="press min-h-11 px-1 text-sm font-semibold text-blue-700"
            >
              Clear
            </button>
          </div>
          <ul className="mt-2 divide-y divide-ink-300 border-y border-ink-300">
            {done.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0 truncate text-ink-900">{item.orgName}</span>
                <span
                  className={
                    item.status === "given"
                      ? "tabular shrink-0 text-sm font-semibold text-success"
                      : "shrink-0 text-sm text-ink-600"
                  }
                >
                  {item.status === "given" ? formatCents(item.amountCents) : "Skipped"}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

function GiveThroughStep({
  item,
  org,
  position,
  total,
  onGiven,
  onSkip,
  onStop,
}: {
  item: GivingListItem;
  org?: Organization;
  position: number;
  total: number;
  onGiven: () => void;
  onSkip: () => void;
  onStop: () => void;
}) {
  const toast = useToast();
  const [copied, setCopied] = React.useState<string | null>(null);

  const methods = org
    ? [...org.paymentMethods].sort(
        (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
      )
    : [];

  async function copy(handle: string, id: string, label: string) {
    try {
      await navigator.clipboard.writeText(handle);
    } catch {
      window.prompt("Copy this:", handle);
    }
    setCopied(id);
    toast(`${label} handle copied`, "success");
  }

  return (
    <div className="app pb-6">
      <div className="flex items-center justify-between gap-3 py-3">
        <p className="tabular text-sm font-semibold text-ink-600">
          {position} of {total}
        </p>
        <button type="button" onClick={onStop} className="press min-h-11 px-1 text-sm font-semibold text-blue-700">
          Back to the list
        </button>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-pill bg-ink-050">
        <div
          className="h-full rounded-pill bg-blue-700 transition-[width]"
          style={{ width: `${((position - 1) / total) * 100}%` }}
        />
      </div>

      <h2 className="mt-5 font-display text-2xl font-extrabold leading-tight tracking-tight text-ink-900">
        {item.orgName}
      </h2>
      {item.campaignTitle && <p className="mt-1 text-ink-600">{item.campaignTitle}</p>}
      <p className="tabular mt-3 font-display text-3xl font-extrabold text-blue-700">
        {formatCents(item.amountCents)}
      </p>

      {methods.length === 0 ? (
        <p className="mt-4 rounded-card bg-ink-050 p-4 text-sm text-ink-600">
          This listing has no payment details on file. Open{" "}
          <Link href={`/org/${item.orgSlug}`} className="font-semibold text-blue-700 underline">
            its profile
          </Link>{" "}
          for what we do know.
        </p>
      ) : (
        <div className="mt-5 space-y-3">
          {methods.slice(0, 3).map((method) => {
            const deepLink = method.externalUrl ?? paymentDeepLink(method.type, method.handle);
            return (
              <div key={method.id} className="rounded-card border border-ink-300 p-4">
                <p className="text-sm font-semibold text-ink-900">{method.displayName}</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="tabular min-w-0 flex-1 truncate rounded-card bg-ink-050 px-3 py-3 font-mono text-sm">
                    {method.handle}
                  </code>
                  <button
                    type="button"
                    onClick={() => copy(method.handle, method.id, PAYMENT_LABEL[method.type])}
                    className="press flex h-11 shrink-0 items-center gap-1.5 rounded-card border border-ink-300 px-3 text-sm font-semibold text-blue-700"
                  >
                    {copied === method.id ? (
                      <Check aria-hidden className="size-4 text-success" />
                    ) : (
                      <Copy aria-hidden className="size-4" />
                    )}
                    {copied === method.id ? "Copied" : "Copy"}
                  </button>
                </div>
                {method.instructionsMd && (
                  <Markdown source={method.instructionsMd} className="mt-2 text-sm text-ink-600" />
                )}
                {deepLink && (
                  <a
                    href={deepLink}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="press mt-3 flex h-12 items-center justify-center rounded-card border border-ink-300 font-semibold text-blue-700"
                  >
                    Open {PAYMENT_LABEL[method.type]}
                  </a>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-5 space-y-2">
        <button
          type="button"
          onClick={onGiven}
          className="press flex h-13 w-full items-center justify-center gap-2 rounded-card bg-blue-700 py-4 font-semibold text-white"
        >
          <Check aria-hidden className="size-4" />I gave {formatCents(item.amountCents)}
        </button>
        <button
          type="button"
          onClick={onSkip}
          className="press flex h-12 w-full items-center justify-center gap-2 rounded-card border border-ink-300 font-semibold text-ink-900"
        >
          <SkipForward aria-hidden className="size-4" />
          Skip for now
        </button>
      </div>

      <p className="mt-3 text-xs leading-relaxed text-ink-600">
        Marking it given logs it to your maaser ledger. It does not notify the organization — they
        will see the money arrive in their own account.
      </p>
    </div>
  );
}
