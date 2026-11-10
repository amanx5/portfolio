# Next session: what is left after the @promptfolio 0.0.3 upgrade

The app is on `@promptfolio/*` `^0.0.3`: the server keeps the conversation in Redis, replies show their profile
lookups and the model's name, and the GitHub refresh runs in the library. What follows is still open.

## Show a stored conversation after a reload
The server stores each conversation, but a reload shows an empty chat.

1. Keep the chat id where the page can read it back (for example in the URL), checking it with `isChatId`.
2. Load the conversation with `loadVisitorChat`, passing the same `replyDetails` and the `profile` as the chat
   route, so stored lookups and the model's name look the same as the live reply.
3. Give `useChat` that id and the loaded messages. "New chat" should then start a new id, not reuse the old one.

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
- The lookups list opens without its slide and fade: `components/ai-elements/chain-of-thought.tsx` targets radix's
  `data-[state=open]`, while this project's base-ui collapsible sets `data-open`.
- After the lookups finish and before the first words arrive, no "Thinking…" shows.
- The model's name is the provider's dated id (`gpt-4o-mini-2024-07-18`); decide whether to trim the date.
- The refresh outcome (`not-due`, `complete`, …) is not logged: `loadProfile` does not return it. Failed and partial
  refreshes are logged by the library.
- `// TODO: validate model id` in `app/api/chat/route.ts`.

## To check after the next deploy
- A real GitHub refresh through the library: after a chat request once `github:refresh-after` has passed, the
  snapshot's `retrievedAt` should move.
- The owner cookie is set with `Secure` in production.
- A question that opens one record shows a "Read …" lookup step.
