# Next session: what is left after the @promptfolio 0.0.3 upgrade

The app is on `@promptfolio/*` `^0.0.3`: the server keeps the conversation in Redis, replies show their profile
lookups and the model's name, a reload shows the stored chat again, and the GitHub refresh runs in the library. What
follows is still open.

## Fall back to another free model (optional)
The default `MODEL_ID` (`nvidia/nemotron-3.5-lightning-free`) is a free tier with tight per-minute limits.
Sending a few questions quickly made the model call fail (likely a gateway/provider rate limit, not the Redis
daily limiter), and the visitor saw "The assistant could not answer right now… (ref …)".

1. In `app/api/chat/route.ts`, wrap the model with `createFailoverModel`: the free `MODEL_ID` first, then
   another free model (no paid models).
2. Add an optional `FALLBACK_MODEL_ID` env var, validate it like `MODEL_ID`, and document it in `.env.example`.
3. Copy `ATTEMPT_FIRST_CHUNK_MS` and the limits from the reference app
   (`../promptfolio/apps/portfolio/src/server/chat/model.ts`): `maxRetries: 0`, and `limits.timeouts.firstChunkMs`
   above the sum of all attempts. Keep the total within `maxDuration` (60 s).
4. `replyDetails.model` then receives the answering entry's label, so the name under a reply stays correct.

## Small things
- Dev server only: after a reload, the restored chat has no scrollbar. React Strict Mode remounts the scroller, and
  `@shadcn/react` 0.3.1 then leaves `data-autoscrolling` set, which hides it. Prod is fine, so nothing was changed.
- The refresh outcome (`not-due`, `complete`, …) is not logged: `loadProfile` does not return it. Failed and partial
  refreshes are logged by the library.

## To check after the next deploy
- A real GitHub refresh through the library: after a chat request once `github:refresh-after` has passed, the
  snapshot's `retrievedAt` should move.
- The owner cookie is set with `Secure` in production.
- A question that opens one record shows a "Read …" lookup step.
