"use client";

import * as React from "react";
import * as ResizablePrimitive from "react-resizable-panels";
import { cn } from "@/lib/utils";

function ResizablePanelGroup({
  className,
  ...props
}: ResizablePrimitive.GroupProps) {
  return (
    <ResizablePrimitive.Group
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full aria-[orientation=vertical]:flex-col",
        className
      )}
      {...props}
    />
  );
}

function ResizablePanel({
  style,
  className,
  ...props
}: ResizablePrimitive.PanelProps) {
  return (
    <ResizablePrimitive.Panel
      data-slot="resizable-panel"
      className={cn("h-full min-h-0", className)}
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        minHeight: 0,
        ...style,
      }}
      {...props}
    />
  );
}

function ResizableHandle({
  withHandle,
  className,
  children,
  ...props
}: ResizablePrimitive.SeparatorProps & {
  withHandle?: boolean;
  children?: React.ReactNode;
}) {
  return (
    <ResizablePrimitive.Separator
      data-slot="resizable-handle"
      className={cn(
        "relative flex shrink-0 items-center justify-center transition-colors select-none focus-visible:outline-none",
        "aria-[orientation=vertical]:w-2.5 sm:aria-[orientation=vertical]:w-3 aria-[orientation=vertical]:cursor-col-resize aria-[orientation=vertical]:h-full",
        "aria-[orientation=horizontal]:h-2.5 sm:aria-[orientation=horizontal]:h-3 aria-[orientation=horizontal]:cursor-row-resize aria-[orientation=horizontal]:w-full",
        className
      )}
      {...props}
    >
      {children ? (
        children
      ) : withHandle ? (
        <div className="z-10 flex h-8 w-1 shrink-0 rounded-full bg-border hover:bg-primary transition-colors" />
      ) : (
        <div className="z-10 flex h-8 w-1 shrink-0 rounded-full bg-border/70 hover:bg-primary transition-colors" />
      )}
    </ResizablePrimitive.Separator>
  );
}

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
