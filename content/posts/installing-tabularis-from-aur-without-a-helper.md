---
title: "Installing Tabularis from the AUR, the Careful Way"
date: "2026-08-03T19:00:00"
tags: ["security", "linux", "arch", "aur", "open-source", "community"]
excerpt: "After the malware wave that hit 200+ AUR packages, the Arch team temporarily disabled package adoption. Our tabularis-bin package is unaffected and still on the AUR, but a few of you asked how to install without going through an AUR helper. Here's how to build straight from our GitHub repo — and what to check in any PKGBUILD before you run it."
og:
  template: "screenshot-split"
  title: "Installing from the AUR,"
  accent: "the Careful Way"
  claim: "After the malware wave that hit 200+ AUR packages, here's how to install Tabularis without an AUR helper — build straight from our repo, check the sources, and read the PKGBUILD before it runs anything."
  image: "/img/arch-linux-aur.png"
  frameless: true
---

# Installing Tabularis from the AUR, the Careful Way

Heads up for Arch users: after the malware wave that hit 200+ AUR packages, the Arch team temporarily disabled package adoption. Our `tabularis-bin` package is unaffected and still on the [AUR](https://aur.archlinux.org/packages/tabularis-bin), but a few of you asked how to install without going through an AUR helper. Fair enough, and honestly it's the safer habit anyway since you get to read the PKGBUILD before it builds anything.

## Building straight from our repo

You can build straight from our GitHub repo, the PKGBUILD lives in the `aur/` folder:

```bash
curl -O https://raw.githubusercontent.com/TabularisDB/tabularis/main/aur/PKGBUILD
sed -i 's/^pkgver=.*/pkgver={{APP_VERSION}}/' PKGBUILD
updpkgsums          # fills in the real sha256, needs pacman-contrib
less PKGBUILD       # read it, that's the whole point
makepkg -si
```

The version in the repo is a placeholder (`x.y.z`) because our release workflow substitutes it, so set it to whatever the current release is (`{{APP_VERSION}}` at the time you're reading this). All it does is pull our official `.deb` from the GitHub release and unpack it, nothing exotic.

If you'd rather skip `makepkg` entirely, the `.deb` and the AppImage are right there on the [releases page](https://github.com/TabularisDB/tabularis/releases), both signed.

## Read the PKGBUILD — every time

Whatever you install from the AUR these days, take thirty seconds to read the PKGBUILD:

- check that `source=` points at the real upstream,
- be suspicious of any `curl` or `wget` inside `prepare()`/`build()`,
- and of `post_install` hooks.

If you did install one of the compromised packages, assume the box is dirty and rotate your SSH keys and API tokens.

Article with the details: [Arch Linux disables AUR package adoption to stop malware flood](https://www.bleepingcomputer.com/news/security/arch-linux-disables-aur-package-adoption-to-stop-malware-flood/) (BleepingComputer).

:::star:::
