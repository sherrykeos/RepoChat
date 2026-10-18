"use client";

import { useRef, useState, useEffect } from "react";
import { ArrowUp, Database, Reply, Sparkles, Square, X } from "lucide-react";

import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function ChatComposer({
  disabled,
  streaming,
  onSend,
  onStop,
  onSelectPrompt,
  replyContext,
  onClearReply,
}: {
  disabled?: boolean;
  streaming?: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStop?: () => void;
  onSelectPrompt?: (prompt: string) => void;
  replyContext?: string | null;
  onClearReply?: () => void;
}) {
  const [value, setValue] = useState("");
  const [deepSearch, setDeepSearch] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus textarea when replying
  useEffect(() => {
    if (replyContext && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [replyContext]);

  function handleInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    setValue(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 160)}px`;
    }
  }

  async function submit() {
    const content = value.trim();
    if (!content || disabled || streaming) return;
    const finalContent = replyContext ? `> Replying to: ${replyContext}\n\n${content}` : content;
    setValue("");
    onClearReply?.();
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
    await onSend(finalContent);
  }

  const canSubmit = Boolean(value.trim()) && !disabled && !streaming;

  return (
    <div className="bg-card px-3 pb-2.5 pt-1 sm:px-6 sm:pb-3.5">
      <div className="mx-auto max-w-3xl">
        <div className="relative flex flex-col rounded-2xl border border-border bg-background p-2 sm:p-2.5 shadow-md transition-all focus-within:border-primary/70 focus-within:ring-1 focus-within:ring-primary/20">
          {replyContext && (
            <div className="mb-2 flex items-center justify-between rounded-xl border border-border/70 bg-muted/60 px-2.5 py-1 text-xs text-muted-foreground animate-in fade-in duration-150">
              <div className="flex items-center gap-1.5 truncate">
                <Reply className="size-3 text-primary shrink-0" />
                <span className="truncate italic">Replying to: &ldquo;{replyContext}&rdquo;</span>
              </div>
              <button
                type="button"
                onClick={onClearReply}
                className="ml-2 rounded p-0.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                title="Cancel reply"
              >
                <X className="size-3" />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleInput}
            placeholder="Ask anything about this repository..."
            disabled={disabled}
            rows={1}
            className="w-full resize-none bg-transparent px-1.5 py-1 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[32px] max-h-36 leading-relaxed [scrollbar-width:thin]"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
          />

          {/* Compact Bottom Toolbar (No internal divider line, sleek spacing) */}
          <div className="mt-1 flex items-center justify-between gap-2 px-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                <Database className="size-2.5 text-primary" />
                <span>Repository Context</span>
              </span>

              <label className="flex items-center gap-1 text-[11px] text-muted-foreground hover:text-foreground transition-colors cursor-pointer select-none">
                <span>Deep Search</span>
                <Switch
                  size="sm"
                  checked={deepSearch}
                  onCheckedChange={setDeepSearch}
                  className="scale-75"
                />
              </label>
            </div>

            {/* ChatGPT / Claude Style Circular Send Button */}
            <div>
              {streaming ? (
                <button
                  type="button"
                  onClick={onStop}
                  className="flex size-7 items-center justify-center rounded-full bg-foreground text-background hover:bg-foreground/90 shadow-sm transition-transform active:scale-95"
                  title="Stop generating"
                >
                  <Square className="size-3 fill-current" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!canSubmit}
                  onClick={() => void submit()}
                  className={cn(
                    "flex size-7 items-center justify-center rounded-full transition-all duration-150",
                    canSubmit
                      ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md active:scale-95 cursor-pointer"
                      : "bg-muted text-muted-foreground/40 cursor-not-allowed"
                  )}
                  title={canSubmit ? "Send message (Enter)" : "Type a message"}
                >
                  {disabled ? (
                    <Spinner className="size-3" />
                  ) : (
                    <ArrowUp className="size-3.5 stroke-[2.5]" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Subtle AI Disclaimer */}
        <p className="mt-1.5 text-center text-[10px] text-muted-foreground/60 select-none">
          RepoChat can make mistakes. Verify critical code and references.
        </p>
      </div>
    </div>
  );
}