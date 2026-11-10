import type { Metadata } from "next";
import { ChatPage } from "@/components/chat-page";
import { profileResult } from "@/lib/profile";

// The profile is bundled JSON, so a static metadata object can read it; no generateMetadata needed.
// If the profile fails to load, the layout's defaults are used.
export const metadata = profileMetadata();

function profileMetadata(): Metadata {
  if (!profileResult.ok) return {};

  // Name first so tabs and search results group it with the main site, then say it's the chat.
  const { name } = profileResult.profile.identity;
  const firstName = name.split(" ")[0];
  const title = `${name} · Ask about my work`;
  // 120-160 characters fills a search snippet
  const description = `Ask an AI about ${firstName}'s experience, projects and skills. Every answer comes from ${firstName}'s own profile, so nothing is invented.`;
  return {
    title,
    description,
    // siteName: Discord and some other apps show it above the title
    openGraph: { title, description, siteName: name, type: "profile", url: "/" },
  };
}

// A new chat; it moves to /chat/<id> once its first question is sent.
export default function Home() {
  return <ChatPage />;
}
