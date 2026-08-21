import { CategoryIcon } from "./category-icon";
import { CATEGORY_BY_SLUG } from "@/lib/categories";
import { cn } from "@/lib/cn";

/**
 * Most listings arrive from the IRS with no imagery at all, and a broken
 * image placeholder on four fifths of the directory would read as neglect.
 * So an org without a hero gets a deterministic crest instead: its initials
 * over a blue field, with the primary category's glyph behind. It looks
 * intentional, and it makes a claimed profile's real photograph feel like an
 * upgrade rather than the baseline.
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
  className,
  large,
}: {
  slug: string;
  name: string;
  heroUrl?: string | null;
  categorySlug?: string;
  className?: string;
  large?: boolean;
}) {
  if (heroUrl) {
    // eslint-disable-next-line @next/next/no-img-element -- arbitrary org-supplied host
    return <img src={heroUrl} alt="" className={cn("size-full object-cover", className)} />;
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
            "absolute -bottom-4 -right-3 opacity-20",
            large ? "size-40" : "size-24",
          )}
        />
      )}
      <span
        className={cn(
          "relative font-display font-extrabold tracking-tight",
          large ? "text-4xl" : "text-2xl",
        )}
      >
        {initials(name)}
      </span>
    </div>
  );
}
