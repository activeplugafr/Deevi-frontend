import { cn } from "@/lib/cn";

/**
 * Deevi mark: two linked circles (a "connection") + the wordmark.
 * `tone="white"` renders the mark white for use on blue surfaces.
 */
export function Logo({
  className,
  showWordmark = true,
  size = 28,
  tone = "brand",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: number;
  tone?: "brand" | "white";
}) {
  const mark = tone === "white" ? "#ffffff" : "#1b47d6";
  const word = tone === "white" ? "#ffffff" : "#0b1220";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        width={size * 1.7}
        height={size}
        viewBox="0 0 44 26"
        fill="none"
        aria-hidden
        className="shrink-0"
      >
        <rect x="9" y="9" width="26" height="8" rx="4" fill={mark} />
        <circle cx="9" cy="13" r="9" fill={mark} />
        <circle cx="35" cy="13" r="9" fill={mark} />
      </svg>
      {showWordmark && (
        <span
          className="font-display font-bold tracking-tight"
          style={{ fontSize: size * 0.82, color: word, letterSpacing: "-0.02em" }}
        >
          Deevi
        </span>
      )}
    </span>
  );
}
