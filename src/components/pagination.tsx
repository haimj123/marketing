import Link from "next/link";
import type { RawParams } from "@/lib/search-params";

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
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between gap-4">
      {page > 1 ? (
        <Link
          href={href(page - 1)}
          className="inline-flex h-10 items-center rounded-[8px] border border-ink-300 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-050"
        >
          Previous
        </Link>
      ) : (
        <span />
      )}
      <p className="tabular text-sm text-ink-600">
        Page {page} of {totalPages}
      </p>
      {page < totalPages ? (
        <Link
          href={href(page + 1)}
          className="inline-flex h-10 items-center rounded-[8px] border border-ink-300 px-4 text-sm font-semibold text-brand-700 hover:bg-brand-050"
        >
          Next
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
