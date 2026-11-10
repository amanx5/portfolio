import "server-only";
import type { ReplyDetails } from "@promptfolio/ai";

// What visitors see of a reply besides its text. Shared by the live reply and a stored conversation
// loaded again, so both look the same.
export const replyDetails: ReplyDetails = {
  // each profile lookup (section and record name only), shown above the answer
  tools: true,
  // name shown under the answer: the model id without its provider ("nvidia/nemotron-…" -> "nemotron-…")
  // and without a snapshot date, which only some providers behind the gateway report
  // ("gpt-4o-mini-2024-07-18" -> "gpt-4o-mini", "claude-…-20250514" -> "claude-…")
  model: (id) => id.split("/").at(-1)?.replace(/-(\d{4}-\d{2}-\d{2}|\d{8})$/, ""),
};
