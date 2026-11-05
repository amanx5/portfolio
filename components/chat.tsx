"use client";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Message, MessageContent } from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { useAppContext } from "@/contexts/app-context";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { ArrowUpIcon, SquareIcon } from "lucide-react";
import { useRef, useState, type JSX } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

const disclaimer =
  "Replies come from an AI model and aren't stored here. A hash of your IP is kept for 24 hours to limit daily messages. Don't share personal information.";

export function Chat() {
  const { messages, sendMessage, status, error, stop } = useChat();
  const [input, setInput] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const busy = status === "submitted" || status === "streaming";
  const canSend = input.trim().length > 0 && !busy;

  return (
    <div className="flex h-dvh w-full flex-col gap-4 py-8">
      <MessageScrollerProvider>
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
                >
                  <ChatMessage message={m} />
                </MessageScrollerItem>
              ))}
            </MessageScrollerContent>
          </MessageScrollerViewport>
          <MessageScrollerButton />
        </MessageScroller>
      </MessageScrollerProvider>

      <div className="mx-auto w-full max-w-xl px-4">
        {error && <p className="text-destructive">{error.message}</p>}
        <form
          ref={formRef}
          onSubmit={(e) => {
            e.preventDefault();
            if (!canSend) return;
            sendMessage({ text: input });
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
              placeholder="Ask assistant"
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
                  onClick={() => stop()}
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
        <p className="mt-2 text-xs text-muted-foreground">{disclaimer}</p>
      </div>
    </div>
  );
}

function ChatMessage({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  const text = message.parts
    .map((part) => (part.type === "text" ? part.text : ""))
    .join("");

  return (
    <Message align={isUser ? "end" : "start"}>
      <MessageContent>
        {isUser ? <Question>{text}</Question> : <Answer>{text}</Answer>}
      </MessageContent>
    </Message>
  );
}

function Question({ children }: { children: string }) {
  return (
    <Bubble align="end" variant="muted">
      <BubbleContent>{children}</BubbleContent>
    </Bubble>
  );
}

function Answer({ children }: { children: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={{ a: Anchor }}>
      {children}
    </Markdown>
  );
}

function Anchor({ href, children }: JSX.IntrinsicElements["a"]) {
  const ctx = useAppContext();

  // profileLinkUrls returns URLs in normalized form, so https://github.com and https://github.com/ (with trailing /)
  // should count as the same link. Comparing the raw href would treat them as different.
  if (
    !href ||
    !URL.canParse(href) ||
    !ctx.profile.allUrls.has(new URL(href).href)
  ) {
    return children;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="underline"
    >
      {children}
    </a>
  );
}
