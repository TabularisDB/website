---
title: "Keyboard Shortcuts"
order: 7
excerpt: "Full reference of keyboard shortcuts available in Tabularis, with instructions for customizing your own bindings."
category: "Customization"
---

# Keyboard Shortcuts

Tabularis ships with a set of keyboard shortcuts for common actions across navigation, the editor, and the data grid. All shortcuts use **Cmd** on macOS and **Ctrl** on Windows/Linux.

<video src="/videos/wiki/10-keyboard-shortcuts.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

---

## Navigation

| Action | macOS | Windows / Linux |
| :--- | :--- | :--- |
| Command palette: object search (tables, views, routines, triggers) | `⌘+P` | `Ctrl+P` |
| Command palette: actions | `⌘+Shift+A` | `Ctrl+Shift+A` |
| Focus the sidebar table filter | `⌘+Shift+F` | `Ctrl+Shift+F` |
| Toggle sidebar | `⌘+B` | `Ctrl+B` |
| Toggle row editor sidebar (right) | `⌘+Shift+B` | `Ctrl+Shift+B` |
| Open connections page | `⌘+Shift+C` | `Ctrl+Shift+C` |
| New connection (opens modal) | `⌘+Shift+N` | `Ctrl+Shift+N` |
| Switch to Nth open connection | `⌘+Shift+1–9` | `Ctrl+Shift+1–9` |
| Paste / import from clipboard | `⌘+Shift+V` | `Ctrl+Shift+V` |

---

## Editor

| Action | macOS | Windows / Linux |
| :--- | :--- | :--- |
| Run query | `⌘+F5` | `Ctrl+F5` |
| Run query (from Monaco editor) | `⌘+Enter` | `Ctrl+Enter` |
| New console tab | `⌘+T` | `Ctrl+T` |
| Close current tab | `⌘+W` | `Ctrl+W` |
| Switch tab (circular) | `Ctrl+Tab` | `Ctrl+Tab` |
| Copy selection | `⌘+C` | `Ctrl+C` |
| Format SQL (buffer or selection) | `⇧+⌥+F` | `Shift+Alt+F` |
| Multi-Cursor (click) | `⌘+Click` | `Ctrl+Click` |
| Add next occurrence | `⌘+D` | `Ctrl+D` |
| Select all occurrences | `⌘+Shift+L` | `Ctrl+Shift+L` |
| Cursors at line ends | `⌥+Shift+I` | `Alt+Shift+I` |
| Copy line up | `⌥+Shift+↑` | `Ctrl+Shift+↑` |
| Copy line down | `⌥+Shift+↓` | `Ctrl+Shift+↓` |

---

## Notebook

| Action | macOS | Windows / Linux |
| :--- | :--- | :--- |
| Run All Cells | `⌘+Shift+Enter` | `Ctrl+Shift+Enter` |

---

## Data Grid

| Action | macOS | Windows / Linux |
| :--- | :--- | :--- |
| Next page | `⌘+→` | `Ctrl+→` |
| Previous page | `⌘+←` | `Ctrl+←` |
| Save grid changes | `⌘+S` | `Ctrl+S` |
| Move the focused cell | `↑` `↓` `←` `→` | `↑` `↓` `←` `→` |
| First / last column of the row | `Home` / `End` | `Home` / `End` |
| Move one viewport of rows | `PageUp` / `PageDown` | `PageUp` / `PageDown` |
| Edit the focused cell | `Enter` or `F2` | `Enter` or `F2` |
| Select all loaded rows | `⌘+A` | `Ctrl+A` |
| Copy the current selection | `⌘+C` | `Ctrl+C` |
| Paste at the selection (staged as pending changes) | `⌘+V` | `Ctrl+V` |

Cell navigation is bound to the grid you last interacted with, so a notebook with one grid per SQL cell does not move them all at once. Keys are left alone inside text inputs, open cell editors, the foreign-key and BLOB buttons, and the sortable column headers. See [Data Grid → Keyboard Navigation](/wiki/data-grid#keyboard-navigation).

---

## Customizing Shortcuts

Most shortcuts can be reassigned from **Settings → Keyboard Shortcuts**. Each row in the table shows:

- A **lock icon** for built-in shortcuts that cannot be changed (Monaco editor bindings, browser-level shortcuts).
- An **Edit** button for customizable shortcuts.

Click **Edit** on any customizable row, then press the key combination you want to assign. The recorder captures modifier keys (Cmd/Ctrl, Shift, Alt) plus the final key. Press **Escape** to cancel. Changes are saved immediately to `keybindings.json` in your config directory.

To revert a customized shortcut to its default, click the **↺** (reset) button on its row.

---

## keybindings.json

Tabularis stores your overrides in a JSON file in the OS config directory:

| Platform | Path |
| :--- | :--- |
| macOS | `~/Library/Application Support/tabularis/keybindings.json` |
| Linux | `~/.config/tabularis/keybindings.json` |
| Windows | `%APPDATA%\tabularis\keybindings.json` |

The file is only created when you first customize a shortcut. Its format is a map from shortcut ID to platform-specific `KeyMatch` objects:

```json
{
  "toggle_sidebar": {
    "mac": { "metaKey": true, "key": "k" },
    "win": { "ctrlKey": true, "key": "k" }
  },
  "new_tab": {
    "mac": { "metaKey": true, "key": "n" },
    "win": { "ctrlKey": true, "key": "n" }
  }
}
```

Each `KeyMatch` supports the following fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `key` | string | The key value (e.g. `"b"`, `"ArrowRight"`, `"F5"`) |
| `ctrlKey` | boolean | Ctrl modifier |
| `metaKey` | boolean | Cmd/Meta modifier |
| `shiftKey` | boolean | Shift modifier |
| `altKey` | boolean | Alt/Option modifier |

You can edit this file manually if you prefer. Tabularis reads it at startup; changes while the app is running take effect after a restart.
