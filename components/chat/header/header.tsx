import { NewChatButton } from "@/components/chat/header/new-chat-button";
import { Identity } from "@/components/chat/header/identity";

export function Header({
  name,
  headline,
  website,
  avatarUrl,
  showNewChat,
  onNewChat,
}: {
  name: string;
  headline: string;
  website?: string;
  avatarUrl?: string;
  showNewChat: boolean;
  onNewChat: () => void;
}) {
  return (
    <header className="flex min-h-14 items-center justify-between gap-3 border-b px-4">
      <Identity
        name={name}
        headline={headline}
        website={website}
        avatarUrl={avatarUrl}
      />
      {showNewChat && <NewChatButton onClick={onNewChat} />}
    </header>
  );
}
