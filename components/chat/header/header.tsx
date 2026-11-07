import { NewChatButton } from "@/components/chat/header/new-chat-button";
import { Identity } from "@/components/chat/header/identity";
import type { ProfileLink } from "@/contexts/app-context";

export function Header({
  name,
  headline,
  links,
  avatarUrl,
  showNewChat,
  onNewChat,
}: {
  name: string;
  headline: string;
  links: ProfileLink[];
  avatarUrl?: string;
  showNewChat: boolean;
  onNewChat: () => void;
}) {
  return (
    <header className="flex min-h-14 items-center gap-3 border-b px-4">
      {/* the name is only visible in the avatar card, so keep it as the page heading for screen readers */}
      <h1 className="sr-only">{name}</h1>
      {showNewChat && <NewChatButton onClick={onNewChat} />}
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
