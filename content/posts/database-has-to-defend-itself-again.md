---
title: "The Database Has to Defend Itself Again"
date: "2026-05-13T11:00:00"
tags: ["ai", "mcp", "safety", "audit", "opinion", "architecture"]
excerpt: "For two decades the database could outsource trust to the application layer. Once an LLM with tool access holds a live connection to production, that proxy is gone — the database has to defend itself again."
og:
  title: "The Database Has to"
  accent: "Defend Itself Again."
  claim: "Once an LLM with tool access holds a live connection to your production database, the application-as-perimeter model stops being true."
  image: "/img/tabularis-ai-audit-log-sessions.png"
---

# The Database Has to Defend Itself Again

<p><em><a href="https://arpitbhayani.me/blogs/defensive-databases" target="_blank" rel="noopener noreferrer">Arpit Bhayani&rsquo;s &ldquo;Defensive Databases for Agentic AI Systems&rdquo;</a> makes the same argument very well, and extends it from a more technical angle — broken assumptions about deterministic callers, intentional writes and brief connections, with concrete patterns like idempotency keys, role-per-agent connection pools, soft deletes and query tagging.</em></p>

For two decades the database has been able to outsource trust to the application layer. The app authenticated users, sanitized inputs, enforced business rules, and the DB just executed whatever came through the connection pool. That worked because the caller was almost always software written by someone, reviewed by someone, and shipped on a release train.

Agents don't fit that picture.

Once an LLM with tool access holds a live connection to your production database, the assumptions behind the application-as-perimeter model stop being true:

- Connections aren't short-lived anymore. A tool-using agent can keep a session open across a long reasoning loop, with the SQL emerging one token at a time.
- The caller isn't deterministic. Two runs of the same prompt can produce different queries. Sometimes very different ones.
- Writes aren't intentional in the way a human commit is. An agent will issue an `UPDATE` without a `WHERE` clause if its plan says so.
- Failures don't surface loudly. An exception that would have woken up a developer can be absorbed by the model and rationalized into the next step.

Short version: the application layer used to be the boundary. With agents in the loop, it isn't. The database has to defend itself again.

That's most of the reason the MCP safety work in Tabularis looks the way it does. The [MCP server](/wiki/mcp-server) is the actual surface where an agent and a real database meet, and that surface needs guarantees the model can't talk its way around.

A few of the pieces we shipped:

**[Read-only connections](/wiki/mcp-readonly-mode).** Not "the agent promises not to write" — the connection itself rejects writes. If the agent's plan calls for an `UPDATE` on a read-only connection, it fails at the boundary, before the row is gone. The classifier strips strings, comments and quoted identifiers before scanning the keyword, and treats anything ambiguous as a write. Fail-closed is the safer default when the alternative is a corrupted production table.

**[Approval gates](/wiki/mcp-approval-gates) with pre-flight `EXPLAIN`.** Before a write (or a heavy read) actually runs, we surface the statement together with the planner's view of it for human approval. `EXPLAIN` turns out to be the right unit here: it shows the model's intent translated into what the database will really do, and that's often where the divergence between "what the agent said" and "what would have happened" shows up. You can fix the WHERE clause inside the modal, then approve. Both the original and the edited query are kept, linked by the same approval id.

<video src="/videos/wiki/ai-gate-approval.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

:::newsletter:::

**[Query audit logs](/wiki/ai-audit-log).** Every statement an agent issues is stored locally — one line of JSON per call — with its prompt context, the connection it used, the rows it touched, and the outcome. When something goes wrong (and with agents, something goes wrong) the audit log is how you reconstruct what actually happened, not what the model claims it did.

![Tabularis MCP Activity panel grouped into sessions, with an Export as Notebook button on each session](/img/tabularis-ai-audit-log-sessions.png)

**Full MCP activity tracing.** Tool calls, results, errors, timing: the whole exchange between the agent and Tabularis is observable. Events can be flat-filtered or auto-grouped into sessions by inactivity gaps, and any session can be exported as a SQL notebook you can replay, diff against another run, or attach to a PR. When a model starts improvising, you can usually pinpoint the exact tool call where it happened.

![Detail view of a single MCP audit event, showing the query, classifier kind, connection, status and the row of context surrounding it](/img/tabularis-ai-audit-log-event-details.png)

None of these ideas are new. DBAs have wanted half of them for years. We could get away without them because the application layer was a decent proxy for "someone reasoned about this before it ran."

That proxy is gone. Putting the guarantees back inside the database itself is cheap compared to finding out, after the fact, that an agent dropped a column at 3am because its context window was full of stale documentation.

"Trust the application layer" was a fine default. With agents in the loop, it stops being one.
