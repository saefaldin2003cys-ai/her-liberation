import type { SVGProps } from "react";

/**
 * Stroke icons on a 24x24 grid that inherit `currentColor`.
 *
 * These replace the emoji the old site used as its icon set. Emoji are drawn
 * by the operating system font: they differ between Android, iOS and Windows,
 * cannot be recoloured, and do not sit on a baseline.
 */
const PATHS = {
  menu: <path d="M3.5 7h17M3.5 12h17M3.5 17h17" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  moon: <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />,
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  scales: (
    <>
      <path d="M12 3.5v17M8 20.5h8M4.5 7.2h15" />
      <path d="M6.2 7.5 3 14a3.2 3.2 0 0 0 6.4 0Z" />
      <path d="M17.8 7.5 14.6 14a3.2 3.2 0 0 0 6.4 0Z" />
    </>
  ),
  megaphone: (
    <>
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M16 8.5a4.5 4.5 0 0 1 0 7" />
      <path d="M19 5.5a8.5 8.5 0 0 1 0 13" />
    </>
  ),
  users: (
    <>
      <path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="3.2" />
      <path d="M22 20v-2a4 4 0 0 0-3-3.9M16 4.1a4 4 0 0 1 0 7.8" />
    </>
  ),
  chart: <path d="M2 20h20M5 20V11M11 20V4M17 20v-6" />,
  book: (
    <>
      <path d="M4 19.2A2.8 2.8 0 0 1 6.8 16.4H20" />
      <path d="M6.8 2.5H20v19H6.8A2.8 2.8 0 0 1 4 18.7V5.3a2.8 2.8 0 0 1 2.8-2.8Z" />
    </>
  ),
  pin: (
    <>
      <path d="M20 10.2c0 5.7-8 11.8-8 11.8s-8-6.1-8-11.8a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="2.8" />
    </>
  ),
  alert: (
    <>
      <path d="M10.3 4 2 18.2A2 2 0 0 0 3.7 21h16.6a2 2 0 0 0 1.7-2.8L13.7 4a2 2 0 0 0-3.4 0Z" />
      <path d="M12 9.5v4.2M12 17.3h.01" />
    </>
  ),
  check: <path d="M20 6.5 9.2 17.3 4 12.1" />,
  heart: (
    <path d="M20.6 5.8a4.9 4.9 0 0 0-7 0L12 7.4l-1.6-1.6a4.9 4.9 0 1 0-7 7l8.6 8.6 8.6-8.6a4.9 4.9 0 0 0 0-7Z" />
  ),
  graduation: (
    <>
      <path d="M22 8.8 12 4.5 2 8.8l10 4.3 10-4.3Z" />
      <path d="M6.5 11v4.3c0 1.5 2.5 2.7 5.5 2.7s5.5-1.2 5.5-2.7V11" />
    </>
  ),
  lightbulb: (
    <>
      <path d="M9.5 18.5h5M10.5 21.5h3" />
      <path d="M12 2.5a6 6 0 0 0-3.6 10.8c.6.5 1 1.3 1.1 2.1h5c.1-.8.5-1.6 1.1-2.1A6 6 0 0 0 12 2.5Z" />
    </>
  ),
  link: (
    <>
      <path d="M10.5 13.5a4.6 4.6 0 0 0 6.9.5l2.8-2.8a4.6 4.6 0 0 0-6.5-6.5L12.1 6.3" />
      <path d="M13.5 10.5a4.6 4.6 0 0 0-6.9-.5l-2.8 2.8a4.6 4.6 0 0 0 6.5 6.5l1.6-1.6" />
    </>
  ),
  lock: (
    <>
      <path d="M7 10.5V7.5a5 5 0 0 1 10 0v3" />
      <rect x="4" y="10.5" width="16" height="10" rx="1.5" />
    </>
  ),
  document: (
    <>
      <path d="M14 2.5H6.5a2 2 0 0 0-2 2v15a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V8Z" />
      <path d="M14 2.5V8h5.5M8.5 13h7M8.5 17h7" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="1.6" />
      <circle cx="8.5" cy="10" r="1.8" />
      <path d="M21 15.5 16 11l-9 8.5" />
    </>
  ),
  trash: (
    <>
      <path d="M3.5 6.5h17M9 6.5V4.2h6v2.3" />
      <path d="M18.5 6.5 17.4 20a1.5 1.5 0 0 1-1.5 1.4H8.1A1.5 1.5 0 0 1 6.6 20L5.5 6.5" />
      <path d="M10 11v6M14 11v6" />
    </>
  ),
  pen: (
    <>
      <path d="M12.5 20H21" />
      <path d="M16.4 3.6a2.1 2.1 0 0 1 3 3L7.5 18.5 3 20l1.5-4.5Z" />
    </>
  ),
  exit: (
    <>
      <path d="M9.5 21H5.5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 16.5 20.5 12 16 7.5M20.5 12h-11" />
    </>
  ),
  coins: (
    <>
      <ellipse cx="12" cy="6.5" rx="7" ry="3" />
      <path d="M5 6.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
      <path d="M5 11.5v5c0 1.7 3.1 3 7 3s7-1.3 7-3v-5" />
    </>
  ),
  passport: (
    <>
      <rect x="5" y="2.5" width="14" height="19" rx="2" />
      <circle cx="12" cy="9.5" r="3" />
      <path d="M9 16.5h6" />
    </>
  ),
  school: (
    <>
      <path d="M3 21h18" />
      <path d="M5 21V8.5L12 4l7 4.5V21" />
      <path d="M10 21v-5h4v5" />
    </>
  ),
  ring: (
    <>
      <circle cx="12" cy="14.5" r="5.8" />
      <path d="M9.6 3.5h4.8l1.6 3.3-4 2.4-4-2.4Z" />
    </>
  ),
  share: (
    <>
      <circle cx="18" cy="5.5" r="2.5" />
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="18.5" r="2.5" />
      <path d="M8.2 10.8 15.8 6.7M8.2 13.2l7.6 4.1" />
    </>
  ),
  mail: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  envelope: (
    <>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),
  home: (
    <>
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2 2Z" />
      <path d="M9 22V12h6v10" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 2a14.5 14.5 0 0 0 0 20M12 2a14.5 14.5 0 0 1 0 20M2 12h20" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

export function Icon({
  name,
  ...props
}: { name: IconName } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {PATHS[name]}
    </svg>
  );
}
