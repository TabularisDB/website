---
category: 'Getting Started'
title: 'Installation'
order: 1.5
excerpt: 'Download and install Tabularis on macOS, Windows, or Linux.'
---

# Installation

Tabularis ships as a native desktop application built with Tauri. There are no servers, no sign-ups, and no internet connection required to run it.

## System Requirements

| Platform    | Minimum       | Notes                                       |
| :---------- | :------------ | :------------------------------------------ |
| **macOS**   | 10.15+        | Universal Binary (Intel + Apple Silicon)    |
| **Windows** | 10 / 11       | WebView2 required (pre-installed with Edge) |
| **Linux**   | Ubuntu 20.04+ | Requires `webkit2gtk-4.1` and `libsecret-1` |

## macOS

### Homebrew (recommended)

```bash
brew install --cask tabularis
```

[![Homebrew](https://img.shields.io/badge/Homebrew-Repository-orange?logo=homebrew)](https://github.com/debba/homebrew-tabularis)

### Direct download

Download the `.dmg` from [GitHub Releases](https://github.com/TabularisDB/tabularis/releases), open it, drag **tabularis** to your Applications folder, then launch it.

As of **v0.13.1**, macOS builds are code-signed with a Developer ID certificate and notarized by Apple, so the `.dmg` opens with the normal "downloaded from the internet" confirmation — no "unidentified developer" warning and no manual workaround.

If you are running an **older, unsigned build** and macOS blocks it with a "cannot be opened" warning (Gatekeeper quarantine), run:

```bash
xattr -c /Applications/tabularis.app
```

> If you are **upgrading** and Tabularis was already in the Accessibility list in Privacy & Security, remove the old entry before granting access to the new version.

## Windows

Download `tabularis_x.x.x_x64-setup.exe` from [GitHub Releases](https://github.com/TabularisDB/tabularis/releases) and run it. Follow the on-screen instructions.

WebView2 is required — it ships pre-installed with Microsoft Edge and is present on all up-to-date Windows 10/11 machines.

## Linux

### System libraries

Before installing, make sure the required system libraries are present.

#### Debian / Ubuntu

```bash
sudo apt install libwebkit2gtk-4.1-dev libsecret-1-dev
```

#### Arch Linux

```bash
sudo pacman -S webkit2gtk libsecret
```

#### Fedora

```bash
sudo dnf install webkit2gtk4.1-devel libsecret-devel
```

### Snap (recommended for Ubuntu / Debian)

```bash
sudo snap install tabularis
```

[![Snap Store](https://img.shields.io/badge/snap-tabularis-blue?logo=snapcraft)](https://snapcraft.io/tabularis)

### Flatpak

```bash
flatpak remote-add --if-not-exists flatpark https://dl.flatpark.org/flatpark.flatpakrepo
flatpak install flatpark dev.tabularis.Tabularis
```

[![flatpak (Flatpark)](https://img.shields.io/badge/flatpak-tabularis-4A90D9?logo=flatpak&logoColor=white)](https://flatpark.org/apps/dev.tabularis.Tabularis/)

### AppImage

Download the `.AppImage` from [GitHub Releases](https://github.com/TabularisDB/tabularis/releases), make it executable and run it:

```bash
chmod +x tabularis_*.AppImage
./tabularis_*.AppImage
```

### .deb (Debian / Ubuntu)

```bash
sudo dpkg -i tabularis_*.deb
```

### .rpm (Fedora / RHEL)

```bash
sudo rpm -i tabularis_*.rpm
```

### Arch Linux (AUR)

```bash
yay -S tabularis-bin
```

[![AUR](https://img.shields.io/badge/AUR-tabularis--bin-1793D1?logo=archlinux&logoColor=white)](https://aur.archlinux.org/packages/tabularis-bin)

## Updates

Tabularis checks for new releases against the GitHub Releases API on startup (if `autoCheckUpdatesOnStartup` is enabled, which is the default). When an update is available, a notification appears in the UI with the option to download and install it automatically.

To disable update checks, set `checkForUpdates: false` in your `config.json`. See [Configuration](/wiki/configuration) for the full reference.

## Build from source

**Requirements:**

- **Rust** (edition 2021 — install via [rustup](https://rustup.rs))
- **Node.js** (LTS recommended) with `npm`
- **Tauri CLI v2** (installed automatically as a local dev dependency)

### 1. Clone the repository

```bash
git clone https://github.com/TabularisDB/tabularis.git
cd tabularis
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Run it

For a development build with hot-reload:

```bash
npm run tauri dev
```

To produce a release binary:

```bash
npm run tauri build
```

The compiled binary and installer packages are written to `src-tauri/target/release/bundle/`.
