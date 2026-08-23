---
title: "Code generation was only the beginning. Software development is becoming a loop"
date: "2026-08-23T13:32:00"
authors: ["debba"]
tags: ["ai", "engineering", "open-source", "ralph-loop", "deep-dive"]
excerpt: "Tabularis Web touched 1,040 files and moved a desktop database client behind a second transport. This is how I managed it as 48 verified tasks, and why AI development is moving from prompts toward loops."
og:
  template: "code-terminal"
  title: "Code generation was only the beginning"
  accent: "Development is becoming a loop."
  claim: "The model wrote the code. Plans, fresh contexts, tests, Git and CI are what made 48 tasks converge into one feature."
  image: "/img/tabularis-sql-editor-data-grid.png"
  codeTitle: "pi · web-ui task runner"
  codeLines:
    - '$ PI_WEB_UI_MODEL=openai/gpt-5.6-sol pnpm web:tasks'
    - 'WEB-000  COMPLETED    2.1% (1/48)'
    - 'WEB-053  COMPLETED   50.0% (24/48)'
    - 'WEB-103  COMPLETED  100.0% (48/48)'
    - '$ git diff --shortstat main...feat/web-ui'
    - '1040 files changed, 50159 insertions(+), 8351 deletions(-)'
---

# Code generation was only the beginning. Software development is becoming a loop

Yesterday I opened <a href="https://github.com/TabularisDB/tabularis/pull/676" target="_blank" rel="noopener noreferrer">a pull request</a> to add a browser-hosted mode to Tabularis. The idea was to reuse the React UI and the Rust application services of the desktop client, but without starting a Tauri window. You run `tabularis web`, a local server starts, and you use the application from a browser.

The PR opened with 49 commits and a diff of 1,040 files, 50,159 additions and 8,351 deletions. A good part of the file count comes from moving the frontend into a workspace package, so the numbers look a bit more dramatic than the actual change, but it was still a very large migration. There were 227 frontend command names across 366 call sites, and more than one hundred files imported Tauri APIs. Connections, tunnels, plugins, credentials, queries, events, file dialogs and secondary windows all assumed that the UI was running inside the desktop application.

The first commit was made at 16:35 on August 21. The last commit of the planned work was made at 17:15 the next day. I used GPT-5.6-sol to do most of this work, but I did not give it a single prompt asking it to build the web version. I used a Ralph loop.

The name comes from the Ralph Wiggum technique popularized by <a href="https://ghuntley.com/loop/" target="_blank" rel="noopener noreferrer">Geoffrey Huntley</a>. The basic idea is almost disappointingly simple. You prepare a plan and a list of small tasks, start a coding agent with a fresh context, ask it to complete one task, make it record what happened, and start again. It is mostly a shell loop around an agent.

I think this simple pattern is important because it continues a clear progression. Autocomplete suggested the next few lines and the programmer accepted or rejected them. Chat let us paste code into a conversation and discuss a bug. Coding agents added tools, and suddenly the model could inspect the repository, edit files, run the compiler and look at the test output on its own. Each step handed the model a bigger piece of the feedback loop a programmer works inside, and the outer loop is the next step in the same direction. I will come back to this progression at the end of the post; first, how the loop actually ran.

An agent is already a loop internally. The model asks to read a file, receives the file, asks to change it, runs a test, sees the failure and tries something else. OpenAI has a good technical explanation of this in its article about <a href="https://openai.com/index/unrolling-the-codex-agent-loop/" target="_blank" rel="noopener noreferrer">the Codex agent loop</a>. However, this inner loop still lives inside one task and one context window. Ralph adds another loop around complete sessions.

In my case the outer loop was more or less this:

```text
plan -> fresh agent -> change -> local tests -> commit -> CI
          ^                                      |
          |--------------- repair ---------------|
```

The two loops answer different questions. The agent decides what to do next while working on a task. The runner decides if the task is actually complete and whether the next one is allowed to start. I don't want the model itself to be the only authority on both questions, since models are quite capable of saying that everything is done when the interesting broken part is just outside what they tested.

Longer context windows help, but I don't think they remove this need. A long session accumulates useful information together with old test output, failed approaches, changed assumptions and a lot of tool calls that no longer matter. Compaction makes the conversation smaller by summarizing it, but the summary is still an interpretation. After enough hours, it can become hard to know if the model is reasoning from the current repository or from the story it has built about the repository.

Starting again with a clean context has the opposite problem: the new agent knows nothing. So the important information has to live elsewhere. Anthropic described a very similar approach in its work on <a href="https://www.anthropic.com/engineering/effective-harnesses-for-long-running-agents" target="_blank" rel="noopener noreferrer">long-running agent harnesses</a>, where each new session reads a progress file and the Git history, implements one feature, tests it and leaves a clean handoff for the next session.

For this project the durable state was deliberately boring:

- one <a href="https://github.com/TabularisDB/tabularis/blob/64472f08534b73e5323d28ad921ff7f0b4473372/web-ui-project/docs/WEB_UI_PLAN.md" target="_blank" rel="noopener noreferrer">architecture document</a> describing goals, constraints and the target design;
- <a href="https://github.com/TabularisDB/tabularis/tree/64472f08534b73e5323d28ad921ff7f0b4473372/web-ui-project/tasks" target="_blank" rel="noopener noreferrer">48 task files</a> with narrow acceptance criteria;
- a tracked <a href="https://github.com/TabularisDB/tabularis/blob/64472f08534b73e5323d28ad921ff7f0b4473372/web-ui-project/tasks/PROGRESS.md" target="_blank" rel="noopener noreferrer">`PROGRESS.md`</a> with status and verification evidence;
- Git commits as checkpoints and rollback points.

All of it is committed in the PR under `web-ui-project/`, together with the runner itself, so you can read the actual artifacts instead of trusting my description of them.

The architecture document described the intended boundary: one shared React UI, a typed client, a Tauri transport for desktop, an HTTP and WebSocket transport for browsers, and shared Rust services below both. It also listed things that were not acceptable, such as duplicating business logic, sending credentials to the browser or accepting server file paths supplied by a remote client.

The task files were intentionally much smaller. Their IDs are grouped by area, which is why the numbering runs from `WEB-000` to `WEB-103` across only 48 files. One task created the command inventory. Another added the typed client. Another extracted the shared runtime. Later tasks handled query execution, notebooks, backups, plugins, AI, remote authentication, packaging and browser E2E. The query task did not need to solve the whole application. It needed to make queries behave the same through Tauri and HTTP, including cancellation and bounded results, then prove this with the relevant tests.

This is the part that required the most thought before starting. In wall-clock terms, preparing the architecture document and the task list took me around two to three hours, working through the decomposition in conversation with Claude Fable 5 before the loop ever ran. If the task decomposition is wrong, the loop just repeats the wrong abstraction very efficiently. A model can usually compensate for a task that is a little too big or a specification that is missing a detail, but it is much harder for it to notice that the entire sequence of tasks will produce two competing architectures thirty iterations later.

I ran the tasks with <a href="https://pi.dev/" target="_blank" rel="noopener noreferrer">Pi CLI</a>. I have been using Pi a lot lately and I like it because it is small, open source and easy to automate. It has a non-interactive mode, accepts files directly as context and does not impose much structure of its own. The relevant part of my runner looked like this (the <a href="https://github.com/TabularisDB/tabularis/blob/64472f08534b73e5323d28ad921ff7f0b4473372/web-ui-project/scripts/run-web-ui-tasks.sh" target="_blank" rel="noopener noreferrer">full script</a>, with all its checks and the exact prompts, is in the PR):

```bash
for task in "${TASKS[@]}"; do
  pi --print --approve \
    --name "web-ui-${task}" \
    --thinking high \
    --model openai/gpt-5.6-sol \
    @web-ui-project/docs/WEB_UI_PLAN.md \
    @"web-ui-project/tasks/${task}.md" \
    @web-ui-project/tasks/PROGRESS.md \
    "$TASK_PROMPT"

  validate_progress_entry "$task"
  watch_task_ci "$task"
done
```

There was more code around this, mostly checks. In particular, the runner required that:

- every task ran in a brand-new Pi session, with Pi's session environment variables explicitly unset, so no conversational state could leak from one task into the next;
- only one copy could modify the branch at a time;
- the task updated the ledger with a summary, evidence and a date;
- the ledger update was included in the task commit;
- local checks passed before pushing;
- CI was green before the next task started.

Every task was a conventional commit, so every new session inherited a branch that was supposed to be both understandable and recoverable.

Each session was told to work only on its assigned task, inspect the worktree first, preserve unrelated changes, run focused tests before editing, review the final diff and keep desktop compatibility. It was not allowed to start the next task or spawn more agents. In theory I could have run many tasks in parallel, but on one branch this would have made the process harder to inspect. Serial execution also created useful pressure: task 31 could assume that task 30 had already passed CI.

The progress file was not just a checklist. For every completed task it contained what changed and the exact commands used to verify it. This turned out to be more valuable than session summaries. A new agent could read the same state that I could read, and the runner could validate parts of it without trusting the prose returned by the model.

The other important part was testing. The branch started with 3,838 frontend tests and 1,157 Rust tests. It ended with 4,023 frontend tests across 270 files and 1,292 passing Rust tests, plus contract tests, resilience checks, packaging checks and E2E tests against real databases in Chromium, Firefox and WebKit.

For the transport work, the same contract was executed against a Tauri mock and a real authenticated HTTP server. This caught a class of bugs that normal unit tests would probably miss, especially differences in serialization and errors. The packaging tests unpacked the artifacts to check that the web assets were really there. There was also a manual parity document with 29 rows, because not everything involving dialogs, windows and browser permissions can be reduced to a unit test in a useful way.

After each push the runner waited for GitHub Actions. If CI failed, it started a new repair session for that same task, with the failed logs included in the work. The repair had to amend the existing commit and watch CI again. There was a limit of three attempts, after which the whole loop stopped.

It also stopped during the real run. `WEB-091`, the task adapting plugin install links for the browser, failed on its first attempt. The next task did not start and the ledger remained unchanged. I fixed the runner, resumed it, and it continued from the first task that was not completed. That repair is also why the branch ended up with 49 commits for 48 tasks: the extra one is the commit hardening the runner itself. This sounds like a minor detail, but a loop that can only continue is not something I would leave running on a large codebase.

The 49 commits were produced in 24 hours and 40 minutes, around one every 31 minutes on average. Most of that time was not the model typing code. It was Rust tests, frontend tests, builds and CI. Some early commits took ten or fifteen minutes, while tasks involving queries, tunnels, remote authentication or cross-browser testing took much longer.

What came out of the loop is a shared application rather than a separate web rewrite. Running `tabularis` still starts the desktop client. Running `tabularis web` starts the same application services without a native window and serves the React UI. On desktop the typed client uses Tauri IPC. In the browser it uses HTTP and WebSocket. Both transports reach the same Rust services for connections, queries, plugins, settings, backups and AI.

The browser differences are handled as capabilities. A desktop file dialog may become an upload, a download or a server-side picker. A secondary window becomes a route. The updater becomes information about the server version. Local mode binds to `127.0.0.1` and exchanges a short-lived bootstrap token for an `HttpOnly` session. Remote mode is rejected unless authentication, HTTPS origin and allowed origins are configured.

A disclosure is due here. I use GPT-5.6-sol thanks to OpenAI supporting Tabularis through the <a href="https://openai.com/form/codex-for-oss/" target="_blank" rel="noopener noreferrer">Codex for Open Source program</a>, which gives selected maintainers Codex access and API credits. It is worth mentioning because this was not a token-efficient experiment. Forty-eight high-reasoning tasks, full test suites and repair sessions consume real resources: in a single day, the run went through roughly 25% of the weekly usage limit of a ChatGPT Pro plan. The sponsorship allowed me to optimize for verification instead of trying to save every model call. With that said, the model did a very good job.

At the same time, I don't think the result is explained only by the model becoming stronger. GPT-5.6-sol was more capable than the models I used a few months ago, but it also found a repository prepared with examples, tests, rules and a very explicit sequence of changes. The same model with a single “build a web version” prompt would probably have produced something impressive in a few hours and unpleasant to maintain for years.

Looking back at the whole run, the clearest way I have found to describe the progression I mentioned at the beginning is where the durable state lives and who decides that the work is complete:

| Mode | Unit of work | Durable state | Completion |
|---|---|---|---|
| Autocomplete | The next tokens | The open file | The developer accepts the suggestion |
| Chat | One answer | The conversation | The developer asks another question |
| Coding agent | One delegated task | The context window and worktree | The agent returns control |
| Agent loop | One verified task | The repository, tests and Git | External checks pass |

This is why I expect more AI development to move toward loops and what OpenAI calls <a href="https://openai.com/index/harness-engineering/" target="_blank" rel="noopener noreferrer">harness engineering</a>. As agents become able to work for longer, the interesting problem moves from getting them to write code to giving them an environment where wrong work is visible. The compiler, tests, Git history, browser, CI and code review all become feedback channels. The model tries something, the environment pushes back, and the next iteration starts from that result.

There is also a limit to this approach. The loop completed all 48 tasks, but the <a href="https://github.com/TabularisDB/tabularis/pull/676" target="_blank" rel="noopener noreferrer">pull request is still open</a> while I write this. After the planned run I changed the original `--web` flag into a `web` subcommand, added connection-specific editor routes and a secure server-side file picker, fixed CI details and resolved conflicts with `main`. External review found real security issues. The clearest one: user-uploaded SVG connection icons were served inline without any content security policy, a stored XSS, while the neighboring plugin asset endpoint applied every one of the missing protections. The loop knew the right pattern and used it where a task asked for it, but no task owned the invariant. Security is a property of the whole system, and a plan made of locally verified tasks does not automatically verify global properties. Four thousand tests are useful evidence, but they do not make a network listener correct by definition.

I still have to review the architecture, the threat model and the final diff, and I still decide if the feature is ready to merge. The loop changes where my time goes. I spend more time preparing tasks, making the codebase legible, deciding what evidence is sufficient and reviewing the result. I spend much less time writing each implementation line myself.

I would use this approach again for work that can be decomposed and verified. I would be more careful for a product whose behavior is still unclear, because a loop is not particularly good at deciding what people want. It is good at moving through a plan once the plan has enough structure.

I don't know what the right size of a task will be as models improve. What seems clear is that the useful unit is becoming less “give the model a prompt” and more “build a process where the model can try, observe and continue.” For me, this project was the first time that difference became very concrete.

:::star:::
