import { profileLinkUrls } from "@promptfolio/core";
import type { Metadata } from "next";
import { Chat } from "@/components/chat/chat";
import { AppContextProvider } from "@/contexts/app-context";
import { profileResult } from "@/lib/profile";
import { avatarUrl } from "@/lib/site";

// The profile is bundled JSON, so a static metadata object can read it; no generateMetadata needed.
// If the profile fails to load, the layout's defaults are used.
export const metadata = profileMetadata();

function profileMetadata(): Metadata {
  if (!profileResult.ok) return {};

  // Name first so tabs and search results group it with the main site, then say it's the chat.
  const { name } = profileResult.profile.identity;
  const firstName = name.split(" ")[0];
  const title = `${name} · Ask about my work`;
  const description = `Ask an AI about ${firstName}'s experience, projects and skills.`;
  return {
    title,
    description,
    openGraph: { title, description, type: "profile", url: "/" },
  };
}

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
  const { links } = profileResult.profile;

  return (
    <AppContextProvider
      value={{ profile: { name, headline, links, avatarUrl, allUrls } }}
    >
      <Chat />
    </AppContextProvider>
  );
}
