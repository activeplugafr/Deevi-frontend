import { cn } from "@/lib/cn";

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
  const markColor = tone === "white" ? "#ffffff" : "#1b47d6";
  const strokeColor = tone === "white" ? "#1b47d6" : "#ffffff";
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 512 512" aria-hidden>
        <rect width="512" height="512" rx="112" fill={markColor} />
        <path
          d="M170 132h74c88 0 150 50 150 124s-62 124-150 124h-74z"
          fill="none"
          stroke={strokeColor}
          strokeWidth="46"
          strokeLinejoin="round"
        />
        <circle cx="330" cy="256" r="30" fill={strokeColor} />
      </svg>
      {showWordmark && (
        <span
          className={cn(
            "font-bold tracking-tight",
            tone === "white" ? "text-white" : "text-ink",
          )}
          style={{ fontSize: size * 0.72 }}
        >
          Deevi
        </span>
      )}
    </span>
  );
}
