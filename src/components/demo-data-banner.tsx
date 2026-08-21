import { Info } from "lucide-react";

/**
 * Shown while the app is serving the fixture rather than IRS data. Every
 * organization in the fixture is invented and every payment handle is a
 * placeholder — saying so on every page is the only honest way to ship a
 * charity directory full of sample listings.
 */
export function DemoDataBanner() {
  return (
    <div className="border-b border-bronze-500/40 bg-bronze-100 print:hidden">
      <div className="page flex items-start gap-2 py-2 text-xs text-bronze-600">
        <Info aria-hidden className="mt-0.5 size-4 shrink-0" />
        <p>
          <strong className="font-bold">Sample data.</strong> Every organization shown is
          fictional and no payment handle here is real. Run{" "}
          <code className="rounded bg-white/70 px-1 py-0.5 font-mono">npm run ingest:bmf</code> to
          replace these listings with the IRS Exempt Organizations Business Master File.
        </p>
      </div>
    </div>
  );
}
