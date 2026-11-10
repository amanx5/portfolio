import { profileLinkUrls } from "@promptfolio/core";
import { Chat, type StoredChat } from "@/components/chat";
import { AppContextProvider } from "@/contexts/app-context";
import { profileResult } from "@/lib/profile";
import { avatarUrl } from "@/lib/site";

// What both / and /chat/<id> render: the chat, given the profile. /chat/<id> also passes the chat it names.
export function ChatPage({ stored }: { stored?: StoredChat }) {
  if (!profileResult.ok) {
    console.error("Profile load failed with issues:\n", profileResult.issues);
    return "Something went wrong while loading the profile data. Please try again later.";
  }

  if (profileResult.warnings.length) {
    console.warn("Loaded profile with warnings:\n", profileResult.warnings);
  }

  const allUrls = new Set(profileLinkUrls(profileResult.profile));
  const { name, headline } = profileResult.profile.identity;
  const { links } = profileResult.profile;

  return (
    <AppContextProvider
      value={{ profile: { name, headline, links, avatarUrl, allUrls } }}
    >
      <Chat stored={stored} />
    </AppContextProvider>
  );
}
