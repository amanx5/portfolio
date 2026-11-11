import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryIcon } from "lucide-react";

// Always rendered on the start screen, only invisible until a stored chat is found, so its
// space is kept and nothing moves when it appears. Invisible also takes it out of tab order.
// A link to the chat's address, so it can also open in a new tab. Named by its first question,
// cut to one line so a long one doesn't change the height; the full question is in its tooltip.
export function ResumeChatButton({ chat }: { chat?: { id: string; title: string } }) {
  const visible = chat !== undefined;
  const label = chat?.title ? `Continue "${chat.title}"` : "Continue your previous chat";
  return (
    <Button
      variant="link"
      size="sm"
      className={cn("mx-auto max-w-full text-muted-foreground", !visible && "invisible")}
      aria-hidden={!visible}
      title={chat?.title || undefined}
      nativeButton={false}
      render={<Link href={visible ? `/chat/${chat.id}` : "/"} />}
    >
      <HistoryIcon />
      <span className="truncate">{label}</span>
    </Button>
  );
}
