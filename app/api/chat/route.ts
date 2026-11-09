import { handleChatRequest } from "@promptfolio/ai";
import { gateway } from "ai";
import { after } from "next/server";
import { chatStore, newOwnerId, ownerCookie, readOwner } from "@/lib/chat-history";
import { chatLimiter } from "@/lib/chat-limit";
import { refreshGitHubIfDue } from "@/lib/github-refresh";
import { loadProfile } from "@/lib/github-source";
import { identifyVisitor } from "@/lib/visitor";

// TODO: validate model id
const modelId = process.env.MODEL_ID ?? "nvidia/nemotron-3.5-lightning-free";

// lets local dev skip chat turn limits; never honoured in production
const chatLimitDisabled =
  process.env.NODE_ENV !== "production" && process.env.DISABLE_CHAT_LIMIT === "1";

// max duration this serverless route handler is allowed to run
export const maxDuration = 60;

export async function POST(request: Request): Promise<Response> {
  // runs once the answer has been sent, so the visitor never waits for GitHub;
  // this visitor gets the stored snapshot, later ones get the refreshed one
  after(refreshGitHubIfDue);

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
  });
  // sent on every answer, so the cookie lasts as long as the conversations it names
  response.headers.append("set-cookie", ownerCookie(owner));
  return response;
}
