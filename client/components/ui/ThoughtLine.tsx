'use client';

import React, { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon, SparklesIcon, Tick02Icon } from '@hugeicons/core-free-icons';
import { cn } from '@/lib/utils';

export type ThoughtLineGlyph = 'sparkle' | 'dot' | 'none' | ReactNode;

export interface ThoughtLineProps {
  label?: string;
  doneLabel?: string;
  renderLabel?: (text: string, working: boolean) => ReactNode;
  glyph?: ThoughtLineGlyph;
  steps?: string[];
  collapsible?: boolean;
  collapseOnSettle?: boolean;
  color?: string;
  glyphColor?: string;
  fontSize?: number;
  breathPeriod?: number;
  breathDepth?: number;
  shimmer?: boolean;
  shimmerDuration?: number;
  settleDuration?: number;
  settleBlur?: number;
  working?: boolean;
  settleAfter?: number;
  elapsed?: number;
  showTimer?: boolean;
  onSettle?: (seconds: number) => void;
  className?: string;
  style?: CSSProperties;
}

const EMPTY_STEPS: string[] = [];

const fmt = (ds: number) =>
  ds < 600
    ? `${(ds / 10).toFixed(1)}s`
    : `${Math.floor(ds / 600)}m ${((ds % 600) / 10).toFixed(1)}s`;

const STYLE = `
@keyframes thought-line-pulse {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}
@keyframes thought-line-sparkle {
  0%, 100% { transform: scale(1); filter: brightness(1); }
  50% { transform: scale(1.12); filter: brightness(1.25); }
}
`;

const ThoughtLine: React.FC<ThoughtLineProps> = ({
  label = 'Thinking…',
  doneLabel = '',
  renderLabel,
  glyph = 'sparkle',
  steps = EMPTY_STEPS,
  collapsible = true,
  collapseOnSettle = true,
  color = '',
  glyphColor = '',
  fontSize = 12,
  shimmer = true,
  working = true,
  settleAfter = 0,
  elapsed,
  showTimer = true,
  onSettle,
  className = '',
  style,
}) => {
  const [autoSettled, setAutoSettled] = useState(false);
  const [open, setOpen] = useState(true);
  const [internalElapsedDs, setInternalElapsedDs] = useState(0);

  // Synchronize state during render when working prop changes
  const [prevWorkingProp, setPrevWorkingProp] = useState(working);
  if (working !== prevWorkingProp) {
    setPrevWorkingProp(working);
    if (working) {
      setAutoSettled(false);
    }
  }

  const isWorking = working && !autoSettled;
  const doneText = doneLabel || (showTimer ? 'Thought for' : 'Done thinking');
  const hasTrace = steps.length > 0;

  // Synchronize open state during render when isWorking changes
  const [prevIsWorking, setPrevIsWorking] = useState(isWorking);
  if (isWorking !== prevIsWorking) {
    setPrevIsWorking(isWorking);
    if (isWorking) {
      setOpen(true);
    } else if (collapseOnSettle) {
      setOpen(false);
    }
  }

  // Derive elapsed tenths of a second: passed prop takes precedence, otherwise internal timer
  const elapsedDs = elapsed != null ? Math.round(elapsed * 10) : internalElapsedDs;

  // Timer tick effect - only runs when actively working and no external elapsed prop
  useEffect(() => {
    if (elapsed != null || !isWorking) {
      return undefined;
    }

    const start = performance.now();
    const interval = setInterval(() => {
      const ds = Math.floor((performance.now() - start) / 100);
      setInternalElapsedDs(ds);
      if (settleAfter > 0 && ds >= Math.round(settleAfter * 10)) {
        setAutoSettled(true);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isWorking, elapsed, settleAfter]);

  // Trigger onSettle callback when finished
  const prevWorking = useRef(isWorking);
  useEffect(() => {
    if (prevWorking.current && !isWorking) {
      onSettle?.(elapsedDs / 10);
    }
    prevWorking.current = isWorking;
  }, [isWorking, elapsedDs, onSettle]);

  const toggle = hasTrace && collapsible;

  const renderGlyph = () => {
    if (glyph === 'none') return null;

    if (glyph === 'sparkle') {
      return (
        <span
          className={cn(
            'inline-flex items-center justify-center shrink-0 transition-transform duration-300',
            glyphColor ? '' : isWorking ? 'text-primary' : 'text-emerald-600 dark:text-emerald-400',
            isWorking && shimmer && 'animate-[thought-line-sparkle_1.6s_ease-in-out_infinite]'
          )}
          style={{ color: glyphColor || undefined }}
          aria-hidden="true"
        >
          {isWorking ? (
            <HugeiconsIcon icon={SparklesIcon} size={13} strokeWidth={2.2} />
          ) : (
            <HugeiconsIcon icon={Tick02Icon} size={13} strokeWidth={2.5} />
          )}
        </span>
      );
    }

    if (glyph === 'dot') {
      return (
        <span
          className={cn(
            'size-2 rounded-full shrink-0 transition-colors',
            isWorking ? 'bg-primary animate-ping' : 'bg-emerald-500'
          )}
          style={{ backgroundColor: glyphColor || undefined }}
          aria-hidden="true"
        />
      );
    }

    return (
      <span
        className="inline-flex items-center justify-center shrink-0"
        style={{ color: glyphColor || undefined }}
        aria-hidden="true"
      >
        {glyph}
      </span>
    );
  };

  const headerContent = (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-medium transition-all select-none',
        'border border-border/70 bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground',
        'dark:border-border/50 dark:bg-muted/30 dark:text-zinc-300 dark:hover:text-zinc-100',
        toggle && 'cursor-pointer'
      )}
      style={{
        fontSize: fontSize ? `${fontSize}px` : '12px',
        color: color || undefined,
      }}
    >
      {renderGlyph()}

      <span
        className={cn(
          'transition-opacity duration-200 tracking-tight leading-none',
          isWorking ? 'animate-[thought-line-pulse_1.8s_ease-in-out_infinite]' : 'opacity-90'
        )}
      >
        {isWorking
          ? renderLabel
            ? renderLabel(label, true)
            : label
          : renderLabel
            ? renderLabel(doneText, false)
            : doneText}
      </span>

      {showTimer && (
        <span
          className="font-mono tabular-nums text-[11px] opacity-75 dark:opacity-70 leading-none ml-0.5"
          aria-hidden="true"
        >
          {fmt(elapsedDs)}
        </span>
      )}

      {collapsible && hasTrace && (
        <span
          className={cn(
            'inline-flex items-center transition-transform duration-200 opacity-60 ml-0.5',
            open && 'rotate-180'
          )}
          aria-hidden="true"
        >
          <HugeiconsIcon icon={ArrowDown01Icon} size={11} strokeWidth={2.4} />
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn('inline-flex flex-col items-start leading-tight', className)}
      style={style}
    >
      <style>{STYLE}</style>

      {toggle ? (
        <button
          type="button"
          className="appearance-none border-0 bg-transparent p-0 text-left outline-none cursor-pointer"
          onClick={() => setOpen((prev) => !prev)}
          aria-expanded={open}
        >
          {headerContent}
        </button>
      ) : (
        headerContent
      )}

      {hasTrace && open && (
        <div className="flex flex-col gap-1 pt-1.5 pb-0.5 pl-3 text-[11px] font-normal text-muted-foreground animate-in fade-in slide-in-from-top-1 duration-200">
          {steps.map((text, i) => {
            const done = !isWorking || i < steps.length - 1;
            return (
              <div key={`${i}-${text}`} className="flex items-center gap-1.5">
                <span className="inline-grid size-3 place-items-center opacity-70" aria-hidden="true">
                  {done ? (
                    <HugeiconsIcon
                      icon={Tick02Icon}
                      size={10}
                      strokeWidth={2.5}
                      className="text-emerald-500"
                    />
                  ) : (
                    <span className="size-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </span>
                <span className={cn(done && 'opacity-70')}>{text}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ThoughtLine;
