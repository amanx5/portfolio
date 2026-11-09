import "server-only";
import {
  carryForward,
  fetchGitHubSnapshot,
  mergeGitHubSnapshot,
  parseGitHubSnapshot,
} from "@promptfolio/source-github";
import { githubConfig, SNAPSHOT_KEY } from "@/lib/github-source";
import { profileResult } from "@/lib/profile";
import { redis } from "@/lib/redis";

// when the next refresh is due, in milliseconds since the epoch
const REFRESH_AFTER_KEY = "github:refresh-after";
// held while a refresh runs, so only one request starts it
const LOCK_KEY = "github:refresh-lock";

const HOUR_MS = 60 * 60 * 1000;
// after a complete refresh
const REFRESH_INTERVAL_MS = 6 * HOUR_MS;
// after a partial or failed one: try again sooner, the stored snapshot stays in use meanwhile
const RETRY_INTERVAL_MS = 1 * HOUR_MS;
// longer than a request may run (maxDuration), so a crashed refresh can't block later ones
const LOCK_SECONDS = 120;

// Refreshes the stored GitHub snapshot if it is due. Meant to run after the response is sent,
// so a visitor never waits for it. Never throws: a failure is logged and retried later.
export async function refreshGitHubIfDue(): Promise<void> {
  if (!profileResult.ok || !githubConfig.ok) return;

  try {
    const refreshAfter = await redis.get<number>(REFRESH_AFTER_KEY);
    if (refreshAfter !== null && Date.now() < refreshAfter) return;

    // NX: only set if no one else holds it
    const locked = await redis.set(LOCK_KEY, Date.now(), { nx: true, ex: LOCK_SECONDS });
    if (locked === null) return;

    try {
      const complete = await refresh();
      const wait = complete ? REFRESH_INTERVAL_MS : RETRY_INTERVAL_MS;
      await redis.set(REFRESH_AFTER_KEY, Date.now() + wait);
    } finally {
      await redis.del(LOCK_KEY);
    }
  } catch (error) {
    console.error("GitHub refresh failed:", error);
  }
}

// Fetches and stores a new snapshot. Returns whether everything was read.
async function refresh(): Promise<boolean> {
  if (!profileResult.ok || !githubConfig.ok) return false;

  // repositories this run can't read keep their data from the stored snapshot
  const stored = parseGitHubSnapshot(await redis.get<unknown>(SNAPSHOT_KEY));
  const previous = stored.ok ? stored.snapshot : undefined;

  const token = process.env.GITHUB_TOKEN?.trim() || undefined;
  const fetched = await fetchGitHubSnapshot(githubConfig.config, { token });
  const carried = carryForward(previous, fetched);
  if (carried.status === "failed") {
    console.error("GitHub refresh failed; the stored snapshot stays:", carried.errors);
    return false;
  }

  // check the new snapshot fits the profile before it replaces the stored one
  const merged = mergeGitHubSnapshot(
    profileResult.profile,
    githubConfig.config,
    carried.snapshot,
    SNAPSHOT_KEY,
  );
  if (!merged.ok) {
    console.error("GitHub snapshot does not fit the profile; the stored one stays:", merged.issues);
    return false;
  }

  await redis.set(SNAPSHOT_KEY, carried.snapshot);
  if (carried.status === "partial") {
    console.warn("GitHub refresh was partial; some data was kept from before:", carried.errors);
  }
  return carried.status === "complete";
}
