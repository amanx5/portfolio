import { profileResult } from "@/lib/profile";

export default function Home() {
  if (!profileResult.ok) {
    console.error("Profile load failed with issues:\n", profileResult.issues);
    return "Something went wrong while loading the profile data. Please try again later.";
  }

  if (profileResult.warnings.length) {
    console.warn("Loaded profile with warnings:\n", profileResult.warnings);
  }

  const { identity } = profileResult.profile;
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <h1>{identity.name}</h1>
      <p>{identity.headline}</p>
    </div>
  );
}
