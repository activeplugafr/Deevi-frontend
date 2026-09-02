"use client";

import { cn } from "@/lib/cn";
import { initials as toInitials } from "@/lib/format";
import Image from "next/image";

// ---- Card ------------------------------------------------------------------

export function Card({
  className,
  children,
  as: Tag = "div",
  ...rest
}: React.HTMLAttributes<HTMLElement> & { as?: React.ElementType }) {
  return (
    <Tag className={cn("rounded-xl border border-line bg-surface", className)} {...rest}>
      {children}
    </Tag>
  );
}

// ---- Badge -----------------------------------------------------------------

export function Badge({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold whitespace-nowrap",
        className,
      )}
    >
      {children}
    </span>
  );
}

// ---- Avatar ----------------------------------------------------------------

export function Avatar({
  src,
  firstName,
  lastName,
  size = 40,
  className,
}: {
  src?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  size?: number;
  className?: string;
}) {
  const label = toInitials(firstName, lastName);
  if (src) {
    return (
      <Image
        src={src}
        alt={label}
        width={size}
        height={size}
        className={cn("rounded-full object-cover bg-canvas", className)}
        style={{ width: size, height: size }}
        unoptimized
      />
    );
  }
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.38 }}
      aria-hidden
    >
      {label}
    </span>
  );
}

// ---- VerifiedTick ----------------------------------------------------------

export function VerifiedTick({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      width="16"
      height="16"
      className={cn("inline-block text-brand-600", className)}
      aria-label="Verified"
      role="img"
    >
      <path
        fill="currentColor"
        d="m10 1 2.2 1.6 2.7-.2 1 2.5 2.3 1.4-.6 2.6.6 2.6-2.3 1.4-1 2.5-2.7-.2L10 19l-2.2-1.6-2.7.2-1-2.5-2.3-1.4.6-2.6L1.8 8l2.3-1.4 1-2.5 2.7.2z"
      />
      <path fill="#fff" d="m8.6 12.3-2-2 1-1 1 1 2.9-2.9 1 1z" />
    </svg>
  );
}

// ---- Field / Input / Textarea / Select ------------------------------------

export function Field({
  label,
  hint,
  error,
  required,
  htmlFor,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
          {label}
          {required && <span className="text-danger-600"> *</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs text-danger-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

const controlBase =
  "w-full rounded-lg border border-line bg-surface px-3 text-sm text-ink placeholder:text-muted focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition disabled:bg-canvas disabled:text-muted";

export const Input = ({
  className,
  invalid,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) => (
  <input
    className={cn(controlBase, "h-11", invalid && "border-danger-600 focus:border-danger-600 focus:ring-danger-600/20", className)}
    {...props}
  />
);

export const Textarea = ({
  className,
  invalid,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }) => (
  <textarea
    className={cn(controlBase, "py-2.5 min-h-[96px] resize-y", invalid && "border-danger-600", className)}
    {...props}
  />
);

export const Select = ({
  className,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select className={cn(controlBase, "h-11 pr-8 appearance-none bg-no-repeat", className)}
    style={{
      backgroundImage:
        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7688' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
      backgroundPosition: "right 10px center",
    }}
    {...props}
  >
    {children}
  </select>
);
