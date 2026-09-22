---
title: "Themes & Customization"
order: 9
excerpt: "Personalize your workspace with 12 built-in themes, installable theme packages and full typography control."
category: "Customization"
---

# Themes & Customization

A developer tool should adapt to your preferences. Tabularis ships with a robust, CSS-variable-based theming engine that ensures every pixel—from the sidebar to the SQL editor—feels cohesive.

![Appearance settings with built-in and installed theme variants](/img/tabularis-appearance-section.png)

## Built-In Themes

Switch themes instantly in **Settings → Appearance**. Changes apply immediately without requiring a restart or refreshing the DOM.
- **Dark Themes**: Tabularis Dark, Monokai, One Dark Pro, Nord, Dracula, GitHub Dark, Solarized Dark, Gruvbox Material Dark, High Contrast.
- **Light Themes**: Tabularis Light, Solarized Light, Gruvbox Material Light.

## Theme Mode: Static or Follow System

Since v0.22.0 the **Theme Mode** switch in **Settings → Appearance** decides whether the theme is fixed or tracks the operating system:

![Settings → Appearance in Follow System mode with separate Light Theme and Dark Theme pickers](/img/tabularis-theme-mode-follow-system.png)

- **Static** (default): one theme, chosen from the picker, applied regardless of the OS appearance.
- **Follow System**: two pickers, **Light Theme** and **Dark Theme**, each listing only themes of that classification (custom themes are classified by their Monaco base theme). Since v0.24.0, Tabularis uses native appearance signals and Linux desktop-portal preferences to apply the matching pick as the OS switches; the native window chrome follows the system too. `prefers-color-scheme` is retained as the browser-preview fallback, rather than overriding a native dark preference with WebKit's light result.

Toggling Follow System applies the current-mode theme immediately. If a picked theme no longer exists (a deleted custom theme, for example), the built-in preset for the current OS mode is used instead, and deleting a custom theme clears any per-mode pick that referenced it. The SQL editor theme is unaffected: **Same as App** follows the switch, an explicit editor theme stays fixed.

The mode is stored in `config.json` as `followSystemTheme`, `lightThemeId` and `darkThemeId`. When the fields are absent the app is in Static mode, so existing installs are unchanged. See [Configuration](/wiki/configuration).

## Theme Packages (since v0.25.0)

Themes are no longer limited to the built-in presets and single-file personal themes. Since v0.25.0 a theme can be distributed as a **declarative package**: a ZIP with a `.tabularium` manifest of `kind: "theme"` and one JSON definition per variant (typically a light and a dark one). A package contains data only. No code is executed, and theme packages never take part in driver activation.

### Managing themes

**Settings → Appearance → Manage themes** lists built-in, personal and installed themes together.

- **Preview** applies a theme temporarily and shows a read-only SQL sample rendered with the shared Monaco renderer. **Cancel** or Escape restores the saved selection, taking the current system mode into account; **Apply** saves it.
- Installed packages are read-only. **Duplicate as personal** creates an independent copy that **Edit personal theme** can change.
- The application theme and the SQL editor theme are selected independently. The Follow System light and dark picks work with installed variants.
- **Import Tabularis JSON** and **Export standalone JSON** keep the single-file format. **Import from VS Code** converts a VS Code JSON or JSONC theme, lists what could not be mapped, and asks for the light or dark base when it cannot detect it. **Export author package** writes the package layout for a theme you intend to publish.
- **Local package** previews and installs a ZIP from disk. Installation is bound to the validated archive digest: rebuild the ZIP and you preview again before installing.

Installing a package never selects a variant on its own. Close the dialog and pick the variant explicitly.

<div class="post-gallery">
  <img src="/img/tabularis-theme-manager-preview.png" alt="Previewing an installed Ember theme with a read-only SQL sample" loading="lazy">
  <img src="/img/tabularis-theme-vscode-import.png" alt="Importing a VS Code theme with mode selection and conversion diagnostics" loading="lazy">
</div>

<video class="video-borderless" src="/videos/posts/tabularis-theme-package-install.mp4" poster="/videos/posts/tabularis-theme-package-install.jpg" autoplay loop muted playsinline style="width:100%;border-radius:8px;margin:1rem 0"></video>

### Installing from the registry

**Settings → Plugins** has a **Filter by type** control with **Drivers** and **Themes**. Theme packages published to the [Tabularium registry](https://registry.tabularis.dev) are installed, updated, enabled, disabled and uninstalled there, next to drivers, and `tabularis://install/<slug>` deep links work for them too. Uninstalling a theme package reuses the plugin removal dialog and affects every variant of the package. A package must declare `min_runtime_version: "0.25.0"` or later; older clients refuse it.

The install lifecycle validates the archive with size bounds, checks every path and payload, stages the package privately under a lock, and commits it by atomic replacement with rollback on failure. Interrupted operations are repaired only through the explicit **Recover interrupted installs** action. A saved selection that points at a package that is currently unavailable falls back to a built-in theme without overwriting your preference; when the package is enabled or reinstalled, the selection is restored.

Packages are stored by kind under the app data directory, in `plugins/themes/<package>/` beside `plugins/drivers/<package>/`. Personal themes exported before v0.25.0 remain where they were and keep working.

![Plugin Center filtered to Themes, showing the locally installed Ember package](/img/tabularis-plugin-themes.png)

### Authoring a theme

`@tabularis/create-plugin` 0.3.0 ships a second binary, `tabularis-theme`, which scaffolds a two-variant repository, validates both variants offline with the same schemas the app uses, and builds a deterministic ZIP. The generated repository includes a read-only validation workflow for branches and pull requests and a separate draft-release workflow for tags. Theme definitions and manifests may carry optional `$schema` hints for editor completion; the runtime ignores them for validation and never fetches a remote schema. The full guide is [THEMES.md](https://github.com/TabularisDB/tabularis/blob/main/packages/create-plugin/THEMES.md); [Ember](https://github.com/TabularisDB/tabularis-ember-theme) is the reference two-variant theme.

## Typography Configuration

Readability is critical when parsing logs or complex queries.
- **Font Family**: You can use any monospace font installed on your system. We highly recommend coding-specific fonts like *JetBrains Mono*, *Fira Code*, or *Cascadia Code*.
- **Result Font** (since v0.24.0): **Settings → Appearance → Data Grid → Result font** offers **Same as interface**, bundled families and a custom family. It applies to result cells, inline edit inputs and multiline textareas. The default stays JetBrains Mono. The `resultFontFamily` value `inherit` follows subsequent interface-font changes; editor, log and hex fonts remain independent.
- **Ligatures**: If your chosen font supports programming ligatures (e.g., combining `<=` into `≤`), Tabularis and the Monaco editor will render them natively.
- **Font Size & Weight**: Fully adjustable via the UI.

![Independent result-font picker with Same as interface selected](/img/tabularis-result-font.png)

## CSS Variables

Tabularis applies themes by setting CSS custom properties on the `<html>` element. The full set of variables used by the UI is:

```css
/* Background */
--bg-base, --bg-elevated, --bg-overlay, --bg-input, --bg-tooltip

/* Surface */
--surface-primary, --surface-secondary, --surface-tertiary
--surface-hover, --surface-active, --surface-disabled

/* Text */
--text-primary, --text-secondary, --text-muted
--text-disabled, --text-accent, --text-inverse

/* Accent */
--accent-primary, --accent-secondary
--accent-success, --accent-warning, --accent-error, --accent-info

/* Border */
--border-subtle, --border-default, --border-strong, --border-focus

/* Semantic (data grid cell values) */
--semantic-string, --semantic-number, --semantic-boolean, --semantic-date
--semantic-null, --semantic-pk, --semantic-fk, --semantic-index
--semantic-modified, --semantic-deleted, --semantic-new

/* Typography */
--font-base, --font-mono, --font-result

/* Layout */
--radius-sm, --radius-base, --radius-lg, --radius-xl
```

## Monaco Editor Integration

For built-in preset themes (Monokai, Dracula, Nord, GitHub Dark, etc.) Tabularis loads a matching dedicated Monaco JSON theme file. For custom themes, Monaco colors are derived automatically from the theme's color object. In both cases the switch is instantaneous and requires no restart.
