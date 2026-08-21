import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  CircleUserRound,
  FileText,
  Heart,
  Landmark,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { AppHeader } from "@/components/shell/app-header";

export const metadata: Metadata = {
  title: "Account",
  robots: { index: false, follow: true },
};

const GIVING = [
  { href: "/maaser", label: "Maaser tracker", detail: "Your obligation and what is left of it", icon: Landmark },
  { href: "/history", label: "Giving history", detail: "Every gift you have logged", icon: ScrollText },
  { href: "/history/statement", label: "Year-end statement", detail: "Printable, with EINs", icon: FileText },
  { href: "/favorites", label: "Favorites", detail: "Organizations you saved", icon: Heart },
];

const ORGANIZATIONS = [
  { href: "/for-organizations", label: "For organizations" },
  { href: "/claim", label: "Claim your listing" },
  { href: "/verification", label: "How verification works" },
  { href: "/request-removal", label: "Request removal" },
];

const ABOUT = [
  { href: "/about", label: "About this project" },
  { href: "/contact", label: "Contact" },
  { href: "/terms", label: "Terms" },
  { href: "/privacy", label: "Privacy" },
];

export default function AccountPage() {
  return (
    <>
      <AppHeader title="Account" />

      <div className="app py-4">
        {/*
          There is no auth yet. Rather than a fake avatar and a name we do not
          have, say what is true: the data is on this device and nothing is
          signed in.
        */}
        <div className="flex items-center gap-3 rounded-card bg-ink-050 p-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-ink-600">
            <CircleUserRound aria-hidden className="size-7" />
          </span>
          <div className="min-w-0">
            <p className="font-display text-base font-bold text-ink-900">Not signed in</p>
            <p className="text-sm text-ink-600">
              Your giving data is saved on this device only. Accounts are coming.
            </p>
          </div>
        </div>

        <Section title="Your giving">
          {GIVING.map((row) => (
            <Row key={row.href} href={row.href} label={row.label} detail={row.detail} icon={row.icon} />
          ))}
        </Section>

        <Section title="For organizations">
          {ORGANIZATIONS.map((row) => (
            <Row key={row.href} href={row.href} label={row.label} />
          ))}
        </Section>

        <Section title="About">
          {ABOUT.map((row) => (
            <Row key={row.href} href={row.href} label={row.label} />
          ))}
        </Section>

        <div className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-ink-600">
          <ShieldCheck aria-hidden className="mt-0.5 size-4 shrink-0 text-bronze-600" />
          <p>
            We never handle your donation and never take a cut. A listing is not an endorsement —
            we publish public records and organization-supplied information, we do not audit
            finances, and donors are responsible for their own diligence. Nothing here is tax
            advice.
          </p>
        </div>
      </div>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-6">
      <h2 className="mb-1 text-sm font-bold text-ink-600">{title}</h2>
      <ul className="divide-y divide-ink-300 border-y border-ink-300">{children}</ul>
    </section>
  );
}

function Row({
  href,
  label,
  detail,
  icon: Icon,
}: {
  href: string;
  label: string;
  detail?: string;
  icon?: typeof Heart;
}) {
  return (
    <li>
      <Link href={href} className="press flex min-h-[52px] items-center gap-3 py-3">
        {Icon && <Icon aria-hidden className="size-5 shrink-0 text-ink-600" />}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-semibold text-ink-900">{label}</span>
          {detail && <span className="block truncate text-sm text-ink-600">{detail}</span>}
        </span>
        <ChevronRight aria-hidden className="size-5 shrink-0 text-ink-300" />
      </Link>
    </li>
  );
}
