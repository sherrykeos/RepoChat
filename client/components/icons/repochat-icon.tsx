import React from "react";
import { cn } from "@/lib/utils";

export type RepoChatIconProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  variant?: "color" | "mono";
};

export function RepoChatIcon({
  className,
  variant = "color",
  alt = "RepoChat",
  ...props
}: RepoChatIconProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/RepoChat_logo1.png"
      alt={alt}
      className={cn("shrink-0 object-contain", className)}
      {...props}
    />
  );
}

export function RepoChatLogo({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("inline-flex items-center gap-2.5", className)} {...props}>
      <RepoChatIcon className="size-8" />
      <span className="font-heading text-lg font-bold tracking-tight text-foreground">
        RepoChat
      </span>
    </div>
  );
}
