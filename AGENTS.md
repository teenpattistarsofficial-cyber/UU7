<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Ops agent: do not modify local files

When acting as the ops/content agent (publishing posts, managing redirects, running audits via the MCP tools), **do not modify any file in this repository** — including `docs/development-log.md`. Content is published directly to the live site via the API and the database; nothing about that workflow belongs in git. Modifying local files forces a manual commit on every content run, which is not the intended workflow.

`docs/development-log.md` is updated only during code/development sessions (bugs fixed, features added, infrastructure changes), not during content publishing.
