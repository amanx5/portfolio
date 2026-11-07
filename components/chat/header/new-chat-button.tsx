import { Button } from "@/components/ui/button";
import { SquarePenIcon } from "lucide-react";

export function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" className="text-muted-foreground" onClick={onClick}>
      <SquarePenIcon />
      New chat
    </Button>
  );
}
