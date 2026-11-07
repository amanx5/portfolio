import { useAppContext } from "@/contexts/app-context";
import { type JSX } from "react";
import {
  defaultRehypePlugins,
  type ExtraProps,
  Streamdown,
  type StreamdownProps,
} from "streamdown";

// Streamdown's rehype-harden marks links it can't parse (e.g. a bare record id like "jsoc-grid") with
// " [blocked]". Render them as plain text instead, the same way Anchor treats links outside the profile.
const [harden, hardenOptions] = defaultRehypePlugins.harden as [
  NonNullable<StreamdownProps["rehypePlugins"]>[number],
  object,
];
const rehypePlugins = Object.entries(defaultRehypePlugins).map(
  ([name, plugin]) =>
    name === "harden"
      ? [harden, { ...hardenOptions, linkBlockPolicy: "text-only" }]
      : plugin,
) as StreamdownProps["rehypePlugins"];

// Streamdown keeps half-streamed Markdown (an unclosed ** or list) from flashing as raw text.
// Its link-safety modal is off because Anchor already allows only the profile's own URLs.
export function Answer({ children }: { children: string }) {
  return (
    <Streamdown
      components={{ a: Anchor }}
      linkSafety={{ enabled: false }}
      rehypePlugins={rehypePlugins}
    >
      {children}
    </Streamdown>
  );
}

function Anchor({ href, children }: JSX.IntrinsicElements["a"] & ExtraProps) {
  const ctx = useAppContext();

  // profileLinkUrls returns URLs in normalized form, so https://github.com and https://github.com/ (with trailing /)
  // should count as the same link. Comparing the raw href would treat them as different.
  if (
    !href ||
    !URL.canParse(href) ||
    !ctx.profile.allUrls.has(new URL(href).href)
  ) {
    return children;
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer nofollow"
      className="underline"
    >
      {children}
    </a>
  );
}
