import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { HistoryIcon } from "lucide-react";

// Always rendered on the start screen, only invisible until a stored chat is found, so its
// space is kept and nothing moves when it appears. Invisible also takes it out of tab order.
export function ResumeChatButton({
  visible,
  onClick,
}: {
  visible: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      variant="link"
      size="sm"
      className={cn("mx-auto text-muted-foreground", !visible && "invisible")}
      aria-hidden={!visible}
      onClick={onClick}
    >
      <HistoryIcon />
      Continue your previous chat
    </Button>
  );
}
