import "server-only";
import type { ChatTurnLimiter } from "@promptfolio/ai";
import { redis } from "@/lib/redis";

const KEY_PREFIX = "chat:turns";
const WINDOW_SECONDS = 24 * 60 * 60;
const VISITOR_CHAT_TURNS_CAP = 30;
const SITE_CHAT_TURNS_CAP = 200;

export const chatLimiter: ChatTurnLimiter = {
  // take checks the visitor's count before the site's. A visitor who is already over their limit returns early,
  // so their extra requests don't use up the site's allowance.
  async take(visitor) {
    if (
      (await count(`${KEY_PREFIX}:visitor:${visitor}`)) > VISITOR_CHAT_TURNS_CAP
    ) {
      return "visitor-limit";
    }

    if ((await count(`${KEY_PREFIX}:site`)) > SITE_CHAT_TURNS_CAP) {
      // TODO: add observability to analyse how frequently site-limit is being hit.
      // repetitive site-limit hits => traffic growth => need of increasing site limit
      return "site-limit";
    }

    return "allowed";
  },
};

async function count(key: string): Promise<number> {
  const [counted] = await redis
    .multi()
    .incr(key)
    .expire(key, WINDOW_SECONDS, "NX") //  A counter can't be left without an expiry and grow forever. "NX" sets the 24-hour expiry only on the first count, so the window doesn't keep sliding forward.
    .exec();

  if (!Number.isInteger(counted) || counted < 1) {
    // if Redis gives an unexpected answer, take throws. @promptfolio/ai treats that as "unavailable"
    // and refuses to answer rather than skipping the limit.
    throw new Error("unexpected counter value returned by the redis store");
  }

  return counted;
}
