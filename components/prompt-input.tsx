import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useRef, useState } from "react";

export function PromptInput({
  busy,
  onSend,
  onStop,
}: {
  busy: boolean;
  onSend: (text: string) => void;
  onStop: () => void;
}) {
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const canSend = input.trim().length > 0 && !busy;

  return (
    <form
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        if (!canSend) return;
        onSend(input);
        setInput("");
      }}
    >
      <InputGroup>
        <InputGroupTextarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.shiftKey &&
              !e.nativeEvent.isComposing
            ) {
              e.preventDefault();
              formRef.current?.requestSubmit();
            }
          }}
          autoFocus
          placeholder="Ask anything"
          aria-label="Message"
          className="min-h-0 max-h-48 [scrollbar-width:thin]"
        />
        <InputGroupAddon align="inline-end" className="self-end pl-2">
          {busy ? (
            <InputGroupButton
              type="button"
              variant="default"
              size="icon-sm"
              aria-label="Stop reply"
              onClick={onStop}
            >
              <SquareIcon />
            </InputGroupButton>
          ) : (
            <InputGroupButton
              type="submit"
              variant="default"
              size="icon-sm"
              aria-label="Send message"
              disabled={!canSend}
            >
              <ArrowUpIcon />
            </InputGroupButton>
          )}
        </InputGroupAddon>
      </InputGroup>
    </form>
  );
}
