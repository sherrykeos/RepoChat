import type { SVGProps } from "react";

import { cn } from "@/lib/utils";

type RepoChatIconProps = SVGProps<SVGSVGElement> & {
  variant?: "color" | "mono";
};

export function RepoChatIcon({
  className,
  variant = "color",
  ...props
}: RepoChatIconProps) {
  const mono = variant === "mono";

  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={cn("shrink-0", className)}
      {...props}
    >
      <defs>
        <linearGradient id="rc-icon-bg" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0969DA" />
          <stop offset="55%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#7C3AED" />
        </linearGradient>
        <linearGradient id="rc-icon-screen" x1="16" y1="20" x2="48" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F172A" />
          <stop offset="100%" stopColor="#1E1B4B" />
        </linearGradient>
        <radialGradient id="rc-icon-glow" cx="32" cy="32" r="24" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#60A5FA" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Main Container */}
      <rect
        width="64"
        height="64"
        rx="16"
        fill={mono ? "currentColor" : "url(#rc-icon-bg)"}
      />

      {/* Subtle border shine */}
      <rect
        x="1"
        y="1"
        width="62"
        height="62"
        rx="15"
        stroke="#FFFFFF"
        strokeOpacity="0.25"
        strokeWidth="1.5"
      />

      {/* Screen Face */}
      <rect
        x="14"
        y="16"
        width="36"
        height="32"
        rx="8"
        fill="url(#rc-icon-screen)"
      />
      <rect
        x="14.75"
        y="16.75"
        width="34.5"
        height="30.5"
        rx="7.25"
        stroke="#818CF8"
        strokeOpacity="0.3"
        strokeWidth="1"
      />

      {/* Terminal Code Brackets / Prompt */}
      <path
        d="M23 27L29 32L23 37"
        stroke="#38BDF8"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M33 37H41"
        stroke="#A78BFA"
        strokeWidth="2.75"
        strokeLinecap="round"
      />

      {/* Pulsing prompt dot */}
      <circle cx="43" cy="27" r="1.5" fill="#34D399" />
    </svg>
  );
}

export function RepoChatLogo({
  className,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)}>
      <RepoChatIcon className="size-8" />
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        RepoChat
      </span>
    </div>
  );
}
