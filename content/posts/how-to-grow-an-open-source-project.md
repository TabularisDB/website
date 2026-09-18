---
title: "How to Grow an Open-Source Project: Lessons on the Road to 5,000 Stars"
date: "2026-09-18T12:00:00"
authors: ["debba"]
tags: ["community", "milestone", "open-source", "engineering"]
excerpt: "Lessons from growing Tabularis toward 5,000 GitHub stars: make room for contributors, protect everyday workflows, and plan for the maintenance that comes with new features."
og:
  title: "Grow an open-source project."
  accent: "On the road to 5,000 stars."
  claim: "Practical lessons from Tabularis: contributors, reliability, and building something people can keep using."
  image: "/img/tabularis-sql-editor-data-grid.png"
---

# How to Grow an Open-Source Project: Lessons on the Road to 5,000 Stars

As I write this, Tabularis is about twenty GitHub stars away from 5,000. We might get there in a day or two, perhaps sooner. By the time you read this, the counter may already have moved past it.

It feels like a good moment to stop and look at what has happened since January.

When I wrote about [the first 1,000 stars](/blog/from-zero-to-1000-github-stars), the story was still mostly about getting started: shipping the first versions, meeting the first contributors, discovering that other people wanted this thing too. Five months later, there is much more to maintain, more to learn, and a growing number of people helping decide what Tabularis becomes.

Here are the lessons I would take into another open-source project: start with a problem you understand, give contributors room to work, and make each expansion something you can maintain.

![Cumulative star dates of 4,982 current Tabularis stargazers, from January 26 to September 18, 2026.](/img/posts/tabularis-5k-stars-growth.svg)

The curve includes quiet stretches and sudden jumps. It records interest in the project; understanding what people actually need still happens through conversations, reports and contributions.

## Start with a problem you can test yourself

Tabularis began as a database client I wanted to use myself. Its first name was `debba.sql`. There was a SQL editor, a Tauri application around it, and plenty of rough edges.

The early pace was intense. The first week produced fifteen releases. Some fixed things the previous release had broken. Getting the application into people's hands brought feedback I could never have produced on my own machine: different Linux environments, unfamiliar database configurations, and expectations I had not considered.

In the 1,000-star post, I called that phase “Ship Fast, Ship Broken, Ship Anyway.” Reading it again now, I can see how much of that advice belonged to that particular moment.

Fast feedback still matters. So does being able to ship a fix quickly. But every new workflow someone builds around Tabularis adds something worth preserving. A query editor can become part of a working day. A connection configuration can represent hours of setup. An export can be the file someone else is waiting for.

Start with a workflow you can test yourself, then let real users challenge your assumptions. As they build routines around the application, include those existing workflows in your release checks.

## Give contributors a piece they can own

Choosing [Tauri](/blog/why-tabularis-runs-on-tauri) gave the project a Rust backend for database connections, tunnels, credentials and exports, with React for the interface. It also brought the ongoing work of supporting different system webviews and packaging environments. Those tradeoffs are still visible in today's bug reports.

The plugin system changed who could extend the application.

An [external driver speaking JSON-RPC](/blog/database-drivers-as-external-processes) gave contributors a manageable boundary. Someone could bring knowledge of a database and work on its driver without taking ownership of the entire desktop application. It opened a path for integrations I would never have had time to build alone.

That path has continued to grow. Dominik Spitzli, [@NewtTheWolf](https://github.com/NewtTheWolf), built Tabularium, the plugin registry that lets authors publish through their own repositories. SQL Server now has its own driver plugin. PostgreSQL has also moved into a plugin, putting an important part of the original application through the same extension model.

These changes carry maintenance costs: protocol compatibility, installation, updates, and clear expectations about what a driver supports. They also let more work happen independently.

Notebooks and Visual EXPLAIN expanded the application in another direction. A query can sit beside an explanation, a chart, and the steps that led to it. Looking at how the database executes that query becomes part of the same investigation.

Give a contributor a clear boundary, a working example and a way to test their change. In Tabularis, a driver provides that starting point. Other projects might offer an integration, a theme or a small, independently testable module.

![Monthly merged pull requests in the main Tabularis repository, split between debba and other contributors. September is a partial month; bot accounts are excluded.](/img/posts/tabularis-5k-community-prs.svg)

As of September 18, the main repository has merged **257 pull requests from 80 authors other than me**, excluding bot accounts. That is one visible part of the collaboration. Work in driver repositories, translations, testing and support adds much more than this chart can show.

## Turn bug reports into lasting checks

The latest release, [v0.24.0](/blog/v0240-notebook-query-plans-proxy-settings-result-fonts), is a useful snapshot of the challenges now.

“Follow the system theme” sounds like a small setting. On Linux, the desktop preference, toolkit and webview can disagree. Getting it right required following native appearance signals and making sure the theme chosen by the application did not feed back into its own system-theme detection.

Proxy support sounds like one connection setting. In practice, the application makes update requests, downloads plugins, talks to AI providers, opens database connections and connects to SSH bastions. Those requests may need different routes. Existing tunnels also need a defined lifecycle when the configuration changes.

Putting query plans inside notebooks introduces another set of decisions. EXPLAIN ANALYZE actually executes the statement. The interface needs to make that choice explicit, recognise when the query has changed, and avoid running another database request just because someone opens a larger view of a plan.

This is the kind of work a changelog compresses into a few lines. It means reproducing a report, understanding the environment, reviewing a contribution, and checking the surrounding behavior.

Ask for the environment and the smallest reproduction, then preserve what the report teaches you in a regression test or a documented manual check. People bring operating systems, database types and network setups I cannot cover alone; their reports should keep helping after the issue closes.

## Make expansion earn its maintenance cost

[Tabularis Web](https://github.com/TabularisDB/tabularis/pull/676) is one of the larger pieces of work currently underway. The pull request is still open as I write this.

The goal is to run the application through a browser while sharing its React interface and Rust application services with the desktop client. That requires finding all the places where the application assumes it owns a native window, a local file dialog, or access to the same machine as the user.

File transfers, authentication, query cancellation, credentials and plugin assets all need explicit behavior across that boundary. A browser disconnecting is another event the application must handle. The desktop version must continue to work while these assumptions are being separated.

I have already written about [the development process behind that work](/blog/code-generation-was-only-the-beginning-software-development-is-becoming-a-loop), including the use of AI coding tools. That experience reinforced how much depends on the plan, the checks and the review around the implementation. External review found security issues even after the planned tasks and their tests were complete.

Before adding another way to run your application, identify what it can share and what will need separate verification. Budget for both. Tabularis Web makes that question concrete for the next stage of this project.

## Plan for the work after the release

Reserve time for documentation, reviews and compatibility alongside feature work. For Tabularis, that leads to three priorities.

**Reliability across everyday workflows.** Query execution, editing, imports, exports and reconnection should behave predictably. This means continuing to investigate the awkward cases: session state, unusual data types, interrupted operations and platform-specific failures. It also means making the interface clearer. The [planned design system](/roadmap/ui-design-system) is an opportunity to give both users and contributors more consistent components and conventions.

**An ecosystem people can build on.** Plugin authors need useful documentation, stable contracts and a practical way to test compatibility. The connection-specific metadata introduced in v0.24.0 is one step: a generic plugin can describe the database behind each connection instead of forcing every connection into the same static capabilities. Work like this makes future integrations possible, while leaving their implementation in the hands of people who know those systems.

**A sustainable maintenance process.** Reviews, release verification, documentation and support all compete for time. Making those tasks easier to share matters as the project grows. Clear reproduction steps, contributor guides and well-scoped changes help the next person participate with less guesswork.

These are directions for the work ahead. Some have code under review; others need design, discussion and people willing to help. They will take more than another release cycle.

## Thank you for making it yours

The most encouraging part of this project has been seeing people decide it was worth improving.

Some have written drivers or added features. Others have translated the interface, worked through packaging problems, tested a fix, or explained exactly where a workflow fell apart. People have shared Tabularis with colleagues, written about it, and supported the infrastructure and tools that help keep development moving.

A star records interest. The conversations and contributions around the repository show much more of what that interest can become. I am grateful for both.

We are approaching 5,000 with an application that has grown substantially since January, and plenty of work still to do. Thank you to everyone who has helped bring it this far.

If you have used Tabularis, including if you tried it and went back to something else, I would like to hear this:

**What is the one thing Tabularis still needs before it can become your everyday database client?**

Tell us in [GitHub Discussions](https://github.com/TabularisDB/tabularis/discussions) or [Discord](https://discord.com/invite/K2hmhfHRSt). That feedback will help shape what comes next.


---

*About the charts: GitHub API snapshot taken on September 18, 2026. The star curve is reconstructed from the timestamps of current stargazers, so it excludes stars subsequently removed. Pull requests are grouped by merge month in UTC, with bot accounts excluded; September is incomplete. The PR chart covers the main repository only, excludes direct commits, and does not measure the size or effort of contributions.*
