# TODOs in this app

## Show model id in replies
Optional

## Show tool calls in replies
Good for UX, also benefits the visitors in a way that they can see the how the model is generating the answer from real sources using tools. This gives an indication to visitors that the answers are not self-made/invented.

---

# TODOs in the promptfolio libraries

## Stream tool calls 
@promptfolio/ai currently strips tool chunks before they reach the browser. 
Its forVisitor filter only passes text and step chunks (VISITOR_CHUNK_TYPES in chat-turn.ts:156).
Responses have no tool calls in it. Showing them requires an option in Promptfolio.

This has two drawbacks:
- Ui can't show tool calls
- Tool calls are lost between chat turns, model loses the context what he had executed and got in previous turn, resulting in responses without the sources link.

## Include links in listProfileRecords results
`listProfileRecords` returns each project's id, name, description, and skills, but not its links (`summarizeProject` in `grounding/profile-tools.ts`). Only `getProfileRecord(id)` returns links, one record per call.

Weaker models stop after the list and answer without links. With `openai/gpt-4o-mini`, "with links" made 5 `listProfileRecords` calls, 0 `getProfileRecord` calls, and finished in 2 of 4 steps, so no limit stopped it. The answer said "along with links" but had none, or used `#` placeholders. The `additionalInstructions` workaround in `app/api/chat/route.ts` (call `getProfileRecord` for links) did not change this.

Leaving links out is deliberate ("to keep list results small", comment above `summarizeRole`), but repository summaries already include their `url`, and ADR 0014 made links how answers show their sources.

Fix:
1. Add `links` to `summarizeProject`, and update the comment above it.
2. Say the list includes links in the `listProfileRecords` description.
3. Drop "or links" from the `getProfileRecord` rule in `system-prompt.ts`.
4. Re-run the evaluation, and record the change in an ADR.

## Stream model id
Send model id in responses to browser.

## Log model id
Add model id in loggers of tool calls, response completions, etc. for easier debugging.

## Log more details about tool calls

The following logs looks like the same exact call is executed multiple times.

```
[chat 4d14a6d1] tool call { tool: 'listProfileRecords', outcome: 'listed' }
[chat 4d14a6d1] tool call { tool: 'listProfileRecords', outcome: 'listed' }
[chat 4d14a6d1] tool call { tool: 'listProfileRecords', outcome: 'listed' }
[chat 4d14a6d1] tool call { tool: 'listProfileRecords', outcome: 'listed' }
[chat 4d14a6d1] tool call { tool: 'listProfileRecords', outcome: 'listed' }
```

But in reality, model called the `listProfileRecords` for 5 different sections (experience, projects, repositories, contributions, education). Show additional details in tool calls logs for making them differenciable.
