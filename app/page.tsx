import { Chat } from "@/components/chat";
import { profileResult } from "@/lib/profile";

export default function Home() {
  if (!profileResult.ok) {
    console.error("Profile load failed with issues:\n", profileResult.issues);
    return "Something went wrong while loading the profile data. Please try again later.";
  }

  if (profileResult.warnings.length) {
    console.warn("Loaded profile with warnings:\n", profileResult.warnings);
  }

  return <Chat />;
}
