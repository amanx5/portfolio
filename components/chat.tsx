"use client";

import { useChat } from "@ai-sdk/react";
import { useState } from "react";

export function Chat() {
  const { messages, sendMessage, status, error } = useChat();
  const [input, setInput] = useState("");
  const busy = status === "submitted" || status === "streaming";

  return (
    <div className="mx-auto p-16 flex w-full max-w-xl flex-col gap-4">
      {/* messages */}
      {messages.map((message) => (
        <div key={message.id}>
          <strong>{message.role === "user" ? "You" : "Assistant"}:</strong>{" "}
          {message.parts.map((part, i) =>
            part.type === "text" ? <span key={i}>{part.text}</span> : null,
          )}
        </div>
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
    </div>
  );
}
