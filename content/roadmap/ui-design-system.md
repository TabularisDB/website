---
title: "UI design system & visual identity"
slug: "ui-design-system"
category: "Design"
status: "planned"
order: 2
lede: "Tabularis was built by a backend developer, one modal at a time, with colors and spacing picked on the spot. It works, but it lacks a system. This initiative replaces the vibe-coded UI with a documented design system: real logo, semantic palette, one type and spacing scale, shared primitives. Not a UX rework — pure visual coherence, plus the docs needed so the next contributor doesn't have to reverse-engineer my taste."
links:
  - label: "Issue #195"
    href: "https://github.com/TabularisDB/tabularis/issues/195"
    external: true
---

## What the UI looks like today

The current frontend is functionally fine. The information architecture — sidebar, tabs, settings layout, query editor flow — is fine. The visual layer is not. Concrete examples:

- The logo is a placeholder, never replaced.
- The color palette grew organically. The CSS variables in `src/index.css` (`bg-base`, `bg-elevated`, `text-primary`, etc.) are an attempt to centralize it, but the values themselves were chosen by trial and error.
- Spacing is inconsistent across pages. `p-3` / `p-4` / `p-5` show up on similar-looking containers depending on which file was open at the time.
- Button, input and modal styles drift between the Connection modal, the Settings page, the plugin modals and the query editor toolbar.
- Icons (`lucide-react`) get a different size or stroke depending on the component.
- Light and dark themes are kept in sync manually, so they fall out of sync.

The settings page already moved in the right direction: `SettingControls.tsx` defines reusable `SettingSection`, `SettingRow`, `SettingToggle`, `SettingButtonGroup`, `SettingSlider`, `SettingNumberInput`. The rest of the app still doesn't have an equivalent.

## Scope

A real design system. Not a redesign of features or workflows.

- **Logo.** A real mark, in the sizes the app actually needs: titlebar, About, splash, favicon, OG image, GitHub social preview. Light and dark variants. Documented rules for where it appears.
- **Color palette.** Semantic roles — surface levels, text levels, accent, success, warning, danger, info. Light and dark derived from the same source instead of maintained twice by hand. The custom themes feature already exists; the built-ins should be the reference implementation.
- **Typography.** One scale applied everywhere. Today font sizes are picked per component.
- **Spacing & layout.** One spacing scale, used everywhere: modals, settings, sidebar, results grid.
- **Component primitives.** Shared `Button`, `Input`, `Select`, `Tab`, `Modal`, `Tooltip` used across the Connection modal, query editor toolbar, sidebar, DataGrid header and plugin modals — the same pattern `SettingControls.tsx` already applies to the Settings page.
- **Icon usage.** Pick a default size and stroke for `lucide-react`. Stop overriding per call site.
- **Documentation.** A short Storybook-style page or markdown doc: here's the palette, here's the scale, here's how to build a modal. So the next contributor doesn't have to reverse-engineer the conventions.

## Out of scope

- UX changes: the sidebar layout, the tab model, the query editor flow, the settings tabs are not being touched.
- Feature work: this is the visual layer only.

## Help wanted

If you have a design background — palette proposals, a logo concept, a Figma file, opinions on the current state — please comment on [issue #195](https://github.com/TabularisDB/tabularis/issues/195). The maintainer is a backend dev and explicitly does not want to keep iterating on instinct.

For frontend devs: once direction is decided, the migration is incremental and easy to split into smaller follow-up issues — primitive by primitive, page by page. Issues will be opened once the system is documented and there's something concrete to migrate against.
