import { RetryButton } from "@/components/chat/message-actions/retry-button";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import { APICallError } from "ai";

// Refusals from @promptfolio/ai arrive as an APICallError whose message is the server's visitor text.
export function isDailyLimit(error: Error) {
  return APICallError.isInstance(error) && error.statusCode === 429; // retrying can't help until tomorrow
}

export function ErrorText({ error }: { error: Error }) {
  return (
    <Bubble variant="ghost">
      <BubbleContent role="alert" className="text-destructive">
        {visitorText(error)}
      </BubbleContent>
    </Bubble>
  );
}

// Only text @promptfolio/ai wrote for visitors is shown as-is; anything else may hold internals.
function visitorText(error: Error) {
  // a refusal before the stream: the server's response text
  if (APICallError.isInstance(error)) return error.message;
  // a failure during the stream: the AI SDK wraps the server's errorText (with its ref) in a plain Error,
  // while a failed fetch is a TypeError and the SDK's own failures are AISDKError subclasses
  if (Object.getPrototypeOf(error) === Error.prototype && error.message) {
    return error.message;
  }
  return "Something went wrong. Please try again.";
}

// Shown in place of an answer when the request failed before any text arrived.
export function ErrorAnswer({
  error,
  onRetry,
}: {
  error: Error;
  onRetry?: () => void;
}) {
  return (
    <Message align="start">
      <MessageContent>
        <ErrorText error={error} />
        {onRetry && (
          <MessageFooter>
            <RetryButton onRetry={onRetry} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
