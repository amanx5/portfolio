"use client";

import { Header } from "@/components/header/header";
import { MessageList } from "@/components/chat/message-list";
import { PromptInput } from "@/components/prompt-input";
import { ResumeChatButton } from "@/components/home/resume-chat-button";
import { StarterQuestions } from "@/components/home/starter-questions";
import { useAppContext } from "@/contexts/app-context";
import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport, generateId } from "ai";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

// a conversation the server kept, as /chat/<id> loads it
export type StoredChat = { id: string; messages: UIMessage[] };

const disclaimer =
  "Replies come from an AI model. This chat is kept for 24 hours so it can continue, and a hash of your IP for 24 hours to limit daily messages. Don't share personal information.";

// the server keeps the conversation, so only the new question and the message it follows are sent
const transport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ id, messages }) => ({
    body: { id, message: messages.at(-1), parentId: messages.at(-2)?.id ?? null },
  }),
});

// `stored` is the chat that /chat/<id> opened; without it, a new chat starts.
export function Chat({ stored }: { stored?: StoredChat }) {
  const { profile } = useAppContext();
  // The chat on screen. A new id makes useChat start over.
  const [chat, setChat] = useState<StoredChat | undefined>(stored);
  // A chat begun on / stays on that page after its address becomes /chat/<id>, so the header's
  // Chat link back to / keeps the same page on screen; it is cleared here instead. Leaving / for
  // /chat/<id> doesn't count, only coming back to it. Only the chat begun on / starts over:
  // Next.js keeps a page it left mounted but hidden, so a chat opened at /chat/<id> also sees the
  // path become / and must keep its messages for when it is shown again.
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);
  if (pathname !== shownPath) {
    setShownPath(pathname);
    if (pathname === "/" && !stored) setChat({ id: generateId(), messages: [] });
  }
  // the id of the visitor's stored conversation, to offer it on the start screen
  const [previousId, setPreviousId] = useState<string>();
  const conversation = useChat({ id: chat?.id, messages: chat?.messages, transport });
  // Not `id`: without one given, useChat makes it when it is first read. Read only in effects,
  // it is made in the browser; the start screen is prerendered, so one made while rendering
  // would be shared by every visitor.
  const { messages, sendMessage, status, error, stop, regenerate } = conversation;

  // Look up the visitor's stored conversation, to offer it on the start screen. The server finds it
  // by cookie; only its id comes back, and the link opens it at /chat/<id>. Not needed when /chat/<id>
  // has already opened it. Asked again when the chat starts over, so the one just left is offered.
  useEffect(() => {
    if (stored) return;
    let ignore = false;
    fetch("/api/chat")
      // 204: nothing stored
      .then((response) => (response.status === 200 ? response.json() : undefined))
      .then((found?: { id: string }) => {
        if (!ignore) setPreviousId(found?.id);
      })
      .catch(() => {}); // the chat still works without the earlier conversation
    return () => {
      ignore = true;
    };
  }, [stored, chat]);

  // Once the chat has messages, the address names it, as /chat/<id>. replaceState changes the address
  // without loading the page, so the reply keeps streaming, and keeps the start screen out of
  // history, so Back leaves the site instead of showing an empty chat.
  const hasMessages = messages.length > 0;
  useEffect(() => {
    if (!hasMessages) return;
    const path = `/chat/${conversation.id}`;
    if (window.location.pathname !== path) window.history.replaceState(null, "", path);
  }, [conversation, hasMessages]);

  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;
  const firstName = profile.name.split(" ")[0];
  const send = (text: string) => {
    // a new chat replaces the stored one on the server, so it can't be continued any more
    setPreviousId(undefined);
    sendMessage({ text });
  };

  return (
    <div className="flex h-dvh w-full flex-col gap-4 pb-8">
      <Header
        name={profile.name}
        headline={profile.headline}
        links={profile.links}
        avatarUrl={profile.avatarUrl}
      />
      {/* same tree in both states, so the textarea keeps focus after the first send */}
      <main
        className={`flex min-h-0 flex-1 flex-col ${empty ? "justify-center gap-6" : "gap-4"}`}
      >
        {empty ? (
          <h2 className="px-4 text-center text-2xl font-medium">
            What would you like to know about {firstName}?
          </h2>
        ) : (
          <MessageList
            messages={messages}
            busy={busy}
            thinking={status === "submitted"}
            error={error}
            onRetry={() => regenerate()}
          />
        )}

        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4">
          {/* keyed by the chat, so starting over from the header's Chat link mounts it again and
              autoFocus puts the cursor back in it */}
          <PromptInput key={chat?.id} busy={busy} onSend={send} onStop={stop} />
          {empty && <StarterQuestions firstName={firstName} onSelect={send} />}
          {empty && <ResumeChatButton chatId={previousId} />}
        </div>
      </main>

      <p className="mx-auto w-full max-w-xl px-4 text-xs text-muted-foreground">
        {disclaimer} Powered by{" "}
        <a
          href="https://github.com/promptfolios/promptfolio"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-2 hover:text-foreground"
        >
          Promptfolio
        </a>
        .
      </p>
    </div>
  );
}
