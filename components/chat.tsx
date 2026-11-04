"use client";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Message, MessageContent } from "@/components/ui/message";
import { useAppContext } from "@/contexts/app-context";
import { useChat, type UIMessage } from "@ai-sdk/react";
import { useState, type JSX } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Chat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto p-16 flex w-full max-w-xl flex-col gap-4">
      {/* messages */}
      {messages.map((m) => (
        <ChatMessage key={m.id} message={m} />
      ))}

      {/* error */}
      {error && <p className="text-red-600">{error.message}</p>}

      {/* prompt form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!input.trim() || busy) return;
          sendMessage({ text: input });
          setInput("");
        }}
      >
        <input
          className="w-full border p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask assistant"
        />
      </form>

      <p className="text-xs text-zinc-500">
        Messages are sent to an AI model through Vercel AI Gateway to generate
        replies, and are not stored by this site. To prevent abuse, a keyed hash
        of your IP address is kept for up to 24 hours to count daily messages.
        Please don't share personal information here.
      </p>
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
