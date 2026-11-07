import { CopyButton } from "@/components/chat/message-actions/copy-button";
import { RetryButton } from "@/components/chat/message-actions/retry-button";

export function MessageActions({
  text,
  onRetry,
}: {
  text: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex gap-1">
      <CopyButton text={text} />
      {onRetry && <RetryButton onRetry={onRetry} />}
    </div>
  );
}
