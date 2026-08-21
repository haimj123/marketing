import { cn } from "@/lib/cn";

/**
 * Skeletons, not spinners. Each one is the shape of the thing it stands in
 * for, so the layout does not jump when real content lands.
 */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton rounded-card", className)} />;
}

export function SkeletonOrgCard() {
  return (
    <div aria-hidden>
      <Skeleton className="aspect-video w-full" />
      <div className="pt-3">
        <Skeleton className="h-[17px] w-3/4 rounded" />
        <Skeleton className="mt-2 h-3.5 w-1/2 rounded" />
      </div>
    </div>
  );
}

export function SkeletonFeed({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading organizations">
      {Array.from({ length: count }, (_, i) => (
        <SkeletonOrgCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonRail({ count = 3 }: { count?: number }) {
  return (
    <div className="rail bleed pb-1" aria-busy="true" aria-label="Loading">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="w-[168px]">
          <Skeleton className="aspect-video w-full" />
          <Skeleton className="mt-3 h-[17px] w-full rounded" />
          <Skeleton className="mt-2 h-3.5 w-2/3 rounded" />
        </div>
      ))}
    </div>
  );
}
