"server-only";

import { loadStructuredProfile } from "@promptfolio/core";
import profileData from "@/profile.json";

export const profileResult = loadStructuredProfile(profileData, {
  sourceId: "owner-profile",
  label: "Owner-provided profile",
  observedAt: new Date("2026-11-02T00:00:00.000Z"),
});
