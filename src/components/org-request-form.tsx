"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import type { Organization } from "@/lib/types";
import { cn } from "@/lib/cn";

type Kind = "claim" | "removal" | "abuse";

interface Hit {
  slug: string;
  name: string;
  city: string;
}

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!domain) return "•••";
  return `${user.slice(0, 1)}${"•".repeat(Math.max(2, user.length - 1))}@${domain}`;
}

function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  return `••• ••• ${digits.slice(-4)}`;
}

/**
 * One form for the three requests an outsider can make about a listing:
 * claim it, ask for its removal, or report a problem with it. Every listing
 * carries all three paths, because publishing public records about someone
 * without an easy way to correct or remove them is how a directory earns its
 * reputation the wrong way.
 */
export function OrgRequestForm({
  kind,
  initialOrgSlug,
}: {
  kind: Kind;
  initialOrgSlug?: string;
}) {
  const [org, setOrg] = React.useState<Organization | null>(null);
  const [query, setQuery] = React.useState("");
  const [hits, setHits] = React.useState<Hit[]>([]);
  const [method, setMethod] = React.useState<"email" | "phone" | "domain">("email");
  const [email, setEmail] = React.useState("");
  const [name, setName] = React.useState("");
  const [role, setRole] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState(false);
  const [done, setDone] = React.useState<{ id: string; note: string } | null>(null);

  const loadOrg = React.useCallback(async (slug: string) => {
    const res = await fetch(`/api/orgs?slugs=${encodeURIComponent(slug)}`);
    const data = (await res.json()) as { organizations: Organization[] };
    if (data.organizations[0]) setOrg(data.organizations[0]);
  }, []);

  React.useEffect(() => {
    if (initialOrgSlug) void loadOrg(initialOrgSlug);
  }, [initialOrgSlug, loadOrg]);

  React.useEffect(() => {
    if (org || query.trim().length < 2) {
      setHits([]);
      return;
    }
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`, {
          signal: controller.signal,
        });
        const data = (await res.json()) as { results: Hit[] };
        setHits(data.results);
      } catch {
        /* aborted */
      }
    }, 160);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query, org]);

  const available: { key: "email" | "phone" | "domain"; label: string; detail: string }[] = [];
  if (org?.email) {
    available.push({
      key: "email",
      label: "Email on file",
      detail: `A code to ${maskEmail(org.email)}`,
    });
  }
  if (org?.phone) {
    available.push({
      key: "phone",
      label: "Phone on file",
      detail: `A code by text to ${maskPhone(org.phone)}`,
    });
  }
  if (org?.website) {
    available.push({
      key: "domain",
      label: "Domain control",
      detail: `A DNS record or a file on ${new URL(org.website).hostname}`,
    });
  }

  React.useEffect(() => {
    if (available.length > 0 && !available.some((a) => a.key === method)) {
      setMethod(available[0].key);
    }
  }, [available, method]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!org) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind,
          orgSlug: org.slug,
          email,
          name: name || undefined,
          role: role || undefined,
          reason: reason || undefined,
          method: kind === "claim" ? method : undefined,
        }),
      });
      const data = (await res.json()) as { id?: string; note?: string; error?: string };
      if (!res.ok) {
        setError(data.error ?? "Something went wrong. Try again.");
      } else {
        setDone({ id: data.id ?? "", note: data.note ?? "" });
      }
    } catch {
      setError("Could not reach the server. Try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-card border border-ink-300 bg-white p-5">
        <div className="flex items-start gap-3">
          <CheckCircle2 aria-hidden className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <h2 className="font-display text-lg font-bold text-ink-900">Request received</h2>
            <p className="tabular mt-1 text-sm text-ink-600">
              Reference <span className="font-semibold text-ink-900">{done.id}</span>
            </p>
            <p className="mt-3 rounded-card bg-ink-050 p-3 text-sm text-ink-600">{done.note}</p>
            <p className="mt-3 text-sm text-ink-600">
              Requests are reviewed by hand in the{" "}
              <Link href="/admin" className="font-semibold text-blue-700 underline">
                admin queue
              </Link>
              . Removal requests are honored quickly and without argument.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">Organization</span>
          {org ? (
            <div className="flex items-center justify-between gap-3 rounded-card border border-blue-700 bg-blue-050 px-4 py-3">
              <span>
                <span className="block font-semibold text-ink-900">
                  {org.dba ?? org.legalName}
                </span>
                <span className="block text-sm text-ink-600">
                  {[org.city, org.region].filter(Boolean).join(", ")}
                </span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setOrg(null);
                  setQuery("");
                }}
                className="text-sm font-semibold text-blue-700 underline underline-offset-2"
              >
                Change
              </button>
            </div>
          ) : (
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, city or EIN"
              className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
            />
          )}
        </label>

        {hits.length > 0 && !org && (
          <ul className="mt-2 overflow-hidden rounded-card border border-ink-300">
            {hits.map((hit) => (
              <li key={hit.slug}>
                <button
                  type="button"
                  onClick={() => void loadOrg(hit.slug)}
                  className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left text-sm hover:bg-ink-050"
                >
                  <span className="font-semibold text-ink-900">{hit.name}</span>
                  <span className="text-xs text-ink-600">{hit.city}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {kind === "claim" && org && (
        <fieldset>
          <legend className="mb-2 text-sm font-semibold text-ink-900">
            How will you prove you represent this organization?
          </legend>
          {available.length === 0 ? (
            <p className="rounded-card bg-ink-050 p-3 text-sm text-ink-600">
              This listing has no contact details on its public record, so there is nothing we can
              send a code to. Submit the form and a person will work it out with you — expect to be
              asked for something on the organization&rsquo;s letterhead.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {available.map((option) => (
                  <button
                    key={option.key}
                    type="button"
                    aria-pressed={method === option.key}
                    onClick={() => setMethod(option.key)}
                    className={cn(
                      "press flex h-11 items-center rounded-pill border px-4 text-sm font-semibold",
                      method === option.key
                        ? "border-blue-700 bg-blue-050 text-blue-900"
                        : "border-ink-300 bg-white text-ink-900",
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
              <p className="mt-2 text-sm text-ink-600">
                {available.find((a) => a.key === method)?.detail}
              </p>
            </>
          )}
        </fieldset>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">Your name</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={120}
            className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">Your email</span>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={200}
            className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
          />
        </label>
      </div>

      {kind === "claim" && (
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-ink-900">
            Your role at the organization
          </span>
          <input
            type="text"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            maxLength={120}
            placeholder="Director, gabbai, board member…"
            className="h-12 w-full rounded-card border border-ink-300 px-3 text-base outline-none focus:border-blue-500"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-ink-900">
          {kind === "removal"
            ? "Why should this listing be removed?"
            : kind === "abuse"
              ? "What is wrong with this listing?"
              : "Anything else we should know"}
          {kind === "claim" && <span className="font-normal text-ink-600"> (optional)</span>}
        </span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          required={kind !== "claim"}
          rows={4}
          maxLength={2000}
          className="w-full rounded-card border border-ink-300 p-3 text-base outline-none focus:border-blue-500"
        />
      </label>

      {error && (
        <p role="alert" className="rounded-card bg-red-50 p-3 text-sm text-danger">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={!org || busy || !email}
        className="press h-13 w-full rounded-card bg-blue-700 py-4 font-semibold text-white disabled:opacity-45"
      >
        {busy ? "Sending…" : "Submit request"}
      </button>
    </form>
  );
}
