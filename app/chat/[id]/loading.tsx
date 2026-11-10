import { Spinner } from "@/components/ui/spinner";

// Shown while the chat is read from the store. The page needs the visitor's cookie, so it can't be
// prerendered; this placeholder is, and it shows at once.
export default function ChatLoading() {
  return (
    <div className="flex h-dvh items-center justify-center">
      <Spinner className="size-5 text-muted-foreground" />
    </div>
  );
}
