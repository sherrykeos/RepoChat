"use client";

import { code } from "@streamdown/code";
import { Streamdown, type Components } from "streamdown";

import { cn } from "@/lib/utils";

import "./chat-markdown.css";
import "streamdown/styles.css";

const streamdownPlugins = { code };

const defaultComponents: Components = {
  img: ({ node, src, alt, className, ...props }: any) => {
    if (!src) return null;
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt || ""}
        className={cn(
          "max-w-full h-auto rounded-md inline-block my-1 align-middle",
          className
        )}
        loading="lazy"
        {...props}
      />
    );
  },
};

export function ChatMarkdown({
  content,
  isStreaming = false,
  className,
  components,
}: {
  content: string;
  isStreaming?: boolean;
  className?: string;
  components?: Components;
}) {
  return (
    <Streamdown
      className={cn("chat-markdown max-w-none text-sm leading-relaxed", className)}
      mode={isStreaming ? "streaming" : "static"}
      plugins={streamdownPlugins}
      shikiTheme={["github-light", "github-dark"]}
      isAnimating={isStreaming}
      components={{
        ...defaultComponents,
        ...components,
      }}
    >
      {content}
    </Streamdown>
  );
}