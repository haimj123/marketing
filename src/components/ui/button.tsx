import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * 8px radius, 48px primary / 40px secondary, weight 600 — matched to the
 * Uber Eats shell. Bronze is deliberately not a variant: it is a signal
 * colour reserved for verification, progress and the maaser ring.
 */
type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "lg" | "md" | "sm";

const VARIANT: Record<Variant, string> = {
  primary: "bg-blue-700 text-white hover:bg-blue-900 active:bg-blue-900",
  secondary:
    "bg-white text-blue-700 border border-ink-300 hover:border-blue-500 hover:bg-blue-050",
  ghost: "bg-transparent text-blue-700 hover:bg-blue-050",
  danger: "bg-white text-danger border border-ink-300 hover:border-danger hover:bg-red-50",
};

const SIZE: Record<Size, string> = {
  lg: "h-12 px-6 text-base",
  md: "h-10 px-4 text-sm",
  sm: "h-9 px-3 text-sm",
};

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-card font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(BASE, VARIANT[variant], SIZE[size], full && "w-full", className)}
      {...props}
    />
  );
}

export interface ButtonLinkProps extends React.ComponentProps<typeof Link> {
  variant?: Variant;
  size?: Size;
  full?: boolean;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  full,
  className,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(BASE, VARIANT[variant], SIZE[size], full && "w-full", className)}
      {...props}
    />
  );
}
