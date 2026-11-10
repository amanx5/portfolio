import "server-only";
import { randomUUID } from "node:crypto";
import type { ProfileLoadResult } from "@promptfolio/core";
import {
  createBackgroundGitHubSource,
  type GitHubSnapshotStore,
  parseGitHubConfig,
} from "@promptfolio/source-github";
import { after } from "next/server";
import githubConfigData from "@/github.json";
import { profileResult } from "@/lib/profile";
import { redis } from "@/lib/redis";

const KEY_PREFIX = "github";
// held while a refresh runs, so only one request starts it
const LOCK_KEY = `${KEY_PREFIX}:refresh-lock`;
// deletes the lock only if this run still holds it, so a run that outlived its lock
// never releases a later run's lock
const UNLOCK_SCRIPT =
  'if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) end return 0';

// Where @promptfolio/source-github keeps the snapshot ("github:snapshot") and when the next
// refresh is due ("github:refresh-after").
const store: GitHubSnapshotStore = {
  get: (key) => redis.get(`${KEY_PREFIX}:${key}`),
  async set(key, value) {
    await redis.set(`${KEY_PREFIX}:${key}`, value);
  },
  async lock(ttlSeconds) {
    const token = randomUUID();
    // NX: only set if no one else holds it
    const locked = await redis.set(LOCK_KEY, token, { nx: true, ex: ttlSeconds });
    return locked === null ? undefined : token;
  },
  async unlock(token) {
    await redis.eval(UNLOCK_SCRIPT, [LOCK_KEY], [token]);
  },
};

const githubConfig = parseGitHubConfig(githubConfigData);

// The library's defaults fit this app: refresh 6 hours after a complete run, 1 hour after a
// partial or failed one, and a 120 second lock (longer than the route's maxDuration).
const github = githubConfig.ok
  ? createBackgroundGitHubSource({
      store,
      config: githubConfig.config,
      token: process.env.GITHUB_TOKEN?.trim() || undefined,
      // the refresh runs once the answer has been sent, so the visitor never waits for GitHub;
      // this visitor gets the stored snapshot, later ones get the refreshed one
      runAfterResponse: after,
    })
  : undefined;

// The owner profile plus the GitHub data stored in Redis. Never calls GitHub itself.
// With no stored snapshot, or one that doesn't fit, it is the owner profile alone (with warnings),
// so visitors still get an answer and the next refresh overwrites the bad snapshot.
export async function loadProfile(): Promise<ProfileLoadResult> {
  // an invalid github.json is a deploy mistake, so it fails like an invalid profile.json
  if (!githubConfig.ok) return githubConfig;
  return github!.loadProfile(profileResult);
}
