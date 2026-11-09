import "server-only";
import type { ProfileLoadResult } from "@promptfolio/core";
import { mergeGitHubSnapshot, parseGitHubConfig } from "@promptfolio/source-github";
import githubConfigData from "@/github.json";
import { profileResult } from "@/lib/profile";
import { redis } from "@/lib/redis";

// where the latest GitHub snapshot is kept; written by the background refresh
export const SNAPSHOT_KEY = "github:snapshot";

export const githubConfig = parseGitHubConfig(githubConfigData);

// The owner profile plus the GitHub data stored in Redis.
// - no snapshot stored yet: the owner profile alone
// - a stored snapshot that doesn't fit: the owner profile alone, with the reasons as warnings,
//   so visitors still get an answer and the next refresh overwrites the bad snapshot
export async function loadProfile(): Promise<ProfileLoadResult> {
  if (!profileResult.ok) return profileResult;
  // an invalid github.json is a deploy mistake, so it fails like an invalid profile.json
  if (!githubConfig.ok) return githubConfig;

  const snapshot = await redis.get<unknown>(SNAPSHOT_KEY);
  if (snapshot === null) return profileResult;

  const merged = mergeGitHubSnapshot(
    profileResult.profile,
    githubConfig.config,
    snapshot,
    SNAPSHOT_KEY,
  );
  if (merged.ok) return merged;

  return {
    ...profileResult,
    warnings: [...profileResult.warnings, ...merged.issues],
  };
}
