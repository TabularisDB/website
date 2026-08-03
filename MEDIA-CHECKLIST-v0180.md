# Media checklist — v0.18.0

Working document. Nothing in it has been embedded yet: the release post and the wiki
edits reference only media that already exists under `public/`. Capture what you want,
drop it in, then embed and delete this file.

Conventions in use:

- Images: `public/img/tabularis-<slug>.png`
- Videos: `public/videos/posts/tabularis-<slug>.mp4` **plus** a `.jpg` poster of the same name
- Post embeds: `<video src="…" poster="…" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>`
- Wiki embeds: same, with `controls controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture`

---

## 1. New media for the release post

`content/posts/v0180-user-privileges-connection-diagnostics-grid-selection.md`

| Section | Proposed file | What it should show |
| --- | --- | --- |
| ✅ Users & Privileges for MySQL and MariaDB — **shot (1392×912). NOT embedded: the video covers the same ground on both the post and the wiki page, so the still would be redundant. Kept as the `og.image` asset only.** | `img/tabularis-user-management.png` | The Users & Privileges tab: account list on the left with a Locked badge visible, privilege cards for global + database scope on the right, checkboxes reflecting real grants. **Highest priority — this is the release's headline and has no media at all.** |
| ✅ Users & Privileges (create flow) — **shot, embedded in post + `wiki/user-management.md` + `/videos` (`users-and-privileges`)** | `videos/posts/tabularis-user-management-grant.mp4` + `.jpg` | Create a user, grant `SELECT`/`INSERT` on one database at creation time, then narrow an `ALL PRIVILEGES` account down to a subset so the revoke-then-grant behaviour is visible. |
| ✅ The Connection Test Tells You Where It Failed — **shot, embedded in post + `wiki/connections.md`. Caveat: the classified summary / recovery hint are not visible in the take (EOF error, unclassified); a `ssh-auth` re-shoot would show them** | `videos/posts/tabularis-connection-diagnostics.mp4` + `.jpg` | A test against a host behind SSH: the live step indicator moving through SSH tunnel → DB connect, then a deliberate failure opening the diagnostics modal with the classified summary and the timestamped step log. Second-highest priority. |
| ⛔️ Test SSH (same section) — **skipped: the connection-diagnostics video already covers this path; not worth re-staging the bastion for a still** | `img/tabularis-test-ssh.png` | The SSH tab with the **Test SSH** button and a success result rendered inside the tab. Can be a still if the video above already covers the failure path. |
| ✅ All-Databases Mode — **shot (1392×912), embedded in post + `wiki/connections.md` (Multi-Database Support)** | `img/tabularis-all-databases-mode.png` | The Databases tab with the **All databases** / **Choose databases** mode switch, All databases selected, and the explanatory hint visible. |
| ✅ The Data Grid Gets a Real Selection Model — **shot, embedded in post + `wiki/data-grid.md` (Keyboard Navigation). Caveat: no `Cmd+A` beat, and `Copy All` carries no count in the UI (only `Select All (500)` does), so the post's "Copy All (M)" pairing is not visible** | `videos/posts/tabularis-grid-selection.mp4` + `.jpg` | Arrow-key navigation, then `Cmd/Ctrl+A`, then the row context menu showing **Copy Selected (N)** next to **Copy All (M)**, then a Shift+click cell rectangle with **Copy Range (R×C)**, ending on the row-count toast. |
| ✅ The Run Button Says What It Will Run — **shot, embedded in post + `wiki/editor.md`. All four states captured, tooltip included** | `videos/posts/tabularis-run-target-label.mp4` + `.jpg` | Short clip: paste a multi-statement script, watch the button read **Run Statement**, select text, watch it become **Run Selection**, then hover for the `Run All` tooltip. |
| ✅ Editor Tabs Reorder by Drag — **shot, embedded in post + `wiki/editor.md` (Reordering Tabs). Re-shot at our size rather than reusing the PR #517 clip** | `videos/posts/tabularis-reorder-tabs.mp4` + `.jpg` | Dragging a notebook tab past two console tabs with the insertion line visible. PR #517 has a contributor-recorded demo that could be re-shot at our usual size. |
| ✅ The ER Diagram Exports, and Stops Overlapping — **shot (2000×1392), embedded in post + `wiki/er-diagram.md` (Export). The wide `enum(...)` on `orders.status` is in frame with no overlap, so it covers PR #558 too** | `img/tabularis-er-export-menu.png` | The ER diagram toolbar with the Export menu open on Mermaid / DBML, ideally on a schema with a wide `enum(...)` column so the no-overlap layout is visible in the same frame. |
| ✅ PostgreSQL: Editable hstore — **shot (1392×912), embedded in post. Staged on a purpose-built `tabularis_demo.device_settings` table (hstore extension installed for it)** | `img/tabularis-hstore-editor.png` | An `hstore` column opened in the row-editor sidebar's JSON editor. |
| ✅ Create a SQLite Database from Inside the App — **shot (1392×912), embedded in post. Went with the modal flow: the `+ New` button next to the file path plus the save dialog it opens** | `img/tabularis-new-sqlite-database.png` | The Connections menu with **New SQLite Database…**, or the file picker with the **+ New** button. |

### `og.image`

Currently `/img/tabularis-connection-manager.png` — reused, and it predates every
change in this release. Replace it with `img/tabularis-user-management.png` once that
exists: the headline feature belongs on the card. The `og.template` is
`screenshot-split`, so a wide 16:9-ish screenshot works best.

---

## 2. Stale media on pages touched by this release

| Page | File | Why it is now stale |
| --- | --- | --- |
| ✅ `content/wiki/connections.md` (hero) — **re-shot** (1392×912, "Prod MySQL", successful test in the footer with the Show log link). Overwrites the file used by 16 references: 2 wiki heroes, 6 SEO pages, 4 historical posts' `og.image`, and the home feature card | `img/tabularis-connection-manager.png` | Predates the Databases-tab mode switch, the classified error summary in the footer, the live step indicator and the Show log link. |
| `content/wiki/connections.md` + `content/wiki/ssh-tunneling.md` | `img/tabularis-ssh-tunneling.png` | The SSH tab now has a **Test SSH** button, an in-tab result area and a Stop button. Shared by both pages, so one re-shoot fixes two. |
| ⛔️ **skipped** — `content/wiki/er-diagram.md` (hero) | `img/tabularis-schema-management-er-diagram.png` | Toolbar predates the **Export** button and the **Lock node positions** toggle. Also used on the home page feature card (`src/app/page.tsx`), so the re-shoot lands in two places. |
| `content/wiki/configuration.md` | `img/tabularis-settings-general.png` | Not wrong, but the editor font picker gained JetBrains Mono ExtraBold / ExtraBold Italic. Low priority — only re-shoot if the font list is in frame. |
| `content/wiki/data-grid.md` | `videos/wiki/06-data-grid.mp4` | Predates keyboard navigation and the split of Copy Selected / Copy All. The new sections have no media; the grid-selection video from section 1 above could be reused here with `controls`. |
| `content/wiki/editor.md` | `videos/wiki/02-sql-editor.mp4` | Predates the labelled Run button and draggable tabs. |

## 3. New wiki sections with no media at all

| Page | Section | Suggestion |
| --- | --- | --- |
| `content/wiki/user-management.md` (new page) | whole page | Needs a hero image — reuse `img/tabularis-user-management.png` from section 1. It is currently the only wiki page with no media. |
| `content/wiki/connections.md` | Testing before saving | Reuse `videos/posts/tabularis-connection-diagnostics.mp4`. |
| `content/wiki/connections.md` | Multi-Database Support | Reuse `img/tabularis-all-databases-mode.png`. |
| `content/wiki/data-grid.md` | Keyboard Navigation / Cell range selection | Reuse `videos/posts/tabularis-grid-selection.mp4`. |
| `content/wiki/editor.md` | The Run Button Says What It Will Run | Reuse `videos/posts/tabularis-run-target-label.mp4`. |
| `content/wiki/editor.md` | Reordering Tabs | Reuse `videos/posts/tabularis-reorder-tabs.mp4`. |
| `content/wiki/er-diagram.md` | Export | Reuse `img/tabularis-er-export-menu.png`. |
| `content/wiki/ssh-tunneling.md` | Test SSH from the connection modal | Reuse `img/tabularis-test-ssh.png`. |
| `content/home.md` | 👥 Users & Privileges tile | The home page renders tiles without images, so nothing is required — but if the feature-card grid in `src/app/page.tsx` gains a card for it, it needs `img/tabularis-user-management.png`. |
