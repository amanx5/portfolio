import { ImageResponse } from "next/og";
import { loadOwnerProfile } from "@/lib/profile";
import { avatarUrl, siteUrl } from "@/lib/site";

// The link-preview image (Slack, LinkedIn, WhatsApp). Built once at build time.
export const alt = "Ask about my work";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const profileResult = await loadOwnerProfile();
  const identity = profileResult.ok ? profileResult.profile.identity : null;
  const name = identity?.name ?? "Portfolio";
  const headline = identity?.headline;
  const host = new URL(siteUrl()).host;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: 64,
          padding: 96,
          background: "#0a0a0a",
          color: "#fafafa",
        }}
      >
        {avatarUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- ImageResponse renders plain img only
          <img
            src={avatarUrl}
            alt=""
            width={240}
            height={240}
            style={{ borderRadius: 9999 }}
          />
        )}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 72, fontWeight: 600 }}>{name}</div>
          {headline && (
            <div style={{ fontSize: 40, color: "#a1a1a1" }}>{headline}</div>
          )}
          <div style={{ fontSize: 40, marginTop: 24 }}>Ask about my work →</div>
          <div style={{ fontSize: 28, color: "#737373" }}>{host}</div>
        </div>
      </div>
    ),
    size,
  );
}
