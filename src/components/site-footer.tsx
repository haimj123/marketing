import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Donors",
    links: [
      { href: "/", label: "Browse categories" },
      { href: "/search", label: "Search" },
      { href: "/maaser", label: "Maaser tracker" },
      { href: "/history", label: "Giving history" },
      { href: "/favorites", label: "Favorites" },
    ],
  },
  {
    title: "Organizations",
    links: [
      { href: "/for-organizations", label: "For organizations" },
      { href: "/claim", label: "Claim your listing" },
      { href: "/verification", label: "How verification works" },
      { href: "/request-removal", label: "Request removal" },
    ],
  },
  {
    title: "About",
    links: [
      { href: "/about", label: "About this project" },
      { href: "/contact", label: "Contact" },
      { href: "/terms", label: "Terms" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-ink-300 bg-ink-050 print:hidden">
      <div className="page py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <p className="font-display text-lg font-extrabold text-brand-900">
              Shaare <span className="text-brand-700">Tzadaka</span>
            </p>
            <p className="mt-3 max-w-xs text-sm text-ink-600">
              A free directory of Jewish tzedaka organizations. We never handle your donation and
              we never take a cut of it.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-sm font-bold text-ink-900">{col.title}</h2>
              <ul className="mt-3 space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-ink-600 hover:text-brand-700">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <p className="mt-10 border-t border-ink-300 pt-6 text-xs leading-relaxed text-ink-600">
          A listing on Shaare Tzadaka is not an endorsement. We publish public records and
          organization-supplied information; we do not audit finances, and donors are responsible
          for their own diligence. Nothing here is tax advice — whether a gift is deductible
          depends on the organization&rsquo;s status and on your own circumstances.
        </p>
      </div>
    </footer>
  );
}
