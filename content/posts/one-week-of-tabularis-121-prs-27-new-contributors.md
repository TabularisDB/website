---
title: "The Week Tabularis Stopped Being a Side Project: 121 PRs, 27 New Contributors"
date: "2026-10-16T14:30:00"
tags: ["community", "open-source", "milestone", "contributors"]
excerpt: "From October 7 to 13, the week of the community giveaway, the Tabularis community opened 121 pull requests, merged 90, welcomed 27 first-time contributors and shipped two releases. This is the story of the busiest week in the project's history, told one day at a time."
og:
  title: "One wild week of Tabularis:"
  accent: "121 PRs. 27 new contributors."
  claim: "90 merged pull requests, two releases, +87 stars and +32 forks in seven days."
---

# The Week Tabularis Stopped Being a Side Project: 121 PRs, 27 New Contributors

When the [community giveaway](/contribute/leaderboard) closed on Tuesday, October 13, I sat down to write a short "thanks, everyone" post. Then I pulled the numbers for its seven days, October 7 to 13, and I had to read them twice.

> **121 pull requests opened. 90 merged. 27 people sending their very first PR. Two stable releases. Seven days.**

Tabularis started as a side project: a desktop database client I wanted for myself. That week it felt like something else entirely. So instead of a list of metrics, let me tell you how the week actually went, one day at a time.

## Wednesday: a normal day

October 7 looked like any other Wednesday. **Seven pull requests** opened, six merged. The repo got 486 page views, about what you'd expect. At 16:00 the [community giveaway](/contribute/leaderboard) opened: for the next six days, every pull request and issue across the Tabularis projects would count towards the leaderboard.

Nothing about it hinted at what was coming.

## Thursday: v0.27.0 ships, and the doors open

On October 8 we shipped **[v0.27.0](/blog/v0270-cell-value-filter-stable-columns-tsql-batches)**. A release usually brings a wave of bug reports. This one brought a wave of **pull requests**: **20 opened in a single day**, almost three times Wednesday's count.

It was also the day with the most new forks of the week. People weren't just downloading the release. They were cloning it, opening it in their editor and sending code back.

![Pull requests opened and merged per day in the Tabularis repository, October 7 to 13, 2026. Opened: 7, 20, 18, 18, 18, 14, 23. Merged: 6, 9, 17, 10, 18, 23, 7.](/img/posts/tabularis-week-prs-per-day.svg)

And here's the thing about that chart: the blue bars never dropped back down. Thursday wasn't a spike. It was the new normal: **18, 18, 18, 14, 26** PRs a day for the rest of the week.

## Friday: everyone came to look

On October 9 the GitHub repository got **1,035 page views**, more than double Wednesday's. Reviews tried to keep pace: **17 PRs merged**, almost matching the 18 new ones that arrived the same day.

That's the moment I realised this wasn't going to be a "catch up on the backlog over the weekend" kind of week.

## Saturday: 4,866 clones

Then October 10 happened. The repo was cloned **4,866 times in one day**, more than the previous five days put together. Over the week that adds up to **10,644 git clones** and **4,812 page views**.

![Daily new stars, page views and git clones for the Tabularis repository, October 7 to 13, 2026. Stars: 8, 6, 8, 23, 23, 10, 8. Views October 7 to 12: 486, 525, 1035, 969, 563, 719. Clones October 7 to 12: 337, 1319, 1262, 4866, 1196, 898.](/img/posts/tabularis-week-repo-activity.svg)

## The weekend nobody took off

You'd expect a weekend to be quiet. It wasn't.

On **Saturday and Sunday the repo gained 46 stars**, 23 each day, more than half the week's total of **+87**. Contributors didn't take the weekend off either: **36 PRs opened** across the two days, and **18 merged on Sunday** alone.

Then Monday did the catching up: **23 PRs merged on October 12**, the biggest merge day of the week.

Most of those people were brand new.

## 27 people opened their first PR. Read that again.

This is the number I'm proudest of. Of the **34 people** who opened a pull request that week, **27 had never contributed to Tabularis before**.

That's not a rounding error. That's a community showing up.

A huge welcome to
**1-DARK, Asymtode712, CreedTech, Detoy, Furox-Art, KonstantinPythonLab, M4Y4NK-V3RM4, Rahul-pamula, SahinurDEV, SatvikMishra08, TonyWu2333, Totopo27, Xnadir, anshdadhich, batool-fariha, cestercian, davidMendezG, harshbhx, jay23606, njtherealss, notlakshitha, princecherry9905, qwist1233-cpu, stroexd, timerloggedout-spec, tosinxt** and **vivekyarra**. You made that week. 🙌

A few of them didn't just show up, they moved in. **tosinxt** got **21 PRs merged** in their very first week. **Detoy** landed **13**, **vivekyarra 11**. Absolute machines.

## The promise behind it: no PR left waiting

A flood of contributions only stays fun if the contributions actually land. Nobody sends a second PR after their first one sat untouched for a month. So all through the giveaway, the rule was simple: **if you open a PR, you get an answer fast.**

Here's how that went:

![Time from open to merge for the 90 pull requests merged October 7 to 13, 2026: under 1 hour 7, 1 to 6 hours 9, 6 to 12 hours 22, 12 to 24 hours 27, 1 to 3 days 20, over 3 days 5.](/img/posts/tabularis-week-time-to-merge.svg)

- **Median time to merge: 15.3 hours.**
- **65 of the 90 merged PRs (72%) landed within 24 hours.**
- Only **5** took more than three days.

Open a PR in the morning, see it in `main` by the next day. That's the bar, and we're keeping it.

What got merged? **50 fixes, 26 features** and 14 PRs of tests, docs, CI and chores. Stability and new toys, side by side. In total, **141 commits** and **+34,828 lines** landed on `main`.

## Tuesday: v0.28.0, and still going

Which brings us to Tuesday, October 13, the giveaway's last day. **[v0.28.0](/blog/v0280-structured-filters-auto-refresh-read-only-mcp)** shipped, the second stable release in five days, packed with work from this same wave of contributors:

- 🔒 **MCP read-only mode enforced by the database itself**, after two security reports
- 🎛️ **Structured filters** with AND/OR, text-friendly operators and a distinct-value picker
- 🔄 **Auto-refresh** table data on an interval
- 🔗 **Import JDBC URLs** for PostgreSQL and MySQL, with credentials and SSL modes filled in
- 🧠 **Autocomplete** that understands CTE and derived-table columns
- ⌨️ **Reopen closed tabs** (Ctrl/Cmd+Shift+T) and most-recently-used tab switching
- 🖼️ **Image preview on hover** in the data grid
- 🔔 **Notifications** when a long-running query finishes in the background

And the release didn't slow anyone down: **26 new PRs** opened that day, the highest count of the week.

None of these builds existed before October 7. As of today, October 16, they've been downloaded about **5,100 times**: **2,475** for v0.27.0, **2,256** for v0.28.0 and **360** for the six nightlies, counting installers and update bundles.

![Downloads of builds published October 7 to 13, 2026: v0.27.0 3,124, v0.28.0 778, six nightly builds about 515. By operating system: macOS 51%, Windows 27%, Linux 22%.](/img/posts/tabularis-week-downloads.svg)

**macOS** took 53% of them, **Windows** 27%, **Linux** 20%. Apple Silicon alone accounts for 2,212. 🍎

## Meanwhile, in the plugin world

While the app repo was busy, the [plugins](/plugins) had their own week:

- **10 plugin releases** across PostgreSQL, DuckDB, ClickHouse, CSV, DynamoDB and Ayu, downloaded **1,022 times** so far
- The PostgreSQL plugin reached **1.0.0-rc.8**, with 728 downloads of the week's two release candidates
- **4 new themes** joined the registry: **Catppuccin**, **Tokyo Night**, **Ayu** and **Rosé Pine** 🎨
- A brand new **Trino plugin** repository appeared in the org on the last day 👀
- The plugin registry itself shipped **19 releases** in seven days

Count the whole TabularisDB organization (app, plugins, registry and website) and the week's total goes up to **195 PRs opened and 158 merged**.

## The whole week, on one card

| Metric | Oct 7 to 13 |
|---|---|
| 🔀 Pull requests opened | **121** |
| ✅ Pull requests merged | **90** |
| 🧑‍💻 PR authors | **34** |
| 🌱 First-time contributors | **27** |
| 📦 Commits landed on `main` | **141** |
| ➕ Lines added | **+34,828** |
| ⭐ New GitHub stars | **+87** |
| 🍴 New forks | **+32** |
| 🚢 Stable releases | **2** (v0.27.0 and v0.28.0) |
| ⬇️ Downloads of the week's builds (as of Oct 16) | **~5,100** |

## Next week's story starts with you

The week also brought **83 new issues**, **37 of them labelled `good first issue`**, and 31 of those are already closed. The next wave of first-time contributors still has **12 good first issues** waiting, and more get labelled every week. 27 people walked through that door during the giveaway. Maybe you're next.

- 🧩 Grab a [good first issue](https://github.com/TabularisDB/tabularis/issues?q=is%3Aissue+is%3Aopen+label%3A%22good+first+issue%22)
- 🔌 Build a [plugin](/plugins) for your favourite database
- 💬 Come hang out on [Discord](https://discord.com/invite/K2hmhfHRSt)
- ⬇️ Or simply [download Tabularis](/download) and tell us what's missing

To the 34 people who opened a PR during the giveaway, the 27 who did it for the first time, and everyone who starred, forked, filed an issue or told a friend: **thank you**. I can't wait to see how next week's story goes. 💙

:::newsletter:::

:::star:::
