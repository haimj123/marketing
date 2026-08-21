import Link from "next/link";
import type { RawParams } from "@/lib/search-params";

/** Only appears when a listing genuinely runs past one page. */
export function Pagination({
  page,
  totalPages,
  basePath,
  params,
}: {
  page: number;
  totalPages: number;
  basePath: string;
  params: RawParams;
}) {
  if (totalPages <= 1) return null;

  function href(target: number): string {
    const qs = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value == null) continue;
      qs.set(key, Array.isArray(value) ? value[0] : value);
    }
    if (target > 1) qs.set("page", String(target));
    const q = qs.toString();
    return q ? `${basePath}?${q}` : basePath;
  }

  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-between gap-3">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="press flex h-11 items-center rounded-card border border-ink-300 px-4 text-sm font-semibold text-ink-900"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="tabular text-sm text-ink-600">
        {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className="press flex h-11 items-center rounded-card border border-ink-300 px-4 text-sm font-semibold text-ink-900"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
