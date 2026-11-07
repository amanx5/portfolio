<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

The aim is to develop a minimal personal chat based portfolio powered by [Promptfolio](https://github.com/promptfolios/promptfolio).

Source code of promptfolio monorepo is present locally on this system [here](../promptfolio/). It also has a reference app [here](../promptfolio/apps/portfolio/).

Guide me step by step how to implement personal portfolio in this repo.
Apply each change in the same turn you share it, then explain what changed and why. Don't commit unless I ask.

Tell me one step at a time. The step should be as minimal as possible.

Prefer [AI Elements](https://ui.shadcn.com/docs/ai-elements) and shadcn components (and their utils, such as Shimmer) over custom components. Before writing a new chat UI piece, check whether AI Elements already has one, and use or adapt it. Write a custom component only when nothing there fits, and say why.
