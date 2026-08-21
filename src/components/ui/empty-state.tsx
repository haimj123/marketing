import type { ReactNode } from "react";
import { SearchX } from "lucide-react";

/**
 * Never a bare "No results." Say what happened and give the one control that
 * fixes it.
 */
export function EmptyState({
  title,
  body,
  action,
  icon,
}: {
  title: string;
  body: string;
  action?: ReactNode;
  icon?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="mb-4 flex size-14 items-center justify-center rounded-full bg-ink-050 text-ink-600">
        {icon ?? <SearchX aria-hidden className="size-7" strokeWidth={1.5} />}
      </span>
      <h2 className="text-lg font-semibold text-ink-900">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-[36ch] text-sm text-ink-600">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
