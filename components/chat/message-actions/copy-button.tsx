import { MessageActionButton } from "@/components/chat/message-actions/message-action-button";
import { CheckIcon, CopyIcon } from "lucide-react";
import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      return; // the browser can deny clipboard access; then there's nothing copied to confirm
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <MessageActionButton label={copied ? "Copied" : "Copy answer"} onClick={copy}>
      {copied ? <CheckIcon /> : <CopyIcon />}
    </MessageActionButton>
  );
}
