import { Building2 } from "lucide-react";
import { CategoryIcon } from "./category-icon";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { cn } from "@/lib/cn";

/**
 * Most listings arrive from the IRS with no imagery at all, so this component
 * carries more weight here than a photo slot would on a delivery app.
 *
 * Three states, deliberately different:
 *   heroUrl        → the organization's own photograph.
 *   claimed, none  → a deterministic crest: initials over a blue field with
 *                    the category glyph behind. Reads as designed, not broken,
 *                    and makes a real photo feel like an upgrade.
 *   unclaimed      → flat --ink-050 with a building glyph. Quiet on purpose:
 *                    an IRS stub should never look as finished as a profile
 *                    somebody maintains.
 */
function initials(name: string): string {
  const words = name
    .replace(/\b(inc|incorporated|the|of|and|a|for)\b\.?/gi, " ")
    .split(/\s+/)
    .filter(Boolean);
  return words
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

const FIELDS = [
  "from-blue-900 to-blue-700",
  "from-blue-700 to-blue-500",
  "from-blue-900 to-blue-500",
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function OrgImage({
  slug,
  name,
  heroUrl,
  categorySlug,
  unclaimed,
  className,
  size = "card",
}: {
  slug: string;
  name: string;
  heroUrl?: string | null;
  categorySlug?: string;
  unclaimed?: boolean;
  className?: string;
  size?: "card" | "rail" | "hero" | "thumb";
}) {
  if (heroUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary org-supplied host
    return <img src={heroUrl} alt="" className={cn("size-full object-cover", className)} />;
  }

  if (unclaimed) {
    return (
      <div
        aria-hidden
        className={cn(
          "flex size-full items-center justify-center bg-ink-050 text-ink-300",
          className,
        )}
      >
        <Building2
          className={size === "hero" ? "size-16" : size === "thumb" ? "size-7" : "size-10"}
          strokeWidth={1.5}
        />
      </div>
    );
  }

  const field = FIELDS[hash(slug) % FIELDS.length];
  const category = categorySlug ? CATEGORY_BY_SLUG.get(categorySlug) : undefined;

  return (
    <div
      aria-hidden
      className={cn(
        "relative flex size-full items-center justify-center overflow-hidden bg-gradient-to-br text-white",
        field,
        className,
      )}
    >
      {category && (
        <CategoryIcon
          iconKey={category.iconKey}
          className={cn(
            "absolute opacity-20",
            size === "hero" && "-bottom-8 -right-6 size-56",
            size === "card" && "-bottom-5 -right-4 size-32",
            size === "rail" && "-bottom-4 -right-3 size-24",
            size === "thumb" && "-bottom-2 -right-2 size-12",
          )}
          strokeWidth={1.5}
        />
      )}
      <span
        className={cn(
          "relative font-display font-extrabold tracking-tight",
          size === "hero" && "text-4xl",
          size === "card" && "text-2xl",
          size === "rail" && "text-xl",
          size === "thumb" && "text-sm",
        )}
      >
        {initials(name)}
      </span>
    </div>
  );
}
