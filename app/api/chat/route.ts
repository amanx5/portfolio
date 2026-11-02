import { handleChatRequest } from "@promptfolio/ai";
import { gateway } from "ai";
import { profileResult } from "@/lib/profile";

// TODO: validate model id
const modelId = process.env.MODEL_ID ?? "nvidia/nemotron-3.5-lightning-free";

// max duration this serverless route handler is allowed to run
export const maxDuration = 60;

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
    limit: null,
  });
}
