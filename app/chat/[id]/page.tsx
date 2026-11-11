import { loadVisitorChat } from "@promptfolio/ai";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { generateMetadata as homeMetadata } from "@/app/page";
import { ChatPage } from "@/components/chat-page";
import { chatStore, readOwner } from "@/lib/chat-history";
import { loadProfile } from "@/lib/github-source";
import { replyDetails } from "@/lib/reply-details";
import { siteUrl } from "@/lib/site";

// Private to the visitor whose cookie names it, so search engines are kept out.
export async function generateMetadata(): Promise<Metadata> {
  return { ...(await homeMetadata()), robots: { index: false, follow: false } };
}

// A chat at its own address. Only the browser that started it finds it, by the owner cookie, and
// only while it is the visitor's stored chat: anything else is not found, the same as another
// visitor's link.
export default async function ChatAtAddress({ params }: PageProps<"/chat/[id]">) {
  const { id } = await params;
  // loadVisitorChat reads the owner from a request; a page has none, so one is made from the
  // incoming headers, which carry the cookie
  const request = new Request(siteUrl(), { headers: await headers() });
  const owner = readOwner(request);
  if (owner === undefined) notFound();

  // lookup titles come from the profile; if it fails to load, the messages are shown as text only
  const profileResult = await loadProfile();
  const history = { store: chatStore, identifyOwner: async () => owner };
  // a store error is thrown, so the error page offers to try again
  const messages = await loadVisitorChat(
    request,
    id,
    profileResult.ok ? { history, replyDetails, profile: profileResult.profile } : { history },
  );
  // none left to show (every stored part unreadable) counts as gone too
  if (!messages?.length) notFound();

  return <ChatPage stored={{ id, messages }} />;
}
