// keeps the profile and its validation code out of the client bundle
// this ensures build error if profileResult is imported in any client component by mistake 
import "server-only";
import { loadStructuredProfile } from "@promptfolio/core";
import profileData from "@/profile.json";

export const profileResult = loadStructuredProfile(profileData, {
  sourceId: "owner-profile",
  label: "Owner-provided profile",
  observedAt: new Date("2026-11-02T00:00:00.000Z"),
});
