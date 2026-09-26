"use client";

import { cn } from "@/lib/cn";

/** iOS-style switch. Blue when on, matching the Stitch toggles. */
export function Toggle({
  checked,
  onChange,
  disabled,
  size = "md",
  label,
  className,
}: {
  checked: boolean;
  onChange?: (next: boolean) => void;
  disabled?: boolean;
  size?: "sm" | "md";
  label?: string;
  className?: string;
}) {
  const dims = size === "sm" ? { w: 36, h: 20, k: 14 } : { w: 44, h: 24, k: 18 };
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors disabled:opacity-50",
        checked ? "bg-brand-600" : "bg-line-strong",
        className,
      )}
      style={{ width: dims.w, height: dims.h }}
    >
      <span
        className="inline-block rounded-full bg-white shadow-sm transition-transform"
        style={{
          width: dims.k,
          height: dims.k,
          transform: `translateX(${checked ? dims.w - dims.k - 3 : 3}px)`,
        }}
      />
    </button>
  );
}
