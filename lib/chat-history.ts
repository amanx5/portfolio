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

type StoredChat = { id: string; messages: UIMessage[] };

// One conversation per visitor, in one key under the owner: the site shows a single chat, so a new
// chat replaces the stored one. The cookie alone then finds it again after a reload.
// Each save resets the expiry.
export const chatStore: ChatStore = {
  async load(owner, chatId) {
    const stored = await storedChat(owner);
    // an older chat's id (for example from another tab) no longer finds anything
    return stored?.id === chatId ? stored.messages : undefined;
  },
  async save(owner, chatId, messages) {
    const chat: StoredChat = { id: chatId, messages };
    await redis.set(`${KEY_PREFIX}:${owner}`, chat, { ex: RETENTION_SECONDS });
  },
};

// Forgets the visitor's stored conversation, when they start a new chat.
export async function deleteStoredChat(owner: string): Promise<void> {
  await redis.del(`${KEY_PREFIX}:${owner}`);
}

// The id of the visitor's stored conversation, if there is one.
export async function storedChatId(owner: string): Promise<string | undefined> {
  return (await storedChat(owner))?.id;
}

async function storedChat(owner: string): Promise<StoredChat | undefined> {
  // Upstash parses the JSON back; @promptfolio/ai validates the messages before use
  const stored = await redis.get<StoredChat>(`${KEY_PREFIX}:${owner}`);
  // read by shape: anything else under the key counts as no conversation
  return typeof stored?.id === "string" && Array.isArray(stored.messages) ? stored : undefined;
}

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
