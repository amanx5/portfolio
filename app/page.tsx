import { profileLinkUrls } from "@promptfolio/core";
import { Chat } from "@/components/chat/chat";
import { AppContextProvider } from "@/contexts/app-context";
import { profileResult } from "@/lib/profile";

export default function Home() {
  if (!profileResult.ok) {
    console.error("Profile load failed with issues:\n", profileResult.issues);
    return "Something went wrong while loading the profile data. Please try again later.";
  }

  if (profileResult.warnings.length) {
    console.warn("Loaded profile with warnings:\n", profileResult.warnings);
  }

  const allUrls = new Set(profileLinkUrls(profileResult.profile));
  const { name, headline } = profileResult.profile.identity;
  const website = profileResult.profile.links.find(
    (l) => l.label === "Website",
  )?.url;

  return (
    <AppContextProvider
      value={{ profile: { name, headline, website, allUrls } }}
    >
      <Chat />
    </AppContextProvider>
  );
}
