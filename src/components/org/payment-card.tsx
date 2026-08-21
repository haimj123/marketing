"use client";

import * as React from "react";
import { Check, Copy, ExternalLink, Landmark, Mail, Smartphone } from "lucide-react";
import { LogGiftDialog } from "../log-gift-dialog";
import { useToast } from "../ui/toast";
import { Markdown } from "@/lib/markdown";
import { PAYMENT_LABEL, paymentDeepLink } from "@/lib/format";
import type { Department, Organization, PaymentMethod } from "@/lib/types";

const ICON = {
  zelle: Smartphone,
  quickpay: Smartphone,
  paypal: ExternalLink,
  venmo: ExternalLink,
  check: Mail,
  wire: Landmark,
  external: ExternalLink,
} as const;

/**
 * The handoff — where the delivery-app analogy stops and the product either
 * feels deliberate or feels abandoned.
 *
 * So the handle is large and copyable, the deep link is one tap where the
 * network supports one, and "I gave" appears the moment you copy. People come
 * back to the tab they left open; finding nothing waiting is what makes a
 * handoff feel like being dropped.
 */
export function PaymentMethods({
  org,
  departments,
  filterDepartmentId,
}: {
  org: Organization;
  departments: Department[];
  filterDepartmentId?: string | null;
}) {
  const [logging, setLogging] = React.useState<PaymentMethod | null>(null);
  const [copied, setCopied] = React.useState<string | null>(null);
  const toast = useToast();

  const methods = [...org.paymentMethods]
    .filter((m) => !filterDepartmentId || m.departmentId === filterDepartmentId || !m.departmentId)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder);

  if (methods.length === 0) return null;

  async function copy(method: PaymentMethod) {
    try {
      await navigator.clipboard.writeText(method.handle);
    } catch {
      window.prompt("Copy this:", method.handle);
    }
    setCopied(method.id);
    toast(`${PAYMENT_LABEL[method.type]} handle copied`, "success");
  }

  const deptName = (id?: string | null) =>
    id ? departments.find((d) => d.id === id)?.name : undefined;

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const Icon = ICON[method.type];
        const deepLink = method.externalUrl ?? paymentDeepLink(method.type, method.handle);
        const routedTo = deptName(method.departmentId);
        const justCopied = copied === method.id;

        return (
          <div key={method.id} className="rounded-card border border-ink-300 bg-white p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Icon aria-hidden className="size-4 text-blue-700" />
              <h3 className="font-semibold text-ink-900">{method.displayName}</h3>
              {method.isPrimary && (
                <span className="rounded-pill bg-blue-050 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Preferred
                </span>
              )}
              {routedTo && (
                <span className="rounded-pill bg-ink-050 px-2 py-0.5 text-xs font-semibold text-ink-600">
                  Goes to {routedTo}
                </span>
              )}
            </div>

            <div className="mt-3 flex items-center gap-2">
              <code className="tabular min-w-0 flex-1 truncate rounded-card bg-ink-050 px-3 py-3 font-mono text-sm text-ink-900">
                {method.handle}
              </code>
              <button
                type="button"
                onClick={() => copy(method)}
                className="press flex h-11 shrink-0 items-center gap-1.5 rounded-card border border-ink-300 px-3 text-sm font-semibold text-blue-700"
              >
                {justCopied ? (
                  <Check aria-hidden className="size-4 text-success" />
                ) : (
                  <Copy aria-hidden className="size-4" />
                )}
                {justCopied ? "Copied" : "Copy"}
                <span className="sr-only">{method.displayName}</span>
              </button>
            </div>

            {method.instructionsMd && (
              <Markdown source={method.instructionsMd} className="mt-3 text-sm text-ink-600" />
            )}

            <div className="mt-3 flex flex-col gap-2">
              {deepLink && (
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="press flex h-12 items-center justify-center gap-2 rounded-card border border-ink-300 font-semibold text-blue-700"
                >
                  Open {PAYMENT_LABEL[method.type]}
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              )}

              {/* Only after copying — before that there is nothing to confirm. */}
              {justCopied && (
                <button
                  type="button"
                  onClick={() => setLogging(method)}
                  className="press h-12 w-full rounded-card bg-blue-700 font-semibold text-white"
                >
                  I gave
                </button>
              )}
            </div>
          </div>
        );
      })}

      <p className="text-xs leading-relaxed text-ink-600">
        Payment details are supplied by the organization. Shaare Tzadaka never receives, holds or
        forwards your money — you are paying the organization directly through its own account.
        Check the handle against the organization&rsquo;s own website before sending anything
        large.
      </p>

      <LogGiftDialog
        open={logging !== null}
        onClose={() => setLogging(null)}
        orgSlug={org.slug}
        orgName={org.dba ?? org.legalName}
        ein={org.ein}
        defaultMethod={logging?.type ?? null}
      />
    </div>
  );
}
