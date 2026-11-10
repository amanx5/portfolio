import Link from "next/link";
import { Button } from "@/components/ui/button";

// The app's name in the corner, like ChatGPT's: always a link back to the start screen.
export function ChatLink() {
  return (
    <Button
      variant="ghost"
      className="text-lg font-medium"
      nativeButton={false}
      render={<Link href="/" />}
    >
      Chat
    </Button>
  );
}
