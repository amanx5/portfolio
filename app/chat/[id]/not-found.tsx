import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";

// An unknown id, another visitor's chat, an expired one, or one a newer chat replaced.
export default function ChatNotFound() {
  return (
    <Empty className="h-dvh">
      <EmptyHeader>
        <EmptyTitle>This chat isn&apos;t available</EmptyTitle>
        <EmptyDescription>It may have expired, or the link is wrong.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/" className={buttonVariants()}>
          Start a new chat
        </Link>
      </EmptyContent>
    </Empty>
  );
}
