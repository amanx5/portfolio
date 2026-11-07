import { CopyButton } from "@/components/chat/message-actions/copy-button";

export function MessageActions({ text }: { text: string }) {
  return (
    <div className="flex gap-1">
      <CopyButton text={text} />
    </div>
  );
}
