"use client";

import { GiftFormSheet } from "./giving/gift-form";
import type { PaymentMethodType } from "@/lib/types";

/** Thin adapter kept so the payment card can stay unaware of the sheet's shape. */
export function LogGiftDialog({
  open,
  onClose,
  orgSlug,
  orgName,
  ein,
  campaignId,
  defaultMethod,
}: {
  open: boolean;
  onClose: () => void;
  orgSlug: string;
  orgName: string;
  ein?: string | null;
  campaignId?: string | null;
  defaultMethod?: PaymentMethodType | null;
}) {
  return (
    <GiftFormSheet
      open={open}
      onClose={onClose}
      fixedOrg={{ slug: orgSlug, name: orgName, ein }}
      campaignId={campaignId}
      defaultMethod={defaultMethod}
    />
  );
}
