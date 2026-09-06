/** Minimal inline icon set (stroke, 24x24) — no icon-library dependency. */
import { cn } from "@/lib/cn";

type P = { className?: string; size?: number };
function wrap(path: React.ReactNode, fill = false) {
  function Icon({ className, size = 24 }: P) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={fill ? "currentColor" : "none"}
        stroke={fill ? "none" : "currentColor"}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={cn("shrink-0", className)}
        aria-hidden
      >
        {path}
      </svg>
    );
  }
  return Icon;
}

export const IconHome = wrap(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V21h14V9.5" /></>);
export const IconSearch = wrap(<><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>);
export const IconBriefcase = wrap(<><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></>);
export const IconChat = wrap(<><path d="M4 5h16v11H8l-4 4z" /></>);
export const IconBell = wrap(<><path d="M6 9a6 6 0 0 1 12 0c0 5 2 6 2 6H4s2-1 2-6" /><path d="M10 20a2 2 0 0 0 4 0" /></>);
export const IconUser = wrap(<><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>);
export const IconPlus = wrap(<><path d="M12 5v14M5 12h14" /></>);
export const IconLayers = wrap(<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 13 9 5 9-5" /></>);
export const IconClipboard = wrap(<><rect x="6" y="4" width="12" height="17" rx="2" /><path d="M9 4h6v3H9z" /><path d="M9 11h6M9 15h4" /></>);
export const IconMapPin = wrap(<><path d="M12 21s-7-6-7-11a7 7 0 0 1 14 0c0 5-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></>);
export const IconStar = wrap(<path d="m12 3 2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.9 6.7 19.4l1.2-6L3.4 9.3l6-.7L12 3Z" />, true);
export const IconClock = wrap(<><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>);
export const IconCheck = wrap(<path d="m5 12 5 5 9-11" />);
export const IconChevronRight = wrap(<path d="m9 6 6 6-6 6" />);
export const IconChevronLeft = wrap(<path d="m15 6-6 6 6 6" />);
export const IconArrowLeft = wrap(<><path d="M19 12H5" /><path d="m12 19-7-7 7-7" /></>);
export const IconShield = wrap(<><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6l-7-3Z" /><path d="m9 12 2 2 4-4" /></>);
export const IconUsers = wrap(<><circle cx="9" cy="8" r="3.5" /><path d="M3 20a6 6 0 0 1 12 0" /><path d="M16 5a3.5 3.5 0 0 1 0 7" /><path d="M21 20a6 6 0 0 0-5-5.9" /></>);
export const IconGrid = wrap(<><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /></>);
export const IconFlag = wrap(<><path d="M5 21V4" /><path d="M5 4h11l-2 3 2 3H5" /></>);
export const IconWrench = wrap(<><path d="M15 6a4 4 0 0 0-5 5L3 18l3 3 7-7a4 4 0 0 0 5-5l-3 3-2-2 2-3Z" /></>);
export const IconSettings = wrap(<><circle cx="12" cy="12" r="3" /><path d="M12 2v3M12 19v3M4.2 4.2l2.1 2.1M17.7 17.7l2.1 2.1M2 12h3M19 12h3M4.2 19.8l2.1-2.1M17.7 6.3l2.1-2.1" /></>);
export const IconLogout = wrap(<><path d="M15 4h3a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-3" /><path d="M10 12H3" /><path d="m7 8-4 4 4 4" /></>);
export const IconSend = wrap(<path d="M4 12 20 4l-6 16-3-7-7-1Z" />);
export const IconSparkle = wrap(<path d="M12 3v6M12 15v6M3 12h6M15 12h6M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />);
export const IconScissors = wrap(<><circle cx="6" cy="6" r="3" /><circle cx="6" cy="18" r="3" /><path d="M8.5 8.5 20 18M8.5 15.5 20 6" /></>);
export const IconTruck = wrap(<><rect x="1" y="6" width="14" height="10" rx="1" /><path d="M15 9h4l3 3v4h-7z" /><circle cx="6" cy="18" r="1.8" /><circle cx="18" cy="18" r="1.8" /></>);
export const IconWallet = wrap(<><rect x="3" y="6" width="18" height="13" rx="2.5" /><path d="M3 10h18" /><circle cx="17" cy="14" r="1.3" fill="currentColor" stroke="none" /></>);
export const IconBookmark = wrap(<path d="M6 4h12v17l-6-4-6 4z" />);
