"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export interface DropdownOption {
  value: string;
  label: string;
  badge?: string | number;
  icon?: React.ReactNode;
}

interface CustomSelectDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: DropdownOption[];
  prefix?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  className?: string;
  align?: "start" | "end" | "center";
  menuClassName?: string;
}

export function CustomSelectDropdown({
  value,
  onChange,
  options,
  prefix,
  icon,
  placeholder = "Select...",
  className,
  align = "start",
  menuClassName,
}: CustomSelectDropdownProps) {
  const selectedOption = options.find((opt) => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            className={cn(
              "h-8 flex items-center justify-between gap-1.5 rounded-md border border-border bg-background px-2.5 text-xs text-foreground hover:bg-muted hover:border-primary/50 transition-colors select-none cursor-pointer focus:outline-none focus:border-primary",
              className
            )}
          />
        }
      >
        <div className="flex items-center gap-1.5 min-w-0">
          {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
          <span className="truncate">
            {prefix && <span className="text-muted-foreground">{prefix}</span>}
            <span className="font-medium">{displayLabel}</span>
          </span>
        </div>
        <ChevronDown className="size-3 text-muted-foreground shrink-0 opacity-70" />
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align={align}
        className={cn(
          "min-w-44 max-h-64 overflow-y-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-xl z-50",
          menuClassName
        )}
      >
        {options.map((opt) => {
          const isSelected = opt.value === value;
          return (
            <DropdownMenuItem
              key={opt.value}
              onClick={() => onChange(opt.value)}
              className={cn(
                "flex items-center justify-between text-xs cursor-pointer rounded px-2.5 py-1.5 transition-colors gap-2",
                isSelected
                  ? "bg-muted text-primary font-medium"
                  : "hover:bg-muted text-foreground"
              )}
            >
              <div className="flex items-center gap-1.5 truncate">
                {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                <span className="truncate">{opt.label}</span>
              </div>
              {opt.badge !== undefined && (
                <span className="rounded-full bg-muted px-1.5 py-0.2 text-[10px] text-muted-foreground shrink-0">
                  {opt.badge}
                </span>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
