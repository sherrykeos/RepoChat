"use client";

import { useState } from "react";
import { ArrowUp, Database, Paperclip, Sparkles, Square } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";

export function ChatComposer({
  disabled,
  streaming,
  onSend,
  onStop,
  onSelectPrompt,
}: {
  disabled?: boolean;
  streaming?: boolean;
  onSend: (content: string) => void | Promise<void>;
  onStop?: () => void;
  onSelectPrompt?: (prompt: string) => void;
}) {
  const [value, setValue] = useState("");
  const [deepSearch, setDeepSearch] = useState(false);

  async function submit() {
    const content = value.trim();
    if (!content || disabled || streaming) return;
    setValue("");
    await onSend(content);
  }

  return (
    <div className="border-t border-border bg-background/95 p-4 backdrop-blur-md">
      <div className="mx-auto max-w-4xl space-y-3">
        {/* Input Card Container */}
        <div className="rounded-xl border border-border bg-card p-3 shadow-sm transition-all focus-within:border-primary/50 focus-within:ring-1 focus-within:ring-primary/50">
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Ask anything about this repository..."
            disabled={disabled}
            rows={2}
            className="w-full resize-none bg-transparent text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void submit();
              }
            }}
          />

          {/* Bottom Toolbar: Paperclip, Context Badge, Deep Search, Send Button */}
          <div className="mt-2 flex items-center justify-between border-t border-border/60 pt-2">
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Attach file or reference"
              >
                <Paperclip className="size-3.5" />
              </button>

              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/60 px-2.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                <Database className="size-3 text-primary" />
                <span>Context: Repository</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Deep Search Toggle */}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="text-[11px] font-medium">Deep Search</span>
                <Switch
                  checked={deepSearch}
                  onCheckedChange={setDeepSearch}
                  className="scale-75"
                />
              </div>

              {/* Send or Stop Button */}
              {streaming ? (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={onStop}
                  className="size-7 rounded-full p-0"
                >
                  <Square className="size-3" />
                </Button>
              ) : (
                <Button
                  size="sm"
                  disabled={disabled || !value.trim()}
                  onClick={() => void submit()}
                  className="size-7 rounded-full bg-primary p-0 text-primary-foreground hover:bg-primary/90"
                >
                  {disabled ? <Spinner className="size-3" /> : <ArrowUp className="size-3.5" />}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}