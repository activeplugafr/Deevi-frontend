"use client";

import { forwardRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/cn";
import { Spinner } from "./Spinner";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "subtle" | "warn";
type Size = "sm" | "md" | "lg";

// Variant styling per the design system (10px radius, scale-down on press).
const VARIANTS: Record<Variant, string> = {
  primary:
    "bg-brand-600 text-white shadow-card hover:bg-brand-700 active:scale-[0.98] disabled:bg-brand-300 disabled:shadow-none",
  secondary:
    "bg-surface text-ink border border-line hover:bg-canvas active:scale-[0.98] disabled:text-muted",
  subtle:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 active:scale-[0.98] disabled:opacity-60",
  ghost:
    "bg-transparent text-ink-soft hover:bg-brand-50 hover:text-brand-700 disabled:text-muted",
  danger:
    "bg-danger-600 text-white hover:bg-danger-700 active:scale-[0.98] disabled:bg-danger-600/40",
  warn:
    "bg-warn-500 text-white hover:bg-warn-600 active:scale-[0.98] disabled:bg-warn-500/50",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-3 text-sm rounded-control gap-1.5",
  md: "h-11 px-4 text-sm rounded-control gap-2",
  lg: "h-12 px-5 text-base rounded-control gap-2",
};

const base =
  "inline-flex items-center justify-center font-semibold transition-[background-color,transform,box-shadow] duration-150 disabled:cursor-not-allowed disabled:active:scale-100 select-none";

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
}

type ButtonProps = CommonProps & React.ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, fullWidth, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(base, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
      {...props}
    >
      {loading && <Spinner size={size === "lg" ? 18 : 16} />}
      {children}
    </button>
  );
});

interface LinkButtonProps extends CommonProps {
  href: string;
  className?: string;
  children: React.ReactNode;
  prefetch?: boolean;
}

export function LinkButton({
  href,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  children,
  prefetch,
}: LinkButtonProps) {
  return (
    <Link
      href={href}
      prefetch={prefetch}
      className={cn(base, VARIANTS[variant], SIZES[size], fullWidth && "w-full", className)}
    >
      {children}
    </Link>
  );
}
