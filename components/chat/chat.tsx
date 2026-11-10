"use client";

import { Header } from "@/components/chat/header/header";
import { MessageList } from "@/components/chat/message-list";
import { PromptInput } from "@/components/chat/prompt-input";
import { ResumeChatButton } from "@/components/chat/resume-chat-button";
import { StarterQuestions } from "@/components/chat/starter-questions";
import { useAppContext } from "@/contexts/app-context";
import { type UIMessage, useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useEffect, useRef, useState } from "react";

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
  // whether the visitor has a stored conversation to offer on the start screen
  const [hasPrevious, setHasPrevious] = useState(false);
  // its messages are being fetched, after the visitor chose to continue it
  const [resuming, setResuming] = useState(false);
  // cancels that fetch when the visitor starts a new chat instead
  const resumeRequest = useRef<AbortController>(null);
  // the stored conversation once it has been fetched
  const [resumed, setResumed] = useState<StoredChat>();
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
  } = useChat({ id: resumed?.id, messages: resumed?.messages, transport });

  // Check whether the visitor has a stored conversation, to offer it on the start screen. A HEAD
  // request, so its messages are only fetched if the visitor continues it. The server finds it by cookie.
  useEffect(() => {
    let ignore = false;
    fetch("/api/chat", { method: "HEAD" })
      // 204: nothing stored
      .then((response) => response.status === 200)
      .catch(() => false) // the chat still works without the earlier conversation
      .then((stored) => {
        if (!ignore) setHasPrevious(stored);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const busy = status === "submitted" || status === "streaming";
  // the chat view opens as soon as the visitor continues, with a loader until the messages arrive
  const empty = messages.length === 0 && !resuming;
  const firstName = profile.name.split(" ")[0];
  const send = (text: string) => {
    // a new chat replaces the stored one on the server, so it can't be continued any more
    resumeRequest.current?.abort();
    setHasPrevious(false);
    setResuming(false);
    sendMessage({ text });
  };
  const resume = async () => {
    const request = new AbortController();
    resumeRequest.current = request;
    setResuming(true);
    try {
      const response = await fetch("/api/chat", { signal: request.signal });
      // 204: it expired or was replaced since the check, so there is nothing to continue
      if (response.status === 204) setHasPrevious(false);
      if (response.status === 200) {
        setResumed((await response.json()) as StoredChat);
        // it's open now, and the next new chat forgets it
        setHasPrevious(false);
      }
    } catch {
      // a failed fetch goes back to the start screen with the link, so it can be tried again;
      // an aborted one changes nothing
    }
    if (!request.signal.aborted) setResuming(false);
  };
  const newChat = async () => {
    // a stored chat still loading would open over the new one
    resumeRequest.current?.abort();
    setResuming(false);
    setHasPrevious(false);
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
            loading={resuming}
            busy={busy}
            thinking={status === "submitted"}
            error={error}
            onRetry={() => regenerate()}
          />
        )}

        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 px-4">
          <PromptInput busy={busy} onSend={send} onStop={stop} />
          {empty && <StarterQuestions firstName={firstName} onSelect={send} />}
          {empty && <ResumeChatButton visible={hasPrevious} onClick={resume} />}
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
