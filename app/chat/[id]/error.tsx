"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

// The chat store failed or was too slow while the chat was loading. The chat may still be there,
// so trying again comes first.
export default function ChatLoadError({ retry }: { retry: () => void }) {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyTitle>This chat couldn&apos;t be loaded</EmptyTitle>
        <EmptyDescription>Something went wrong on our side. Please try again.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent className="flex-row justify-center">
        <Button onClick={() => retry()}>Try again</Button>
        <Link href="/" className={buttonVariants({ variant: "outline" })}>
          Start a new chat
        </Link>
      </EmptyContent>
    </Empty>
  );
}
