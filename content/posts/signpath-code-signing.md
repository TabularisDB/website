---
title: "Tabularis Joins the SignPath.io Open Source Program"
date: "2026-07-10T09:00:00"
tags: ["community", "sponsors", "partnership", "open-source", "windows"]
excerpt: "Tabularis has been accepted into the SignPath.io open source program: a free code signing certificate from the SignPath Foundation for our Windows releases. Over the next few weeks we'll wire signing into the release pipeline — and then the days of telling users to click 'More info → Run anyway' are over."
og:
  template: "screenshot-split"
  title: "Tabularis joins the"
  accent: "SignPath.io open source program."
  claim: "Tabularis joined the SignPath.io open source program — free code signing from the SignPath Foundation. Next up: wiring it into the release pipeline, so Windows builds ship signed instead of triggering SmartScreen."
  image: "/img/posts/signpath-og-shot.png"
  frameless: true
---

# Tabularis Joins the SignPath.io Open Source Program

<p style="text-align:center;margin:1.5rem 0 2rem;"><img class="no-lightbox borderless" src="/img/posts/signpath-partnership.svg" alt="Tabularis has joined the SignPath.io open source program" style="width:100%;max-width:800px;height:auto;display:block;margin:0 auto;" /></p>

If you've ever installed Tabularis on Windows, you've probably met the blue screen. Not *that* blue screen — the other one. "Windows protected your PC." The one where a perfectly ordinary open-source database client gets treated like something you downloaded from a forum signature in 2009, and the install instructions have to include the phrase *click "More info", then "Run anyway"*.

That screen exists because unsigned binaries are, from Windows' point of view, anonymous. And it goes away with a code signing certificate — which, for years, has been the single most disproportionate expense an open-source desktop project can face. Hundreds of dollars a year, identity validation paperwork, and increasingly a hardware token requirement, all to prove that a project whose entire source code is public is not hiding anything.

So here's the news: **Tabularis has been accepted into the [SignPath.io](https://signpath.io) open source program.** The [SignPath Foundation](https://signpath.org) provides free code signing certificates to qualifying open-source projects — and over the next few weeks, we'll be working on integrating SignPath into our release pipeline so that Windows builds ship signed.

## What SignPath actually does (and why it's clever)

The obvious version of this program would be "here's a certificate file, good luck." SignPath's version is better, and it's worth explaining why.

The private key never touches our machines. It lives on SignPath's Hardware Security Modules, and signing happens as a step in the release pipeline: CI builds the artifacts from the public repository, SignPath verifies that the binary being signed actually came from that repository, and only then applies the signature. The certificate doesn't just say "someone signed this" — it says *this exact binary was built from that exact public source tree, and the SignPath Foundation vouches for the link*.

For users, that's a stronger promise than most commercial software makes. You can read the code, and you can verify the thing you downloaded is that code. No trust-us step in the middle.

For us, it means no key material sitting on a build machine waiting to be leaked, no USB token taped inside someone's desk drawer, and no yearly renewal invoice for a nights-and-weekends project.

:::newsletter:::

## The honest part: it's not wired up yet

Being accepted is the milestone; the engineering starts now. That provenance guarantee — *this binary came from that repository* — is exactly what makes the integration non-trivial. SignPath doesn't sign whatever you upload; it signs what your pipeline provably built. Which means the work ahead of us looks like this:

- **Restructuring the release workflow** so the Windows artifacts flow from CI through SignPath and back before they're published — signing becomes a pipeline stage, not an afterthought.
- **Getting the build to verify cleanly.** The link between the public repo and the submitted binary has to hold up to SignPath's checks, and desktop app builds have a way of accumulating steps that make provenance harder to trace than it should be.
- **Not breaking releases while we do it.** Tabularis ships roughly every two weeks, and that cadence doesn't pause for plumbing work.

We'd rather tell you this now and write the "it's live" post when it's actually live, than quietly flip a switch and hope nobody checks the dates. If you're curious how it goes, the work will happen in the open like everything else — watch the [repo](https://github.com/TabularisDB/tabularis).

## What will change for you

Once the integration lands, if you're on Windows:

- **SmartScreen stops interrogating you.** The installer will carry a valid signature, so new releases install like any other signed software — no "unknown publisher", no "Run anyway".
- **The publisher name means something.** The signature identifies the build as coming from the Tabularis open-source repository, certified by the SignPath Foundation.
- **Tampering is detectable.** If a downloaded installer has been modified anywhere between our CI and your disk, the signature breaks and Windows tells you.

If you're on macOS or Linux, nothing changes today — but fewer scary dialogs on any platform makes the whole project easier to recommend, and that helps everyone.

In line with the program's terms, we'll be adding the credit to our README: free code signing provided by [SignPath.io](https://signpath.io), with a certificate from the [SignPath Foundation](https://signpath.org). It's the easiest attribution requirement we've ever agreed to, given that the alternative was a recurring bill.

:::star:::

## The usual thank-you, because it keeps being deserved

To the SignPath team: thank you for running a program that fixes a genuinely broken part of open-source distribution, and for an acceptance process that was thorough about the right things — code provenance and project health — rather than paperwork.

And to everyone who's starred the repo, filed a bug, built a plugin, or translated a string: programs like this accept projects that look alive, and Tabularis looks alive because of you. One "Run anyway" at a time, we're becoming real software.

---

_The Tabularis Team_
