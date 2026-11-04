import { handleChatRequest } from "@promptfolio/ai";
import { gateway } from "ai";
import { chatLimiter } from "@/lib/chat-limit";
import { identifyVisitor } from "@/lib/visitor";
import { profileResult } from "@/lib/profile";

// TODO: validate model id
const modelId = process.env.MODEL_ID ?? "nvidia/nemotron-3.5-lightning-free";

// lets local dev skip chat turn limits; never honoured in production
const chatLimitDisabled =
  process.env.NODE_ENV !== "production" && process.env.DISABLE_CHAT_LIMIT === "1";

// max duration this serverless route handler is allowed to run
export const maxDuration = 60;

// Partial fix for missing links in answers. Lookups are not kept between messages, and
// listProfileRecords returns no project links, so models answer without them.
// Works when a visitor asks for projects' links in one message; still fails for follow-ups,
// and for broad questions where listing every section leaves too few tool calls for lookups.
// Full issue and real fix: https://github.com/amanx5/portfolio/blob/main/todos.md#include-links-in-listprofilerecords-results
const chatInstructions =
  "Earlier lookups are not kept between messages. Before calling getProfileRecord, call listProfileRecords in the same turn to get the exact ids. listProfileRecords does not include links: when asked for links, call getProfileRecord for each record.";

export async function POST(request: Request): Promise<Response> {
  if (!profileResult.ok) {
    return new Response(
      "Failed to load the profile data. Please try again later.",
      { status: 500 },
    );
  }

  return handleChatRequest(request, {
    model: gateway(modelId),
    profile: profileResult.profile,
    limit: chatLimitDisabled ? null : { limiter: chatLimiter, identifyVisitor },
    additionalInstructions: chatInstructions,
  });
}
