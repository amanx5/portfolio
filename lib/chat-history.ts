import "server-only";
import { randomBytes } from "node:crypto";
import type { ChatStore } from "@promptfolio/ai";
import type { UIMessage } from "ai";
import { redis } from "@/lib/redis";

const KEY_PREFIX = "chat:history";
const OWNER_COOKIE = "chat-owner";
// what newOwnerId makes: 16 random bytes, base64url; anything else in the cookie is ignored
const OWNER_PATTERN = /^[A-Za-z0-9_-]{22}$/;
export const RETENTION_SECONDS = 24 * 60 * 60;

// One key per conversation, under the owner and the chat id together, so one visitor's chat id
// never finds another visitor's conversation. Each save resets the expiry.
export const chatStore: ChatStore = {
  async load(owner, chatId) {
    // Upstash parses the JSON back; @promptfolio/ai validates the messages before use
    const messages = await redis.get<UIMessage[]>(`${KEY_PREFIX}:${owner}:${chatId}`);
    return messages ?? undefined;
  },
  async save(owner, chatId, messages) {
    await redis.set(`${KEY_PREFIX}:${owner}:${chatId}`, messages, { ex: RETENTION_SECONDS });
  },
};

// random and unguessable, because it is the only key to a visitor's conversations
export function newOwnerId(): string {
  return randomBytes(16).toString("base64url");
}

export function readOwner(request: Request): string | undefined {
  for (const pair of (request.headers.get("cookie") ?? "").split(";")) {
    const [name, value] = pair.trim().split("=");
    if (name === OWNER_COOKIE) return value && OWNER_PATTERN.test(value) ? value : undefined;
  }
  return undefined;
}

// HttpOnly: page scripts can't read it. SameSite=Lax: other sites' requests don't carry it.
// Secure outside development, where the page is served over plain HTTP.
export function ownerCookie(owner: string): string {
  return [
    `${OWNER_COOKIE}=${owner}`,
    "Path=/",
    `Max-Age=${RETENTION_SECONDS}`,
    "HttpOnly",
    "SameSite=Lax",
    ...(process.env.NODE_ENV === "production" ? ["Secure"] : []),
  ].join("; ");
}
