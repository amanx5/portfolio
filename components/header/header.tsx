import { ChatLink } from "@/components/header/chat-link";
import { Identity } from "@/components/header/identity";
import type { ProfileLink } from "@/contexts/app-context";

export function Header({
  name,
  headline,
  links,
  avatarUrl,
}: {
  name: string;
  headline: string;
  links: ProfileLink[];
  avatarUrl?: string;
}) {
  return (
    <header className="flex min-h-14 items-center gap-3 border-b px-4">
      {/* the name is only visible in the avatar card, so keep it as the page heading for screen readers */}
      <h1 className="sr-only">{name}</h1>
      <ChatLink />
      <div className="ml-auto">
        <Identity
          name={name}
          headline={headline}
          links={links}
          avatarUrl={avatarUrl}
        />
      </div>
    </header>
  );
}
