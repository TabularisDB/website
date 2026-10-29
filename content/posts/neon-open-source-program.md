---
title: "Tabularis Joins the Neon Open Source Program"
date: "2026-10-29T07:15:00+01:00"
tags: ["community", "sponsors", "partnership", "open-source", "postgresql"]
excerpt: "Neon is supporting Tabularis through its Open Source Program with Postgres and AI Gateway credits. Here is what that means for the project, and how to connect your Neon database to Tabularis."
og:
  cover: "/img/posts/neon-open-source-program.png"
---

# Tabularis Joins the Neon Open Source Program

<p style="text-align:center;margin:1.5rem 0 2rem;"><img class="no-lightbox" src="/img/posts/neon-open-source-program.png" alt="Tabularis joins the Neon Open Source Program" style="width:100%;max-width:1000px;height:auto;display:block;margin:0 auto;" /></p>

**[Neon](https://neon.com) has welcomed Tabularis into its Open Source Program**, offering Postgres and AI Gateway credits to support the project.

For an open-source database client, this is a natural partnership. Neon provides managed Postgres; Tabularis gives you a desktop workspace to explore it, write SQL, inspect relationships, and edit data. They meet at the standard PostgreSQL connection, so getting started does not require a separate Neon integration.

## Support for the work behind the client

Maintaining a database client means working with the databases people use, across different schemas, connection settings, and environments. Access to managed Postgres gives us another place to develop and exercise those workflows. Neon's [database branches](https://neon.com/docs/introduction/branching) also offer a way to work on a separate copy of a database without experimenting on the original branch.

The program's Postgres and AI Gateway credits give the project more room for that development and experimentation.

Tabularis remains free and open source. If you want to see what we are building, report a problem, or contribute a fix, the [repository is open](https://github.com/TabularisDB/tabularis).

## Connect Neon to Tabularis

If you want to try Tabularis with a hosted Postgres database, Neon is an option you can use without running PostgreSQL on your own machine.

1. Open your project in the [Neon Console](https://console.neon.tech) and click **Connect**. Choose the branch, database, and role you want to use.
2. Turn **Connection pooling** off and copy the direct connection string, keeping its TLS settings (`sslmode=require`). A direct connection is a useful default for desktop administration and operations that depend on session settings.
3. Create a connection in Tabularis, select PostgreSQL ([install the PostgreSQL plugin](/wiki/installing-plugins) if needed), and paste the URL into **Connection String**.
4. Give it a name, click **Test Connection**, and save. You can then browse schemas, open tables in the grid, and run queries in the SQL editor.

For manual connection fields, using a pooled endpoint, or connecting to another branch, see our [Neon connection guide](/wiki/connections#managed-postgresql-with-neon). If this is your first time using Tabularis, the [getting-started guide](/wiki/get-started#use-a-managed-postgres-database-with-neon) takes you from that connection to your first query. Neon's [connection documentation](https://neon.com/docs/connect/connect-from-any-app) covers the details on their side.

## Thank you, Neon

Thank you to the Neon team for supporting Tabularis and for including a SQL client in the program. Support like this helps us keep working on a tool that anyone can use, inspect, and improve.

And thank you to everyone contributing code, plugins, translations, bug reports, and feedback. That work is what makes Tabularis useful, and what gives programs like this a project to support.

You can find Neon alongside the other organizations helping the project on our [sponsors page](/sponsors). If you use Neon with Tabularis, we would love to hear how it goes.

:::star:::

---

_The Tabularis Team_
