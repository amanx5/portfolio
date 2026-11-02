import "server-only";
import { createHmac } from "node:crypto";
import { isIP } from "node:net";

const secret = process.env.VISITOR_HASH_SECRET ?? "";
const isSecretInvalid = secret.length < 32

// Log instead of throwing: a throw here would fail the whole route (raw 500), could fail `next build`
// without the env, and would break local dev. identifyVisitor returns undefined instead, which
// @promptfolio/ai treats as "unavailable", so answers are refused rather than left unlimited.
if (isSecretInvalid) {
  console.error("[chat] VISITOR_HASH_SECRET must be set and at least 32 characters; chat answers are refused");
}

export async function identifyVisitor(
  request: Request,
): Promise<string | undefined> {
  if (isSecretInvalid) return undefined;

  // The browser never sends these; they are added server-side, so they don't show in DevTools.
  // x-vercel-forwarded-for: set by Vercel's edge, which overwrites any client value, so it can't be faked.
  // x-forwarded-for: set by a proxy, or by Next itself from the socket address when missing (next dev: ::1).
  // Without a proxy that overwrites it, a client can spoof x-forwarded-for; the site cap still bounds cost.
  // It can be a chain "client, proxy1, proxy2", so the first entry is the client.
  const header =
    request.headers.get("x-vercel-forwarded-for") ??
    request.headers.get("x-forwarded-for");
  const ip = header?.split(",")[0]?.trim();

  if (!ip || !isIP(ip)) return undefined;

  // Keyed hash of the IP, used as the Redis key, so the store never holds the raw address.
  // HMAC rather than plain SHA-256: there are only ~4 billion IPv4 addresses, so a plain hash could be
  // reversed by hashing them all; without the secret that is not possible.
  // The "chat-visitor:" label keeps this hash unrelated to any other use of the same secret.
  // The hash is still pseudonymised personal data (GDPR, DPDP): disclose it in the privacy note,
  // and never log the IP or the hash.
  // base64url: compact text without "/" or "+", safe in Redis keys.
  return createHmac("sha256", secret)
    .update(`chat-visitor:${ip}`)
    .digest("base64url");
}
