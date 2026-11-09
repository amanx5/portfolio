# Next session: upgrade to @promptfolio 0.0.3

`@promptfolio/core`, `@promptfolio/ai`, and `@promptfolio/source-github` `0.0.3` are on npm. The app is still on
`^0.0.2`, which never matches `0.0.3`, so bump all three together. The upgrade is breaking, so the first two
sections land together.

## 1. Upgrade (breaking): the server keeps the conversation
The browser now sends only its new question.

1. Pass `history: { store, identifyOwner }` to `handleChatRequest`. Implement `ChatStore` (`load` and `save`,
   by owner and chat id), for example on the Upstash Redis the chat limiter already uses.
   `createMemoryChatStore` is only for tests and local development.
2. Change the `useChat` transport to send `{ id, message, parentId }` instead of `{ messages }` (see the
   `@promptfolio/ai` README). Assistant message ids now come from the server.
3. Handle the new responses: 409 for an unknown `parentId` (visitor text `unknownConversation`), and 503 for a
   failed load or a request with no owner.
4. Optional: show a stored conversation again with `loadVisitorChat`, checking ids from the URL with `isChatId`.

## 2. Remove the links workaround
`listProfileRecords` now returns project links (and `repositoryUrl`), and earlier lookups are kept between
messages. Delete `chatInstructions` and its comment in `app/api/chat/route.ts`: its claim that the list has no
links would contradict the tool description. Check a "projects with links" question afterwards.

## 3. Show tool calls in replies
Good for UX, also benefits the visitors in a way that they can see the how the model is generating the answer
from real sources using tools. This gives an indication to visitors that the answers are not self-made/invented.

Pass `replyDetails: { tools: true }` to `handleChatRequest` (and to `loadVisitorChat`, with the `profile`).
Each lookup then arrives as a tool part whose input has only `section` and `skillFilter`, and whose output is
`{ status, title? }`. Render them in the chat UI.

## 4. Show model id in replies
Pass `replyDetails.model(id)`, returning the name to show (or `undefined` for none). It arrives as
`messageMetadata: { model }` on `finish`; with failover it names the model that actually answered.

## 5. Use the library's background GitHub refresh
`@promptfolio/source-github` now does what `lib/github-refresh.ts` and `lib/github-source.ts` do.

1. Implement `GitHubSnapshotStore` on Redis: `get` and `set` for the keys `snapshot` and `refresh-after`, and
   `lock(ttlSeconds)` returning a token, with `unlock(token)`.
2. Call `createBackgroundGitHubSource({ store, config, token, runAfterResponse: after })`, use its
   `loadProfile(owner)` in place of the app's own loader, and log the `refreshIfDue` outcome
   (`not-due`, `locked`, `complete`, `partial`, `failed`).
3. Defaults match the app (6 h after a complete refresh, 1 h after a partial or failed one, 120 s lock); set
   `intervals` only if they differ.
4. Check whether the snapshot already stored in Redis can be reused under the new keys, or let the first
   refresh write it again.
5. Delete the app's own refresh code once the library version works.
