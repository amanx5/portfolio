// keeps the profile and its validation code out of the client bundle
// this ensures build error if loadOwnerProfile is imported in any client component by mistake
import "server-only";
import { findContactDetails, loadStructuredProfile, type ProfileLoadResult } from "@promptfolio/core";
import { fetchRemoteProfile } from "@promptfolio/source-remote";
import { cacheLife } from "next/cache";

// the published copy of the profile, e.g. https://example.com/profile.json
const profileUrl = process.env.PROFILE_URL?.trim() || undefined;

// Fetched at build time, then served from the cache. Once an hour has passed, the next request
// still gets the cached copy and starts a refetch in the background.
// Every failure throws, so it is never cached like a real profile and the last good copy stays:
// a failed fetch, and a file with text that looks like contact details, which must never reach
// the model even if the store's own checks were bypassed.
async function fetchProfile(url: string): Promise<{ data: unknown; fetchedAt: string }> {
  "use cache";
  cacheLife("hours");
  const fetched = await fetchRemoteProfile({ url });
  if (!fetched.ok) throw new Error(`Profile fetch failed: ${fetched.error.message}`);

  const contact = findContactDetails(fetched.data);
  if (contact.length > 0) {
    // paths and messages only, never the text that was found
    const where = contact.map((issue) => `${issue.path || "(root)"}: ${issue.message}`).join("; ");
    throw new Error(`Profile from ${url} has text that looks like contact details: ${where}`);
  }

  return { data: fetched.data, fetchedAt: fetched.fetchedAt.toISOString() };
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
