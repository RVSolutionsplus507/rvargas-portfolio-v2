import type { FormEvent, KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import { FiLoader, FiSend } from "react-icons/fi";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { MAX_CONTENT_CHARS } from "@/services/assistantService";

interface ChatInputProps {
  draft: string;
  setDraft: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
  onSend: (raw: string) => void | Promise<void>;
  isProcessing: boolean;
}

const COUNTER_FROM = 400;

const ChatInput = ({ draft, setDraft, onKeyDown, onSend, isProcessing }: ChatInputProps) => {
  const { t } = useTranslation("virtualassistant");
  const canSend = draft.trim().length > 0 && !isProcessing;

  const handleSubmit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    if (canSend) onSend(draft);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="shrink-0 space-y-2 border-t border-border px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3"
    >
      <div className="flex items-end gap-2">
        <div className="min-w-0 flex-1">
          <label htmlFor="ambar-input" className="sr-only">
            {t("dialog.inputLabel")}
          </label>
          <Textarea
            id="ambar-input"
            data-autofocus=""
            rows={2}
            value={draft}
            maxLength={MAX_CONTENT_CHARS}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t("dialog.placeholder")}
            enterKeyHint="send"
            autoComplete="off"
            aria-describedby="ambar-input-hint"
            className="max-h-32 min-h-[3.25rem] resize-none text-base focus-visible:ring-2"
          />
        </div>
        <Button
          type="submit"
          disabled={!canSend}
          aria-label={t("dialog.send")}
          className="h-[3.25rem] w-12 shrink-0 px-0"
        >
          {isProcessing ? (
            <FiLoader className="h-5 w-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
          ) : (
            <FiSend className="h-5 w-5" aria-hidden="true" />
          )}
        </Button>
      </div>

      <p id="ambar-input-hint" className="text-right text-caption text-muted-foreground">
        <span className="sr-only">{t("dialog.enterHint")}</span>
        {draft.length >= COUNTER_FROM && t("dialog.counter", { count: draft.length, max: MAX_CONTENT_CHARS })}
      </p>
    </form>
  );
};

export default ChatInput;
