---
title: "Our Windows Installer No Longer Looks Suspicious"
date: "2026-07-10T09:00:00"
tags: ["community", "sponsors", "partnership", "open-source", "windows"]
excerpt: "Tabularis has been accepted into the SignPath.io open source program. Every Windows release now ships with a real code signing certificate from the SignPath Foundation — which means the days of telling users to click 'More info → Run anyway' are over."
og:
  title: "Our Windows installer"
  accent: "no longer looks suspicious."
  claim: "Tabularis joined the SignPath.io open source program — free code signing from the SignPath Foundation, so Windows releases ship signed instead of triggering SmartScreen warnings."
  image: "/img/overview.png"
---

# Our Windows Installer No Longer Looks Suspicious

<p style="text-align:center;margin:1.5rem 0 2rem;"><img class="no-lightbox" src="/img/posts/signpath-partnership.svg" alt="Tabularis has joined the SignPath.io open source program" style="width:100%;max-width:800px;height:auto;display:block;margin:0 auto;" /></p>

If you've ever installed Tabularis on Windows, you've probably met the blue screen. Not *that* blue screen — the other one. "Windows protected your PC." The one where a perfectly ordinary open-source database client gets treated like something you downloaded from a forum signature in 2009, and the install instructions have to include the phrase *click "More info", then "Run anyway"*.

That screen exists because unsigned binaries are, from Windows' point of view, anonymous. And it goes away with a code signing certificate — which, for years, has been the single most disproportionate expense an open-source desktop project can face. Hundreds of dollars a year, identity validation paperwork, and increasingly a hardware token requirement, all to prove that a project whose entire source code is public is not hiding anything.

So here's the news: **Tabularis has been accepted into the [SignPath.io](https://signpath.io) open source program.** The [SignPath Foundation](https://signpath.org) provides free code signing certificates to qualifying open-source projects, and starting with our upcoming releases, the Windows builds ship signed.

## What SignPath actually does (and why it's clever)

The obvious version of this program would be "here's a certificate file, good luck." SignPath's version is better, and it's worth explaining why.

The private key never touches our machines. It lives on SignPath's Hardware Security Modules, and signing happens as a step in the release pipeline: CI builds the artifacts from the public repository, SignPath verifies that the binary being signed actually came from that repository, and only then applies the signature. The certificate doesn't just say "someone signed this" — it says *this exact binary was built from that exact public source tree, and the SignPath Foundation vouches for the link*.

For users, that's a stronger promise than most commercial software makes. You can read the code, and you can verify the thing you downloaded is that code. No trust-us step in the middle.

For us, it means no key material sitting on a build machine waiting to be leaked, no USB token taped inside someone's desk drawer, and no yearly renewal invoice for a nights-and-weekends project.

:::newsletter:::

## What changes for you

If you're on Windows, the practical changes are simple:

- **SmartScreen stops interrogating you.** The installer carries a valid signature, so new releases install like any other signed software — no "unknown publisher", no "Run anyway".
- **The publisher name means something.** The signature identifies the build as coming from the Tabularis open-source repository, certified by the SignPath Foundation.
- **Tampering is detectable.** If a downloaded installer has been modified anywhere between our CI and your disk, the signature breaks and Windows tells you.

If you're on macOS or Linux, nothing changes today — but fewer scary dialogs on any platform makes the whole project easier to recommend, and that helps everyone.

In line with the program's terms, you'll find the credit in our README: free code signing is provided by [SignPath.io](https://signpath.io), with a certificate from the [SignPath Foundation](https://signpath.org). It's the easiest attribution requirement we've ever agreed to, given that the alternative was a recurring bill.

:::star:::

## The usual thank-you, because it keeps being deserved

To the SignPath team: thank you for running a program that fixes a genuinely broken part of open-source distribution, and for an acceptance process that was thorough about the right things — code provenance and project health — rather than paperwork.

And to everyone who's starred the repo, filed a bug, built a plugin, or translated a string: programs like this accept projects that look alive, and Tabularis looks alive because of you. One "Run anyway" at a time, we're becoming real software.

---

_The Tabularis Team_
