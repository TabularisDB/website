---
title: "v0.10.2: Postgres on AWS RDS, Cell-Level Copy, and SQL INSERT Export"
date: "2026-05-08T08:59:00"
release: "v0.10.2"
tags: ["release", "bugfix", "postgres", "data-grid", "tls", "community"]
excerpt: "v0.10.2 fixes a Postgres TLS handshake that broke AWS RDS connections on macOS, lands cell-level selection and SQL INSERT as a copy format in the data grid, restores MySQL passwordless connections, and unbreaks the Manage SSH Connections button."
og:
  title: "v0.10.2:"
  accent: "RDS, Cells, INSERT."
  claim: "rustls + ssl_ca for AWS RDS over Postgres, single-cell copy and SQL INSERT export in the data grid, and a handful of community-reported regressions closed."
  image: "/img/tabularis-sql-editor-data-grid.png"
---

# v0.10.2: Postgres on AWS RDS, Cell-Level Copy, and SQL INSERT Export

**v0.10.2** is another short follow-up to [v0.10.1](/blog/v0101-pagination-fix-context-menu-postgres-bindings). Four days after the patch, three users opened three independent issues — two against the connection layer, one against an SSH modal that suddenly stopped opening — and a handful of data grid features were already on their way in. v0.10.2 closes the issues, lands the features, and goes out the door.

If v0.10.1 was about smoothing the AI safety release, v0.10.2 is about getting connections to work where they should and making the data grid a little more useful once you're inside.

---

## Postgres on AWS RDS Works now

This is the headline fix, and the kind of bug that's particularly painful: "Test connection" succeeds, schemas load, then 30 seconds later the health check pings the pool, the TLS handshake fails, and the UI tells you the connection was lost. Reproducible across restarts. Indistinguishable from "the database is down" if you don't read the logs.

[@benedettoraviotta](https://github.com/benedettoraviotta) reported it in [#166](https://github.com/TabularisDB/tabularis/issues/166) and shipped the fix in PR [#167](https://github.com/TabularisDB/tabularis/pull/167). The diagnosis took some patience: `tokio_postgres` only surfaces `error performing TLS handshake` and hides the underlying cause. Walking `source()` on the error chain exposes the real story — on macOS, Secure Transport applies a strict `id-kp-serverAuth` Extended Key Usage check to user-supplied root anchors and rejects valid CAs (the AWS RDS bundle is a textbook example) with "The extended key usage is not valid". Independently, the system keychain doesn't trust the regional Amazon RDS root CAs, so platform verification fails with `errSecNotTrusted (-67843)`.

The fix replaces `postgres-native-tls` with `tokio-postgres-rustls` for the deadpool path, switches the trust source to `rustls-platform-verifier`, and starts honoring `params.ssl_ca`. RDS users can now paste `https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem` into the connection's CA Certificate field and connect cleanly. MySQL/sqlx remains on `native-tls` — the bug was specific to the Postgres pool path and there was no reason to churn the rest.

The RDS bundle is intentionally **not** vendored. AWS rotates these CAs every one to three years; a vendored copy would silently break released apps the moment the next rotation lands and the user is on an old binary. Distributors who want out-of-the-box RDS support can pull the bundle at packaging time (Dockerfile `RUN`, build script, etc.) and ship it alongside the app.

If you've been bouncing off RDS since upgrading to v0.10.x, this is the upgrade.

---

## Cell-Level Selection and Copy

Up to v0.10.1, the data grid let you select rows. You could shift-click a range, ctrl-click to add to the set, and copy the lot to the clipboard. What you couldn't do was select a single cell — the whole row came along, every time.

PR [#161](https://github.com/TabularisDB/tabularis/pull/161) from [@thomaswasle](https://github.com/thomaswasle) adds cell-level selection. Click any cell and it gets a focused outline; the row checkbox stays untouched. `Cmd/Ctrl+C` copies just the cell value, formatted using the same null/length/type rules the row copy uses. A new "Copy cell" entry appears in the right-click menu for the moments when keyboard isn't faster.

The two interaction modes don't fight each other: clicking a row checkbox clears the cell focus, clicking a cell clears the row selection. So copy with an active cell focus copies the cell, copy with selected rows copies the rows. The behavior you'd expect, just without the surprises.

---

## SQL INSERT as a Copy Format

The flip side of "I want this row" is "I want to put this row somewhere else". CSV, TSV, and JSON copy formats already covered most exports. PR [#168](https://github.com/TabularisDB/tabularis/pull/168), also from [@thomaswasle](https://github.com/thomaswasle), adds **SQL INSERT** as a fourth option.

Set it once in **Settings → General → Copy format**, then copy any selected rows from the data grid. You get back a sequence of `INSERT INTO \`table\` (\`col1\`, \`col2\`, …) VALUES (…);` statements, one per line. NULLs render as `NULL`, booleans as `TRUE`/`FALSE`, numbers unquoted, strings single-quoted with single quotes doubled-up — the basics that make the output paste-able into another shell or query window without hand-editing.

It complements the duplicate-row context menu action that landed in v0.10.1: that one stays in-grid and inserts the row right where it sits, this one ships the row out as text.

:::newsletter:::

---

## Postgres Boolean Submit Error

[@simonwang1024](https://github.com/simonwang1024) reported in [#155](https://github.com/TabularisDB/tabularis/issues/155) that editing a value in a Postgres result grid and pressing **Submit** returned an error. The path involved was the `binding` module that landed in v0.10.1: when the data grid sends an edited value back, it serializes the cell as a string, and the binding layer maps it to a typed parameter based on the column type.

For boolean columns, the column type was correctly identified, but the value still arrived as a string (`"true"`, `"false"`, `"t"`, `"f"`, `"1"`, `"0"`) and the bind was rejected because Postgres expects a real `bool`. The fix coerces the common string forms to a `bool` before binding, with 105 lines of new tests covering the cases that come out of the data grid, JSON inputs, and SQL editor parameters. Edits to boolean columns now go through cleanly.

---

## Smaller Things

Two community-reported regressions round out the release, both from [@MischaKr](https://github.com/MischaKr):

- **MySQL passwordless connections** ([#164](https://github.com/TabularisDB/tabularis/issues/164), fixed in [#169](https://github.com/TabularisDB/tabularis/pull/169)). After the v0.10.1 connection URL refactor, MySQL connections without a password were producing URLs with a trailing colon (`user:@host`), which some servers reject and some accept silently with surprising behavior. The fix simply omits the password segment entirely when the field is empty, so the URL ends up as `user@host`. The connection-URL test fixture got an updated assertion to lock the behavior in.
- **Manage SSH Connections button** ([#163](https://github.com/TabularisDB/tabularis/issues/163), fixed in commit [9eb48e2](https://github.com/TabularisDB/tabularis/commit/9eb48e28da50fefaaab712f282ea76b9a58fa735)). The button rendered, but clicking it did nothing — the SSH connections modal was opening underneath another overlay and getting click-blocked. A z-index bump and a backdrop-blur tweak put it on top where it belongs.

---

## Thanks

Three external contributors land in v0.10.2 and each fixed a different layer of the stack. **[@benedettoraviotta](https://github.com/benedettoraviotta)** for the AWS RDS TLS investigation — diagnosing a "TLS handshake failed" through two layers of error wrapping, two macOS-specific quirks, and two TLS stacks isn't trivial work, and the PR came in with the rustls swap, the platform verifier, the `ssl_ca` honoring, and the call to *not* vendor the RDS bundle. That last call is the one I'd have got wrong. **[@thomaswasle](https://github.com/thomaswasle)** for two more data grid PRs — cell selection and SQL INSERT export — both small in diff and immediately useful. **[@simonwang1024](https://github.com/simonwang1024)** and **[@MischaKr](https://github.com/MischaKr)** for the bug reports that kept the release honest. Two of Mischa's three issues this cycle turned into shipped fixes; the third (`#164`, MySQL passwordless) became the first commit on the way to this tag.

If you connect to AWS RDS, edit boolean columns, or use MySQL without a password, this is the upgrade.

:::contributors:::

---

_v0.10.2 is available now. Update via the in-app updater, or download from the [releases page](https://github.com/TabularisDB/tabularis/releases/tag/v0.10.2)._
