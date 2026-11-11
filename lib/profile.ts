// keeps the profile and its validation code out of the client bundle
// this ensures build error if loadOwnerProfile is imported in any client component by mistake
import "server-only";
import { loadStructuredProfile, type ProfileLoadResult } from "@promptfolio/core";
import { cacheLife } from "next/cache";

// the published copy of the profile, e.g. https://example.com/profile.json
const profileUrl = process.env.PROFILE_URL?.trim() || undefined;

// Fetched at build time, then served from the cache. Once an hour has passed, the next request
// still gets the cached copy and starts a refetch in the background.
// A failed fetch throws, so it is never cached like a real profile and the last good copy stays.
async function fetchProfile(url: string): Promise<{ data: unknown; fetchedAt: string }> {
  "use cache";
  cacheLife("hours");
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Profile fetch failed: ${response.status} from ${url}`);
  return { data: await response.json(), fetchedAt: new Date().toISOString() };
}

// The owner's profile, or the reason it is unavailable.
export async function loadOwnerProfile(): Promise<ProfileLoadResult> {
  if (!profileUrl) return unavailable("PROFILE_URL is not set");

  let fetched: Awaited<ReturnType<typeof fetchProfile>>;
  try {
    fetched = await fetchProfile(profileUrl);
  } catch (error) {
    console.error(error);
    return unavailable("The profile could not be fetched");
  }

  return loadStructuredProfile(fetched.data, {
    sourceId: "owner-profile",
    label: "Owner-provided profile",
    url: profileUrl,
    // when this copy was fetched; the published file carries no date of its own
    observedAt: new Date(fetched.fetchedAt),
  });
}

function unavailable(message: string): ProfileLoadResult {
  return { ok: false, issues: [{ path: "", message }] };
}
