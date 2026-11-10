import {
  ChainOfThought,
  ChainOfThoughtContent,
  ChainOfThoughtHeader,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { type UIMessage } from "@ai-sdk/react";
import { getToolName, isToolUIPart } from "ai";
import { FileTextIcon, ListIcon, TriangleAlertIcon } from "lucide-react";

// What @promptfolio/ai sends for a lookup with replyDetails.tools: the server writes both, so the
// model's own arguments and the records themselves never reach the browser.
type LookupInput = { section?: string; skillFilter?: true };
type LookupOutput = {
  status: "listed" | "found" | "not_found" | "limit_reached" | "failed";
  title?: string;
};

// The profile lookups behind an answer, so visitors can see it comes from real records.
export function Lookups({ parts }: { parts: UIMessage["parts"] }) {
  const lookups = parts.filter(isToolUIPart);
  if (lookups.length === 0) return null;

  const running = lookups.some((part) => part.state !== "output-available");

  return (
    <ChainOfThought>
      <ChainOfThoughtHeader className={running ? "shimmer" : undefined}>
        {running ? "Looking up the profile…" : `Looked up the profile (${lookups.length})`}
      </ChainOfThoughtHeader>
      <ChainOfThoughtContent>
        {lookups.map((part) => {
          const done = part.state === "output-available";
          const output = done ? (part.output as LookupOutput) : undefined;
          const failed =
            output?.status === "failed" ||
            output?.status === "limit_reached" ||
            output?.status === "not_found";

          return (
            <ChainOfThoughtStep
              key={part.toolCallId}
              status={done ? "complete" : "active"}
              icon={
                failed
                  ? TriangleAlertIcon
                  : getToolName(part) === "getProfileRecord"
                    ? FileTextIcon
                    : ListIcon
              }
              label={label(getToolName(part), part.input as LookupInput | undefined, output)}
            />
          );
        })}
      </ChainOfThoughtContent>
    </ChainOfThought>
  );
}

function label(tool: string, input: LookupInput | undefined, output?: LookupOutput) {
  if (output?.status === "failed") return "Lookup failed";
  if (output?.status === "limit_reached") return "Lookup limit reached";

  if (tool === "getProfileRecord") {
    if (!output) return "Opening a record…";
    return output.title ? `Read ${output.title}` : "Record not found";
  }

  const what = `${input?.section ?? "profile"}${input?.skillFilter ? " by skill" : ""}`;
  return output ? `Listed ${what}` : `Listing ${what}…`;
}
