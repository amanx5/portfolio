import { Answer } from "@/components/chat/answer";
import {
  ErrorAnswer,
  ErrorText,
  cannotRetry,
} from "@/components/chat/chat-error";
import { Lookups } from "@/components/chat/lookups";
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
import { isToolUIPart } from "ai";

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
  const retry = error && cannotRetry(error) ? undefined : onRetry;
  const last = messages.at(-1);
  const lastId = last?.id;
  // The reply's message is added empty before its first lookup or text arrives. "Thinking…" stays
  // under the question until then, so it doesn't jump below that empty message.
  const lastUserId = messages.findLast((m) => m.role === "user")?.id;
  const waiting =
    thinking ||
    (busy &&
      !last?.parts.some(
        (part) => isToolUIPart(part) || (part.type === "text" && part.text),
      ));

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
                  streaming={busy && m.id === lastId}
                  showActions={!(busy && m.id === lastId)}
                  // only the last answer: regenerating an earlier one would drop everything after it
                  onRetry={m.id === lastId ? retry : undefined}
                  error={m.id === lastId ? error : undefined}
                />
                {/* both rows below are positioned out of the layout, so swapping or removing them doesn't shrink the content and jump the scroll */}
                {waiting && m.id === lastUserId && (
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
  streaming,
  showActions,
  onRetry,
  error,
}: {
  message: UIMessage;
  streaming: boolean;
  showActions: boolean;
  onRetry?: () => void;
  error?: Error;
}) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");
  // @promptfolio/ai sends the answering model's name as metadata when the reply finishes
  const { model } = (message.metadata ?? {}) as { model?: string };
  // The lookups are done but no words have arrived yet: the model is reading what it found, or
  // deciding on another lookup. Shown where the answer will start, so the first words don't move it.
  // (While a lookup runs, its header already says so.)
  const lookups = message.parts.filter(isToolUIPart);
  const thinking =
    streaming &&
    !text &&
    lookups.length > 0 &&
    lookups.every((part) => part.state === "output-available");

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        {!isUser && <Lookups parts={message.parts} />}
        <Bubble
          align={isUser ? "end" : "start"}
          variant={isUser ? "muted" : "ghost"}
        >
          <BubbleContent>
            {isUser ? (
              text
            ) : thinking ? (
              <span role="status" className="shimmer text-sm text-muted-foreground">
                Thinking…
              </span>
            ) : (
              <Answer>{text}</Answer>
            )}
          </BubbleContent>
        </Bubble>

        {/* an answer that failed partway keeps its text, with the error under it */}
        {!isUser && error && <ErrorText error={error} />}

        {!isUser && showActions && text && (
          <MessageFooter className="gap-2">
            <MessageActions text={text} onRetry={onRetry} />
            {model && <span className="font-normal">{model}</span>}
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
