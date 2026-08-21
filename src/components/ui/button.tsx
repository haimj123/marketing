import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Bronze is deliberately not a variant: it is a signal colour reserved for
 * verification, progress and the maaser ring. Blue does all interactive work.
 */
type Variant = "primary" | "secondary" | "ghost";
type Size = "lg" | "md";

const VARIANT: Record<Variant, string> = {
  primary: "bg-blue-700 text-white",
  secondary: "bg-white text-ink-900 border border-ink-300",
  ghost: "bg-transparent text-blue-700",
};

const SIZE: Record<Size, string> = {
  lg: "h-13 px-6 py-4 text-base",
  md: "h-11 px-4 text-sm",
};

const BASE =
  "press inline-flex items-center justify-center gap-2 rounded-card font-semibold disabled:opacity-45";

export function Button({
  variant = "primary",
  size = "lg",
  full,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}) {
  return (
    <button
      className={cn(BASE, VARIANT[variant], SIZE[size], full && "w-full", className)}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "lg",
  full,
  className,
  ...props
}: React.ComponentProps<typeof Link> & {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}) {
  return (
    <Link
      className={cn(BASE, VARIANT[variant], SIZE[size], full && "w-full", className)}
      {...props}
    />
  );
}
