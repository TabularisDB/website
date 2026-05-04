---
title: "v0.10.1: Pagination Fix, Context Menu Actions, and Postgres Bindings"
date: "2026-05-04T12:00:00"
release: "v0.10.1"
tags: ["release", "bugfix", "postgres", "ux", "data-grid", "community"]
excerpt: "v0.10.1 is a short follow-up to v0.10.0: a sneaky LIMIT bug in SQL pagination gets a proper SQL tokenizer, the data grid gains multi-row deletion, duplicate row and insert-current-time actions, and the PostgreSQL driver moves to a parameterized binding module."
og:
  title: "v0.10.1:"
  accent: "Pagination, Context Menus, Bindings."
  claim: "A SQL tokenizer for pagination, three new data grid context menu actions, and a parameterized binding module for the PostgreSQL driver."
  image: "/img/tabularis-sql-editor-data-grid.png"
---

# v0.10.1: Pagination Fix, Context Menu Actions, and Postgres Bindings

**v0.10.1** is a short follow-up to [v0.10.0](/blog/v0100-ai-safety-audit-approval). The AI safety release shipped a week ago, and a few bug reports came back almost the same day. v0.10.1 closes those, lands three new context menu actions in the data grid, and rewires how the PostgreSQL driver binds parameters under the hood.

If v0.10.0 was about giving the agent a safer door into your database, v0.10.1 is about smoothing out the things you bumped into while using it.

---

## A Sneaky LIMIT Bug

This is the headline fix, and it's the kind of bug that's invisible until the day it isn't.

[@midasism](https://github.com/midasism) reported and fixed it in PR [#154](https://github.com/TabularisDB/tabularis/pull/154). When Tabularis paginates a `SELECT` in the data grid, it strips the user's `LIMIT` / `OFFSET` (if any), wraps the query, and re-applies its own pagination. The two helpers responsible — `strip_limit_offset` and `extract_user_limit` — used a naive `rfind("LIMIT")` against the raw SQL string.

That works right up until you query a table whose name happens to contain the substring `limit` (`tapp_appointment_message_event_limit` was the real-world example), or a string literal that mentions the word, or a quoted identifier. The pagination wrapper would clip the query in the wrong place and you'd end up with corrupted SQL or duplicated `LIMIT` clauses.

The fix replaces the raw string search with a small SQL tokenizer (`tokenize_sql`) that treats single-quoted strings, double-quoted identifiers, backtick-quoted identifiers, and parenthesized groups as opaque tokens. `strip_limit_offset` and `extract_user_limit` now scan backward over those tokens, so only standalone `LIMIT` / `OFFSET` keywords match. 11 new test cases cover table names containing `limit`, quoted identifiers, string literals with SQL keywords, and subqueries.

The MCP `run_query` tool got a small upgrade in the same PR: it now accepts an optional `limit` parameter (default `100`), and respects user `LIMIT` clauses inside the SQL when present. Agents that want the full result can pass an explicit value; the default keeps them from accidentally pulling a million rows into context.

If you ran into this bug after upgrading to v0.10.0, the upgrade to v0.10.1 is the fix.

---

## Three New Data Grid Actions

Three back-to-back PRs from [@thomaswasle](https://github.com/thomaswasle) extend the data grid context menu — the same one that already handles single-row delete and copy-as.

**Multi-row deletion** (PR [#158](https://github.com/TabularisDB/tabularis/pull/158)). Select multiple rows in the grid, right-click, and delete them in one shot instead of repeating the action row by row. The deletion goes through the same path as single-row delete — same confirmation, same reload behavior — so there's nothing new to learn.

**Duplicate row** (PR [#159](https://github.com/TabularisDB/tabularis/pull/159)). Right-click any row and copy it as a new INSERT, with the primary key cleared (or auto-incremented, depending on the column). Useful when you're seeding data, building a quick test fixture, or making a small variation of an existing record without writing the SQL by hand.

**Insert current time** (also PR [#159](https://github.com/TabularisDB/tabularis/pull/159)). On any timestamp/datetime cell, the context menu now offers an "insert current time" action that drops `NOW()` (or the driver's equivalent) into the cell. Small ergonomic win when you're filling rows manually.

All three actions are translated across English, Italian, Spanish, French, German, and Chinese.

:::newsletter:::

---

## Parameterized Bindings for PostgreSQL

The PostgreSQL driver had grown a sprawl of inline string-to-SQL conversions in `mod.rs` — formatting numbers, escaping strings, converting JSON arrays to PostgreSQL array literals, handling UUIDs and blobs. It worked, but each call site had to remember the right escape rules, and edge cases were easy to miss.

PR [#156](https://github.com/TabularisDB/tabularis/pull/156) extracts all of that into a dedicated `binding` module. Values are bound as proper `tokio-postgres` parameters (`$1`, `$2`, ...) instead of being interpolated into the SQL string. Numbers are cast through `bigint` / `double precision` so the bind succeeds against `int2` / `int4` / `int8` / `real` columns; UUID strings are detected and bound as the `Uuid` type so PostgreSQL receives the matching OID; arrays go through a JSON-to-array literal conversion that handles nested types; blobs respect the configured `max_blob_size`.

This is the kind of refactor where the user-facing diff is "nothing changed". 208 lines of new tests and a 350-line trim in `mod.rs` argue otherwise: edits that touch numbers, UUIDs, arrays, or binary columns now go through one well-tested code path instead of seven slightly-different ones. The kind of work that's worth doing once, before it bites again.

---

## Smaller Things

A handful of polish items round out the release:

- **Scrollable database dropdowns** ([#160](https://github.com/TabularisDB/tabularis/pull/160), thomaswasle). The Editor and Notebook database selectors used to render a flat dropdown that grew indefinitely. Past 10 databases it became unusable. Now the menu caps its visible height and scrolls.
- **Connection-modal placeholders** ([#157](https://github.com/TabularisDB/tabularis/pull/157), thomaswasle). Empty fields in the New Connection modal were rendered with a value-styled appearance, which made them look pre-filled when they weren't. Now an empty field looks empty.
- **Semver-aware "What's New"**. The in-app changelog and "What's New" dialog used naive string comparison to figure out which release notes to surface. That worked fine until a `0.10.x` versus `0.9.x` comparison came around, where `"0.10"` is lexically less than `"0.9"`. A new `versionCompare` utility (with tests) compares releases as proper semver and the changelog parser now also accepts level-one headings, so the right release notes show up after every upgrade.
- **Visual Query Builder polish**. The graph view gained a small embedded result grid, a schema metadata cache hook, and a dagre-based auto-layout pass. Useful when you're iterating on a builder query and don't want to switch to the editor tab to see the rows.

---

## Thanks

A patch release is mostly bug reports turning into PRs and PRs turning into a tag. **[@midasism](https://github.com/midasism)** for finding and fixing the LIMIT bug — that one was easy to ship and hard to spot, and you nailed both. **[@thomaswasle](https://github.com/thomaswasle)** for four PRs in a single window, all small, all good, all making the app a little more pleasant to use.

If you've been holding off because of a bug v0.10.0 left behind, this is the upgrade.

:::contributors:::

---

_v0.10.1 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.10.1)._
