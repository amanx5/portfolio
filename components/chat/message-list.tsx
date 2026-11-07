import { Answer } from "@/components/chat/answer";
import {
  ErrorAnswer,
  ErrorText,
  isDailyLimit,
} from "@/components/chat/chat-error";
import { MessageActions } from "@/components/chat/message-actions/message-actions";
import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  Message,
  MessageContent,
  MessageFooter,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { type UIMessage } from "@ai-sdk/react";

export function MessageList({
  messages,
  busy,
  thinking,
  error,
  onRetry,
}: {
  messages: UIMessage[];
  busy: boolean;
  thinking: boolean;
  error?: Error;
  onRetry: () => void;
}) {
  const retry = error && isDailyLimit(error) ? undefined : onRetry;
  const lastId = messages.at(-1)?.id;

  return (
    <MessageScrollerProvider scrollPreviousItemPeek={0}>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent
            aria-busy={busy}
            className="mx-auto w-full max-w-xl gap-6 px-4"
          >
            {messages.map((m) => (
              <MessageScrollerItem
                key={m.id}
                messageId={m.id}
                scrollAnchor={m.role === "user"}
                className="relative [content-visibility:visible]"
              >
                <ChatMessage
                  message={m}
                  showActions={!(busy && m.id === lastId)}
                  // only the last answer: regenerating an earlier one would drop everything after it
                  onRetry={m.id === lastId ? retry : undefined}
                  error={m.id === lastId ? error : undefined}
                />
                {/* both rows below are positioned out of the layout, so swapping or removing them doesn't shrink the content and jump the scroll */}
                {thinking && m.id === lastId && (
                  <div
                    role="status"
                    className="absolute top-full left-0 mt-6 shimmer text-sm text-muted-foreground"
                  >
                    Thinking…
                  </div>
                )}
                {error && m.id === lastId && m.role === "user" && (
                  <div className="absolute inset-x-0 top-full mt-6">
                    <ErrorAnswer error={error} onRetry={retry} />
                  </div>
                )}
              </MessageScrollerItem>
            ))}
          </MessageScrollerContent>
        </MessageScrollerViewport>
        <MessageScrollerButton />
      </MessageScroller>
    </MessageScrollerProvider>
  );
}

function ChatMessage({
  message,
  showActions,
  onRetry,
  error,
}: {
  message: UIMessage;
  showActions: boolean;
  onRetry?: () => void;
  error?: Error;
}) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        <Bubble
          align={isUser ? "end" : "start"}
          variant={isUser ? "muted" : "ghost"}
        >
          <BubbleContent>
            {isUser ? text : <Answer>{text}</Answer>}
          </BubbleContent>
        </Bubble>

        {/* an answer that failed partway keeps its text, with the error under it */}
        {!isUser && error && <ErrorText error={error} />}

        {!isUser && showActions && text && (
          <MessageFooter>
            <MessageActions text={text} onRetry={onRetry} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
