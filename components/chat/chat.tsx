"use client";

import { Header } from "@/components/chat/header/header";
import { MessageList } from "@/components/chat/message-list";
import { PromptInput } from "@/components/chat/prompt-input";
import { StarterQuestions } from "@/components/chat/starter-questions";
import { useAppContext } from "@/contexts/app-context";
import { useChat } from "@ai-sdk/react";

const disclaimer =
  "Replies come from an AI model and aren't stored here. A hash of your IP is kept for 24 hours to limit daily messages. Don't share personal information.";

export function Chat() {
  const { profile } = useAppContext();
  const {
    messages,
    sendMessage,
    status,
    error,
    stop,
    setMessages,
    clearError,
    regenerate,
  } = useChat();

  const busy = status === "submitted" || status === "streaming";
  const empty = messages.length === 0;
  const firstName = profile.name.split(" ")[0];
  const send = (text: string) => sendMessage({ text });
  const newChat = async () => {
    await stop(); // a reply still streaming would add its message back
    setMessages([]);
    clearError();
  };

  return (
    <div className="flex h-dvh w-full flex-col gap-4 pb-8">
      <Header
        name={profile.name}
        headline={profile.headline}
        website={profile.website}
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

      <p className="mx-auto w-full max-w-xl px-4 text-xs text-muted-foreground">
        {disclaimer}
      </p>
    </div>
  );
}
