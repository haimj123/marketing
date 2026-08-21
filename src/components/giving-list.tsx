"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Check, SkipForward, Trash2 } from "lucide-react";
import { Button, ButtonLink } from "./ui/button";
import { Card } from "./ui/card";
import { CopyButton } from "./ui/copy-button";
import { EmptyState } from "./ui/empty-state";
import { useToast } from "./ui/toast";
import { Markdown } from "@/lib/markdown";
import { useDonor } from "@/lib/donor-store";
import { PAYMENT_LABEL, formatCents, paymentDeepLink } from "@/lib/format";
import type { GivingListItem, Organization } from "@/lib/types";

/**
 * The guided give-through. With no checkout, a multi-organization list can't
 * be paid in one action — so it becomes a queue the donor walks: one
 * organization on screen at a time, handle copied, app opened, come back,
 * mark it given, advance. Each "Given" writes straight to the maaser ledger.
 *
 * This is the honest shape for the constraint, and it is a better fit for
 * tzedaka than a cart was ever going to be: the donor sees each organization
 * on its own, one decision at a time.
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
  const [index, setIndex] = React.useState(0);

  const pending = React.useMemo(
    () => givingList.filter((i) => i.status === "pending"),
    [givingList],
  );
  const done = React.useMemo(
    () => givingList.filter((i) => i.status !== "pending"),
    [givingList],
  );

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
      if (cancelled) return;
      setOrgs(Object.fromEntries(data.organizations.map((o) => [o.slug, o])));
    })();
    return () => {
      cancelled = true;
    };
  }, [slugs]);

  if (!ready) return <div className="h-48 animate-pulse rounded-card bg-ink-050" aria-hidden />;

  if (givingList.length === 0) {
    return (
      <EmptyState
        title="Your giving list is empty"
        body="Add a few organizations as you browse, then walk the list one at a time. Nothing is charged — the list is a queue for you, not a pledge to anyone."
        action={<ButtonLink href="/">Browse categories</ButtonLink>}
      />
    );
  }

  const total = pending.reduce((sum, i) => sum + i.amountCents, 0);

  if (running && pending.length > 0) {
    const item = pending[Math.min(index, pending.length - 1)];
    const org = orgs[item.orgSlug];

    return (
      <GiveThroughStep
        item={item}
        org={org}
        position={Math.min(index, pending.length - 1) + 1}
        total={pending.length}
        onGiven={() => {
          logGift({
            orgSlug: item.orgSlug,
            orgName: item.orgName,
            ein: org?.ein ?? null,
            campaignId: item.campaignId ?? null,
            amountCents: item.amountCents,
            currency: "USD",
            givenAt: new Date().toISOString(),
            paymentMethodType: org?.paymentMethods[0]?.type ?? null,
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
        onStop={() => setRunning(false)}
      />
    );
  }

  return (
    <div className="space-y-8">
      {pending.length > 0 && (
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">
              {pending.length} to give
              <span className="tabular ml-2 font-normal text-ink-600">
                {formatCents(total)} intended
              </span>
            </h2>
            <Button
              size="lg"
              onClick={() => {
                setIndex(0);
                setRunning(true);
              }}
            >
              Start giving
              <ArrowRight aria-hidden className="size-4" />
            </Button>
          </div>

          <ul className="space-y-3">
            {pending.map((item) => (
              <li key={item.id}>
                <Card className="flex flex-wrap items-center gap-4 p-4">
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/org/${item.orgSlug}`}
                      className="block truncate font-semibold text-ink-900 hover:underline"
                    >
                      {item.orgName}
                    </Link>
                    {item.campaignTitle && (
                      <span className="block truncate text-sm text-ink-600">
                        {item.campaignTitle}
                      </span>
                    )}
                  </div>

                  <label className="flex items-center gap-2">
                    <span className="sr-only">Intended amount for {item.orgName}</span>
                    <div className="flex h-10 w-28 items-center rounded-card border border-ink-300 px-2 focus-within:border-blue-500">
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
                    className="rounded-card p-2 text-ink-600 hover:bg-ink-050 hover:text-danger"
                  >
                    <Trash2 aria-hidden className="size-4" />
                  </button>
                </Card>
              </li>
            ))}
          </ul>
        </section>
      )}

      {done.length > 0 && (
        <section>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="font-display text-lg font-bold text-ink-900">Finished</h2>
            <button
              type="button"
              onClick={clearCompletedGivingList}
              className="text-sm font-semibold text-blue-700 underline underline-offset-2"
            >
              Clear
            </button>
          </div>
          <ul className="divide-y divide-ink-050 border-y border-ink-050">
            {done.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-4 py-3">
                <span className="min-w-0 truncate text-ink-900">{item.orgName}</span>
                <span
                  className={
                    item.status === "given"
                      ? "tabular text-sm font-semibold text-success"
                      : "text-sm text-ink-600"
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
  const methods = org
    ? [...org.paymentMethods].sort(
        (a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder,
      )
    : [];

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="tabular text-sm font-semibold text-ink-600">
          {position} of {total}
        </p>
        <button
          type="button"
          onClick={onStop}
          className="text-sm font-semibold text-blue-700 underline underline-offset-2"
        >
          Back to the list
        </button>
      </div>

      <div className="h-1.5 w-full overflow-hidden rounded-full bg-ink-050">
        <div
          className="h-full rounded-full bg-blue-700 transition-[width]"
          style={{ width: `${((position - 1) / total) * 100}%` }}
        />
      </div>

      <Card className="mt-6 p-6">
        <h2 className="font-display text-2xl font-extrabold text-ink-900">{item.orgName}</h2>
        {item.campaignTitle && <p className="mt-1 text-ink-600">{item.campaignTitle}</p>}
        <p className="tabular mt-4 font-display text-3xl font-extrabold text-blue-700">
          {formatCents(item.amountCents)}
        </p>

        {methods.length === 0 ? (
          <p className="mt-4 text-sm text-ink-600">
            This listing has no payment details on file. Open{" "}
            <Link href={`/org/${item.orgSlug}`} className="font-semibold text-blue-700 underline">
              its profile
            </Link>{" "}
            for what we do know.
          </p>
        ) : (
          <div className="mt-6 space-y-3">
            {methods.slice(0, 3).map((method) => {
              const deepLink = method.externalUrl ?? paymentDeepLink(method.type, method.handle);
              return (
                <div key={method.id} className="rounded-card border border-ink-300 p-4">
                  <p className="text-sm font-semibold text-ink-900">{method.displayName}</p>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <code className="min-w-0 flex-1 truncate rounded-card bg-ink-050 px-3 py-2.5 font-mono text-sm">
                      {method.handle}
                    </code>
                    <CopyButton value={method.handle} label="Copy" />
                    {deepLink && (
                      <a
                        href={deepLink}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="inline-flex h-10 items-center rounded-card bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-900"
                      >
                        Open {PAYMENT_LABEL[method.type]}
                      </a>
                    )}
                  </div>
                  {method.instructionsMd && (
                    <Markdown
                      source={method.instructionsMd}
                      className="mt-2 text-sm text-ink-600"
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button size="lg" onClick={onGiven}>
            <Check aria-hidden className="size-4" />
            I gave {formatCents(item.amountCents)}
          </Button>
          <Button size="lg" variant="secondary" onClick={onSkip}>
            <SkipForward aria-hidden className="size-4" />
            Skip for now
          </Button>
        </div>
        <p className="mt-3 text-xs text-ink-600">
          Marking it given logs it to your maaser ledger. It does not notify the organization —
          they will see the money arrive in their own account.
        </p>
      </Card>
    </div>
  );
}
