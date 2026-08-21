"use client";

import * as React from "react";
import { ExternalLink, Landmark, Mail, Smartphone } from "lucide-react";
import { Button } from "./ui/button";
import { CopyButton } from "./ui/copy-button";
import { LogGiftDialog } from "./log-gift-dialog";
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
 * The handoff. This is where the delivery-app analogy stops and where the
 * whole product either feels deliberate or feels abandoned.
 *
 * So: the handle is large and copyable, the deep link is one tap where the
 * network supports one, the instructions are the organization's own words,
 * and "I've sent it" is waiting when the donor comes back — because they will
 * come back to a tab they left open, and finding nothing there is what makes
 * a handoff feel like being dropped.
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

  const methods = [...org.paymentMethods]
    .filter((m) => !filterDepartmentId || m.departmentId === filterDepartmentId || !m.departmentId)
    .sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.sortOrder - b.sortOrder);

  if (methods.length === 0) return null;

  const deptName = (id?: string | null) =>
    id ? departments.find((d) => d.id === id)?.name : undefined;

  return (
    <div className="space-y-3">
      {methods.map((method) => {
        const Icon = ICON[method.type];
        const deepLink = method.externalUrl ?? paymentDeepLink(method.type, method.handle);
        const routedTo = deptName(method.departmentId);

        return (
          <div key={method.id} className="rounded-card border border-ink-300 p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Icon aria-hidden className="size-4 text-blue-700" />
              <h3 className="font-semibold text-ink-900">{method.displayName}</h3>
              {method.isPrimary && (
                <span className="rounded-full bg-blue-050 px-2 py-0.5 text-xs font-semibold text-blue-700">
                  Preferred
                </span>
              )}
              {routedTo && (
                <span className="rounded-full bg-ink-050 px-2 py-0.5 text-xs font-semibold text-ink-600">
                  Goes to {routedTo}
                </span>
              )}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-card bg-ink-050 px-3 py-2.5 font-mono text-sm text-ink-900">
                {method.handle}
              </code>
              <CopyButton value={method.handle} label={`Copy ${PAYMENT_LABEL[method.type]}`} />
            </div>

            {method.instructionsMd && (
              <Markdown source={method.instructionsMd} className="mt-3 text-sm text-ink-600" />
            )}

            <div className="mt-3 flex flex-wrap gap-2">
              {deepLink && (
                <a
                  href={deepLink}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex h-10 items-center gap-2 rounded-card bg-blue-700 px-4 text-sm font-semibold text-white hover:bg-blue-900"
                >
                  Open {PAYMENT_LABEL[method.type]}
                  <ExternalLink aria-hidden className="size-4" />
                </a>
              )}
              <Button variant="secondary" onClick={() => setLogging(method)}>
                I&rsquo;ve sent it — log the gift
              </Button>
            </div>
          </div>
        );
      })}

      <p className="text-xs text-ink-600">
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
