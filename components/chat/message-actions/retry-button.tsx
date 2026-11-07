import { MessageActionButton } from "@/components/chat/message-actions/message-action-button";
import { RotateCcwIcon } from "lucide-react";

export function RetryButton({ onRetry }: { onRetry: () => void }) {
  return (
    <MessageActionButton label="Retry answer" onClick={onRetry}>
      <RotateCcwIcon />
    </MessageActionButton>
  );
}
