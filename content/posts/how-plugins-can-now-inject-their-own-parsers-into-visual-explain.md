---
title: "How plugins can now inject their own parsers into Visual EXPLAIN"
date: "2026-09-04T18:30:00"
authors: ["debba"]
tags: ["explain", "sql-server", "plugins", "architecture", "typescript", "rust", "extensibility"]
excerpt: "explain.tabularis.dev now reads SQL Server plans, and the parser does not live in the core. This is how @tabularis/explain got a parser registry, how a driver plugin ships its own parser as a bundle the app loads at runtime, and why the SQL Server plugin finally lands next week."
og:
  template: "code-terminal"
  title: "How plugins can now inject"
  accent: "their own parsers into Visual EXPLAIN."
  claim: "A driver plugin returns raw plan output and ships its own TypeScript parser. The desktop app and explain.tabularis.dev load the same bundle. Visual EXPLAIN gained a registry and nothing else."
  image: "/videos/posts/explain-sqlserver.jpg"
  codeTitle: "explain.tabularis.dev · sqlserver"
  codeLines:
    - "SET STATISTICS XML ON;"
    - "SELECT c.name, SUM(o.total) FROM dbo.orders o"
    - "  JOIN dbo.customers c ON c.id = o.customer_id"
    - "  GROUP BY c.name;"
    - '<ShowPlanXML Version="1.564" Build="16.0.4">'
    - "engine: sqlserver · format: sqlserver-showplan-xml"
---

# How plugins can now inject their own parsers into Visual EXPLAIN

This week <a href="https://explain.tabularis.dev" target="_blank" rel="noopener noreferrer">explain.tabularis.dev</a> understands SQL Server. You run your query with `SET STATISTICS XML ON`, or `SET SHOWPLAN_XML ON` if you only want the estimated plan, copy the XML that comes back and paste it into the page. The plan opens as the same interactive graph, diagram, table and stats views that PostgreSQL, MySQL and SQLite plans have had since July. Everything runs in the browser and nothing is uploaded.

<video src="/videos/posts/explain-sqlserver.mp4" poster="/videos/posts/explain-sqlserver.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

The operator tree is what you would expect from a SHOWPLAN: Table Scan, Index Seek, Clustered Index Seek, Nested Loops, Hash Match, Sort, Top, Compute Scalar, Parallelism. For actual plans you also get estimated versus actual rows per operator, the number of executions on the inner side of a join, and the self time and cumulative cost that make the hot branch stand out. Pasted XML is pretty-printed and highlighted, since SQL Server hands it to you as a single very long line.

This is a small feature to describe and it took a surprisingly long path to ship. I want to write down that path, because the interesting part is not SQL Server. It is what had to change in Tabularis so that a plugin could bring its own EXPLAIN parser.

## Where the parser used to live

When I <a href="/blog/extracting-visual-explain">extracted Visual EXPLAIN</a> into the `@tabularis/explain` package this summer, the boundary I settled on was: drivers stop at raw EXPLAIN output, and everything after that, parsing, exclusive metrics, findings and views, belongs to the package. That boundary worked well for the three built-in engines, and it is what made the online visualizer possible in the first place.

It had a limit I did not think about enough at the time. The list of raw formats was a closed union of five string literals, dispatched by an exhaustive `switch`. Only a parser compiled into the package could handle a format. Plugins had a different contract altogether: a driver plugin's `explain_query` response was always a fully parsed plan, built inside the plugin process.

For SQL Server that meant the plugin carried a Rust SHOWPLAN parser. It worked, and it had good tests, but it had three problems. The parser could only evolve with a Rust binary release. Anyone wanting SQL Server plans in a browser would have to write a second parser, because a web page cannot spawn a plugin process. And every plan-model improvement in `@tabularis/explain` had to be mirrored by hand on the Rust side to stay in sync.

The fix I wanted was not "add SQL Server to the core package". SQL Server support was already becoming a plugin, and I did not want the core to learn one more engine each time a driver plugin appears. I wanted the plugin to own its parser and the core to be able to load it.

## What changed in the core

The work landed in two steps in the Tabularis repository.

The first is <a href="https://github.com/TabularisDB/tabularis/commit/f64db40e" target="_blank" rel="noopener noreferrer">a parser registry</a> in `@tabularis/explain`, released as 0.2.0. A parser is now a small descriptor: an engine id, a globally unique format tag, an optional label, a `parse` function and an optional `sniff` function for cheap source detection.

```ts
export interface RegisteredExplainParser {
  readonly engine: string;
  readonly format: string;
  readonly label?: string;
  parse(payload: string): ExplainPlan;
  sniff?(payload: string): boolean;
}

export function registerExplainParser(parser: RegisteredExplainParser): void;
export function unregisterExplainParser(format: string): void;
```

The five built-in parsers became entries in the same registry, the exhaustive `switch` is gone, and the engine and format types are open while keeping literal autocomplete for the known values. This part is engine-neutral. The package knows nothing about SQL Server.

The second step is <a href="https://github.com/TabularisDB/tabularis/pull/688" target="_blank" rel="noopener noreferrer">PR #688</a>, which teaches the desktop app to use that registry for plugins:

- A driver plugin can now answer `explain_query` with raw output, the same `engine`, `format` and `payload` shape the built-in drivers already used, instead of a parsed plan.
- The plugin manifest gains an optional `explain_parsers` array. Each entry names the engine, the format, a label, and the path of a JavaScript bundle inside the installed plugin directory.
- When the set of enabled plugins changes, Tabularis reads each declared bundle, evaluates it with the host's `@tabularis/explain` API injected as `__TABULARIS_EXPLAIN__`, checks that the exported descriptor matches the manifest entry exactly, and registers it. Disabling the plugin unregisters its formats, and reloads happen in sorted plugin-id order so enable and disable cycles are deterministic.
- A broken bundle is isolated to its own plugin. Parse errors inside a working parser flow into the normal Visual EXPLAIN error handling.
- `min_runtime_version` is now enforced at install and at load time, with a message that names both versions. Development builds load the plugin anyway and show the mismatch as a warning toast, which is how I tested the plugin against an unreleased host.
- The raw view learned XML. It used to know JSON and plain text, and a SHOWPLAN document came out as one wrapped paragraph in Monaco.

The <a href="https://github.com/TabularisDB/tabularis/blob/main/plugins/PLUGIN_GUIDE.md" target="_blank" rel="noopener noreferrer">plugin guide</a> has a new section on this, so any third-party driver can do the same thing without waiting for a core release.

## What changed in the plugin

On the <a href="https://github.com/TabularisDB/tabularis-sqlserver-plugin" target="_blank" rel="noopener noreferrer">SQL Server plugin</a> side the Rust parser is gone. The Rust process now does the only thing that needs a database connection: it turns `SHOWPLAN_XML` or `STATISTICS XML` on, runs the statement, turns the option off again even if the statement failed, and returns the untouched XML with the format tag `sqlserver-showplan-xml`.

The parser is TypeScript and lives in the <a href="https://github.com/TabularisDB/tabularis-sqlserver-plugin/tree/main/explain" target="_blank" rel="noopener noreferrer">`explain/`</a> directory of the plugin repository. It has no runtime dependencies and uses no Node built-ins, with its own small XML reader that validates nesting, attributes, entities, comments and CDATA and ignores namespace prefixes. That is deliberate: the same source has to run in a browser tab, in the desktop IIFE and in server-side JavaScript. The build produces both an IIFE that ships inside the plugin archive and an ESM package, <a href="https://www.npmjs.com/package/@tabularis/explain-sqlserver" target="_blank" rel="noopener noreferrer">`@tabularis/explain-sqlserver`</a>, versioned and released with the plugin.

The migration was checked with golden fixtures captured from SQL Server 2022: a trivial scan, an index seek with key lookup, a parallel hash join, a `STATISTICS XML` actual plan, a missing-index recommendation and a multi-statement batch. Their expected output is what the old Rust parser produced. The Rust parser was removed only after the TypeScript one matched it on every fixture.

The online visualizer then needed very little. <a href="https://github.com/TabularisDB/explain-plan/pull/2" target="_blank" rel="noopener noreferrer">One PR</a> adds the two packages, imports `@tabularis/explain-sqlserver` for its registration side effect, and relies on the `ShowPlanXML` root element for auto-detection. There is no SQL Server code in the site itself.

## A note on how this was planned

Before writing any of this I froze the contract in a <a href="https://github.com/TabularisDB/tabularis-sqlserver-plugin/blob/main/docs/explain-architecture.md" target="_blank" rel="noopener noreferrer">design document</a> in the plugin repository, with a table of verified claims about the code at specific commits. Doing that caught two mistakes in my own first draft: I believed the Rust parser subtracted child subtree costs and mapped average row size, and it did neither. The document says so explicitly rather than quietly correcting the design. After the <a href="/blog/code-generation-was-only-the-beginning-software-development-is-becoming-a-loop">Tabularis Web migration</a> I have become quite attached to this way of working: spend the time on a plan that is checked against the repository, then let the implementation tasks be boring.

## Next week: SQL Server

The reason all of this happened now is that the SQL Server plugin is about to ship. In April I <a href="/blog/sql-server-looking-for-contributors">wrote</a> that SQL Server would be a built-in driver and not a plugin. I was wrong about that, and the <a href="/roadmap/sql-server">roadmap page</a> explains why the direction changed. The short version is that the plugin protocol caught up with what SQL Server needs, and this parser work closed the last gap I knew of.

The plugin covers connection pooling, schema introspection, query execution with multiple result sets, full CRUD, DDL, triggers, stored routines, database users and privileges, BLOBs and visual execution plans. It requires Tabularis 0.23.0, the first release with raw plugin EXPLAIN output and parser bundle loading. Both are planned for next week.

Until then, if you have a SQL Server plan you have been squinting at in Management Studio, paste it into <a href="https://explain.tabularis.dev" target="_blank" rel="noopener noreferrer">explain.tabularis.dev</a> and tell me what looks wrong. The parser is new and real plans are the best test fixtures I can get.

:::star:::
