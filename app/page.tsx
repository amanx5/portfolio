import { profileLinkUrls } from "@promptfolio/core";
import { Chat } from "@/components/chat";
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

  return (
    <AppContextProvider value={{ profile: { allUrls } }}>
      <Chat />
    </AppContextProvider>
  );
}
