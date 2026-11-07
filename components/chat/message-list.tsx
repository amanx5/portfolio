import { Answer } from "@/components/chat/answer";
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
}: {
  messages: UIMessage[];
  busy: boolean;
}) {
  return (
    <MessageScrollerProvider scrollPreviousItemPeek={0}>
      <MessageScroller className="flex-1">
        <MessageScrollerViewport>
          <MessageScrollerContent
            aria-busy={busy}
            className="mx-auto w-full max-w-xl gap-6 px-4"
          >
            {messages.map((m, i) => (
              <MessageScrollerItem
                key={m.id}
                messageId={m.id}
                scrollAnchor={m.role === "user"}
                className="[content-visibility:visible]"
              >
                <ChatMessage
                  message={m}
                  showActions={!(busy && i === messages.length - 1)}
                />
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
}: {
  message: UIMessage;
  showActions: boolean;
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

        {!isUser && showActions && text && (
          <MessageFooter>
            <MessageActions text={text} />
          </MessageFooter>
        )}
      </MessageContent>
    </Message>
  );
}
