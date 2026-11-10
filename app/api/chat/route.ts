import { handleChatRequest } from "@promptfolio/ai";
import { gateway } from "ai";
import {
  chatStore,
  deleteStoredChat,
  newOwnerId,
  ownerCookie,
  readOwner,
  storedChatId,
} from "@/lib/chat-history";
import { chatLimiter } from "@/lib/chat-limit";
import { loadProfile } from "@/lib/github-source";
import { replyDetails } from "@/lib/reply-details";
import { identifyVisitor } from "@/lib/visitor";

// the id is not checked here: the gateway rejects an unknown id with a 404 "Model not found",
// which is clearer than a local list that goes stale. A separate call to validate it first
// is not worth the extra round trip on every chat request
const modelId = process.env.MODEL_ID ?? "nvidia/nemotron-3.5-lightning-free";

// lets local dev skip chat turn limits; never honoured in production
const chatLimitDisabled =
  process.env.NODE_ENV !== "production" && process.env.DISABLE_CHAT_LIMIT === "1";

// max duration this serverless route handler is allowed to run
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  // also schedules the GitHub refresh for after the answer has been sent, if one is due
  const profileResult = await loadProfile();
  if (!profileResult.ok) {
    return new Response(
      "Failed to load the profile data. Please try again later.",
      { status: 500 },
    );
  }

  // a visitor without the cookie gets a new owner id; its first question starts a conversation under it
  const owner = readOwner(request) ?? newOwnerId();

  const response = await handleChatRequest(request, {
    model: gateway(modelId),
    profile: profileResult.profile,
    limit: chatLimitDisabled ? null : { limiter: chatLimiter, identifyVisitor },
    history: { store: chatStore, identifyOwner: async () => owner },
    replyDetails,
  });
  // sent on every answer, so the cookie lasts as long as the conversations it names
  response.headers.append("set-cookie", ownerCookie(owner));
  return response;
}

// The id of the visitor's stored conversation, so the start screen can link to it at /chat/<id>, where
// its messages are loaded. The owner cookie alone finds it. 204 when there is none (a new visitor,
// or after it expired), which is the usual case and not an error.
export async function GET(request: Request): Promise<Response> {
  const owner = readOwner(request);
  if (owner === undefined) return new Response(null, { status: 204 });

  try {
    const id = await storedChatId(owner);
    if (id === undefined) return new Response(null, { status: 204 });
    // private to this visitor, so it must never be cached and served to another
    return Response.json({ id }, { headers: { "cache-control": "no-store" } });
  } catch (error) {
    // only the type: a store error can repeat its credentials
    console.error("[chat] stored conversation could not be checked:", error instanceof Error ? error.name : "unknown");
    return new Response(null, { status: 503 });
  }
}

// Forgets the visitor's stored conversation, when they start a new chat, so its address stops opening
// it. Another site can't trigger this: the owner cookie is SameSite=Lax, so it isn't sent
// with another site's DELETE request.
export async function DELETE(request: Request): Promise<Response> {
  const owner = readOwner(request);
  // nothing can be stored without the cookie
  if (owner === undefined) return new Response(null, { status: 204 });

  try {
    await deleteStoredChat(owner);
    return new Response(null, { status: 204 });
  } catch (error) {
    // only the type: a store error can repeat its credentials
    console.error("[chat] stored conversation could not be deleted:", error instanceof Error ? error.name : "unknown");
    return new Response(null, { status: 503 });
  }
}
