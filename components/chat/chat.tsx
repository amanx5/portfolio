"use client";

import { Header } from "@/components/chat/header/header";
import { MessageList } from "@/components/chat/message-list";
import { PromptInput } from "@/components/chat/prompt-input";
import { StarterQuestions } from "@/components/chat/starter-questions";
import { useAppContext } from "@/contexts/app-context";
import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Spinner } from "@/components/ui/spinner";
import { useEffect, useState } from "react";

// what GET /api/chat returns
type StoredChat = { id: string; messages: UIMessage[] };

const disclaimer =
  "Replies come from an AI model. This chat is kept for 24 hours so it can continue, and a hash of your IP for 24 hours to limit daily messages. Don't share personal information.";

// the server keeps the conversation, so only the new question and the message it follows are sent
const transport = new DefaultChatTransport({
  api: "/api/chat",
  prepareSendMessagesRequest: ({ id, messages }) => ({
    body: { id, message: messages.at(-1), parentId: messages.at(-2)?.id ?? null },
  }),
});

export function Chat() {
  const { profile } = useAppContext();
  const [stored, setStored] = useState<StoredChat>();
  // until the server has said whether a chat is stored, neither the start screen nor a chat is shown,
  // so a returning visitor doesn't see the start screen flash before their chat
  const [loading, setLoading] = useState(true);
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
    clearError,
    regenerate,
    // a new id makes useChat start over from these messages, which is how the stored chat is shown
  } = useChat({ id: stored?.id, messages: stored?.messages, transport });

  // Show the visitor's stored conversation again after a reload. The server finds it by cookie.
  useEffect(() => {
    let ignore = false;
    fetch("/api/chat")
      // 204: nothing stored
      .then((response) => (response.status === 200 ? response.json() : undefined))
      .catch(() => undefined) // the chat still works without the earlier conversation
      .then((chat?: StoredChat) => {
        if (ignore) return;
        if (chat) setStored(chat);
        setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;
  const firstName = profile.name.split(" ")[0];
  const send = (text: string) => sendMessage({ text });
  const newChat = async () => {
    await stop(); // a reply still streaming would add its message back
    setMessages([]);
    clearError();
    // forget the stored chat too, so a reload doesn't bring it back; if this fails,
    // the first message of the new chat replaces it anyway
    fetch("/api/chat", { method: "DELETE" }).catch(() => {});
  };

  return (
    <div className="flex h-dvh w-full flex-col gap-4 pb-8">
      <Header
        name={profile.name}
        headline={profile.headline}
        links={profile.links}
        avatarUrl={profile.avatarUrl}
        showNewChat={!empty}
        onNewChat={newChat}
      />
      {loading ? (
        <main className="flex min-h-0 flex-1 items-center justify-center">
          <Spinner className="size-5 text-muted-foreground" />
        </main>
      ) : (
      /* same tree in both states, so the textarea keeps focus after the first send */
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
          <PromptInput busy={busy} onSend={send} onStop={stop} />
          {empty && <StarterQuestions firstName={firstName} onSelect={send} />}
        </div>
      </main>
      )}

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
