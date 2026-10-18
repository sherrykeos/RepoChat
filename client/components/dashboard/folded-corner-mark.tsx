"use client";

import { cn } from "@/lib/utils";

interface FoldedCornerMarkProps {
  owner?: string;
  className?: string;
}

/**
 * Folded paper corner mark (dog-ear fold) displayed on the top-right
 * of non-native / shared repository cards.
 */
export function FoldedCornerMark({ owner, className }: FoldedCornerMarkProps) {
  return (
    <div
      className={cn(
        "absolute top-0 right-0 z-20 pointer-events-auto group/fold",
        className
      )}
      title={owner ? `Shared repository (Owner: ${owner})` : "Shared repository"}
    >
      <div className="relative size-6 cursor-help">
        <svg
          viewBox="0 0 24 24"
          className="size-full overflow-visible drop-shadow-[0_2px_4px_rgba(0,0,0,0.15)] dark:drop-shadow-[0_2px_4px_rgba(0,0,0,0.6)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="paperFoldGrad" x1="0" y1="24" x2="24" y2="0" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--border)" />
              <stop offset="60%" stopColor="var(--muted)" />
              <stop offset="100%" stopColor="var(--card)" />
            </linearGradient>
            <linearGradient id="creaseGlow" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
              <stop stopColor="var(--primary)" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#8250df" stopOpacity="0.6" />
            </linearGradient>
          </defs>

          {/* Background cut-out representing the card's missing corner */}
          <polygon points="0,0 24,0 24,24" className="fill-background" opacity="0.95" />

          {/* Folded paper flap */}
          <polygon
            points="0,0 24,24 0,24"
            fill="url(#paperFoldGrad)"
            stroke="var(--border)"
            strokeWidth="0.8"
            className="transition-colors group-hover/fold:stroke-primary"
          />

          {/* Crisp diagonal crease */}
          <line
            x1="0"
            y1="0"
            x2="24"
            y2="24"
            stroke="url(#creaseGlow)"
            strokeWidth="1.2"
          />
        </svg>

        {/* Subtle tooltip / label on hover */}
        <span className="pointer-events-none absolute right-full top-0 mr-1.5 hidden whitespace-nowrap rounded border border-border bg-popover px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground shadow-lg group-hover/fold:inline-block">
          Shared {owner ? `(${owner})` : ""}
        </span>
      </div>
    </div>
  );
}
