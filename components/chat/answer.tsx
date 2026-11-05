import { useAppContext } from "@/contexts/app-context";
import { type JSX } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function Answer({ children }: { children: string }) {
  return (
    <div className="prose prose-sm prose-neutral dark:prose-invert max-w-none">
      <Markdown remarkPlugins={[remarkGfm]} components={{ a: Anchor }}>
        {children}
      </Markdown>
    </div>
  );
}

function Anchor({ href, children }: JSX.IntrinsicElements["a"]) {
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
