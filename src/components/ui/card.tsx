import * as React from "react";
import { cn } from "@/lib/cn";

/** 8px radius, 1px ink-300 border, flat at rest, soft lift on hover. */
export function Card({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-card border border-ink-300 bg-white transition-shadow",
        className,
      )}
      {...props}
    />
  );
}

export function CardHoverable({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <Card
      className={cn("hover:shadow-[0_2px_8px_rgba(0,0,0,.08)]", className)}
      {...props}
    />
  );
}
