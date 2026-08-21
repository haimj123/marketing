import { Info } from "lucide-react";

/**
 * Shown while the app serves the fixture rather than IRS data. Every
 * organization in the fixture is invented and every payment handle is a
 * placeholder — saying so is the only honest way to ship a charity directory
 * full of sample listings.
 */
export function DemoDataBanner() {
  return (
    <div className="bg-bronze-100 print:hidden">
      <p className="app flex items-center gap-1.5 py-1.5 text-2xs leading-tight text-bronze-600">
        <Info aria-hidden className="size-3.5 shrink-0" />
        <span className="truncate">
          <strong className="font-bold">Sample data</strong> — every listing here is fictional.
        </span>
      </p>
    </div>
  );
}
