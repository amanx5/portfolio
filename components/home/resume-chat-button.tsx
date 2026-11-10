import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryIcon } from "lucide-react";

// Always rendered on the start screen, only invisible until a stored chat is found, so its
// space is kept and nothing moves when it appears. Invisible also takes it out of tab order.
// A link to the chat's address, so it can also open in a new tab.
export function ResumeChatButton({ chatId }: { chatId?: string }) {
  const visible = chatId !== undefined;
  return (
    <Button
      variant="link"
      size="sm"
      className={cn("mx-auto text-muted-foreground", !visible && "invisible")}
      aria-hidden={!visible}
      nativeButton={false}
      render={<Link href={visible ? `/chat/${chatId}` : "/"} />}
    >
      <HistoryIcon />
      Continue your previous chat
    </Button>
  );
}
