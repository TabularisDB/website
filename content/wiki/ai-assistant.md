---
title: "AI Assistant & Context Engine"
order: 7
excerpt: "Use AI to generate SQL from natural language and explain complex queries."
category: "AI & MCP"
---

Tabularis integrates a privacy-first AI assistant directly into the SQL Editor and notebooks. It goes beyond simple autocomplete by understanding your database structure to generate, explain, and label queries.

<video src="/videos/wiki/09-ai-assistant.mp4" controls muted playsinline loop autoplay controlsList="nodownload noremoteplayback noplaybackrate" disablePictureInPicture></video>

![AI Assistant](/img/tabularis-ai-assistant.png)

## How Context Injection Works

A common failure of generic AI tools (like ChatGPT) is hallucinating column names. Tabularis solves this via **Schema Snapshots**.

When you ask the AI to "Find users who ordered in the last 30 days", Tabularis intercepts the request and builds a condensed, token-optimized snapshot of your current database structure.

The snapshot is loaded through the driver of the editor's active connection and schema. Tabularis waits for that metadata before sending the request, so a fast click on **Generate SQL** cannot race ahead with an empty schema. Up to 20 tables are included with their columns, primary-key markers, nullability, defaults, and available foreign-key relationships; the prompt notes when additional tables were omitted.

**Example snapshot injected into the system prompt** (it replaces the `{{SCHEMA}}` placeholder):
```text
Table: "users"
  - id uuid PK NOT NULL
  - username varchar NOT NULL
  - created_at timestamptz NOT NULL DEFAULT now()
Table: "orders"
  - id uuid PK NOT NULL
  - user_id uuid NOT NULL
  - total numeric
  - status varchar
  FK: user_id -> users.id
... and 12 more tables (not shown)
```
By feeding this exact structural context to the LLM alongside your natural language prompt, the AI knows exactly which `JOIN` clauses to write and which data types it is dealing with.

Since v0.34.0 the snapshot can also carry your own descriptions of tables and columns. [Schema Notes](/wiki/schema-management#schema-notes) are local Markdown notes per connection, table and column; with **Include these notes in AI schema context** enabled for the connection (off by default), the notes of the tables in the snapshot are appended after it, each quoted on its own line under a header that marks them as user-written, untrusted descriptive context. The section is capped in size, and an unreadable notes file is skipped without breaking the request.

### Plugin drivers

AI Query Assist uses the same driver registry as the rest of Tabularis, so it also works with external database plugins. Existing plugins receive automatic support through their standard `get_tables`, `get_columns`, and `get_foreign_keys` metadata methods. A plugin can optionally implement the batched `get_ai_schema_context` JSON-RPC method when its database offers a more efficient metadata query; if that method is absent, Tabularis falls back automatically.

Plugins return structured metadata only. Tabularis keeps ownership of truncation safeguards, prompt formatting, and provider dispatch, which gives built-in and external drivers the same behavior.

## Supported Providers & Local Privacy

Tabularis is provider-agnostic. Configure your preferred engine in **Settings → AI**. Providers are shown as cards, each labelled with how it connects: **ChatGPT plan**, **API key** or **Local models**. The account (for ChatGPT) or the API key sits above the model selector, and the prompt editors are grouped below.

### 1. ChatGPT Plan

Since v0.29.0, the **ChatGPT** provider (`chatgpt`) lets an eligible **ChatGPT Plus or Pro** account power the AI features with its plan, without an API key. It covers SQL generation, query explanations, Visual Explain analysis, and tab and cell naming.

1. In **Settings → AI**, select the **ChatGPT** card.
2. Click **Continue with ChatGPT**. Sign-in happens in your browser, following [OpenAI's Sign in with ChatGPT guide](https://developers.openai.com/cookbook/articles/sign-in-with-chatgpt) (OAuth with PKCE). Complete sign-in and allow plan usage there.
3. Back in Tabularis, the account shows its plan status. The model list is the one available to that account; leave the model empty to use the first available model.

You can register more than one account with **Add account** and switch between them, **Sign out** of an account, or open **Manage usage**. A saved account whose session is no longer valid asks you to sign in again.

Credentials are encrypted locally with a key stored in the system keychain, and tokens are renewed in the background. Connecting does not give Tabularis access to your ChatGPT conversations: the AI features send their prompt and context to OpenAI, as they do with an API key. Switching provider or account clears the stored model, so a ChatGPT model is never carried over to another provider.

![Settings, AI: the provider cards with ChatGPT selected, the Continue with ChatGPT button and the note on locally encrypted credentials](/img/tabularis-ai-settings-chatgpt.png)

### 2. Cloud Providers (API key)
- **OpenAI** (`openai`): Uses your own API key. The model list shipped with the app is merged with the GPT models your key can access (cached for 24 hours; use the refresh button in **Settings → AI** to reload it), and you can add custom model entries.
- **Anthropic** (`anthropic`): Good for complex query explanations and structured reasoning.
- **MiniMax** (`minimax`): Available as a first-class provider in the AI settings.
- **OpenRouter** (`openrouter`): Access a broader multi-model catalog through a unified API.
- **Requesty** (`requesty`): An OpenAI-compatible LLM router. The model list loads Requesty's managed routing policies first, then its full chat model catalog. The key can also come from the `REQUESTY_API_KEY` environment variable. Requesty is only used when you select it; automatic provider detection skips it.
- **API Route** (`api-route`): Since v0.33.0. Uses the OpenAI-compatible Chat Completions endpoint at `https://global.api-route.com/v1`. Save a key (or set `API_ROUTE_API_KEY`), refresh the model list from your account and select a model. A failed refresh keeps the last model list that loaded. API Route is only used when you select it.
- **Custom OpenAI-compatible** (`custom-openai`, shown as **OpenAI Compatible**): Any endpoint that speaks the OpenAI API (e.g. LM Studio, vLLM, llama.cpp, Groq-compatible gateways). Set `aiCustomOpenaiUrl` and choose a model in Settings. Since v0.33.0 the API key is optional: without one, the model list and requests are sent without an `Authorization` header, so a local server that needs no key works as is. A configured key is still sent as a Bearer token.

### 3. Local Execution (Zero-Knowledge Privacy)
For enterprise databases with strict compliance requirements, you cannot send schema data to third-party servers. Tabularis natively integrates with **Ollama**.
1. Install [Ollama](https://ollama.com/) on your machine.
2. Pull a coding model: `ollama pull codellama` or `ollama pull llama3`.
3. In Tabularis Settings, set the provider to **Ollama**. The default port is `11434`; change it via `aiOllamaPort` if needed.
**Result**: Powerful AI assistance with a guarantee that zero bytes of data ever leave your network.

### External Providers

Since v0.33.0 an AI provider can also ship as a declarative package (plugin kind `ai-assistant`) installed from the plugin registry. Tabularis keeps the credentials, configuration, proxy routing and timeouts; the package only describes the HTTP API. OpenAI, Anthropic, Ollama, OpenRouter, Requesty, MiniMax, OpenAI Compatible and API Route stay built in, and their cards are labelled **Built in**; ChatGPT sign-in also stays built in. A package cannot replace, shadow or remove a built-in provider.

In **Settings → AI**, the **Available providers** list shows the packages you can add. **Install and use** installs one, selects it and opens its settings. A failed install leaves the saved provider unchanged. Installed packages can be removed there or in the Plugin Center, which also handles updates, and they stay usable when the registry is offline. If the active provider is removed, AI is disabled until you select another provider. The first external package is [Google Gemini](https://github.com/TabularisDB/tabularis-gemini-plugin), which takes a Gemini API key or `GEMINI_API_KEY`.

Existing provider settings, keys, saved models, custom endpoints and the Ollama port are carried over unchanged.

### Provider Proxy Overrides

Since v0.24.0, the selected provider in **Settings → AI** can inherit the global [Network proxy](/wiki/configuration#network--proxies), use a custom HTTP CONNECT/SOCKS5 proxy or disable proxying for that provider. An explicit provider choice wins over the global AI scope. Proxy passwords are kept in the OS keychain. A proxy changes the route, not which provider receives the prompt; choose your endpoint and TLS configuration accordingly.

## Inline Completion

Since v0.33.0 SQL console tabs can show AI continuations as ghost text while you type. Enable **Suggest SQL while typing** under **AI inline completion** in **Settings → AI**; it is off by default and uses the provider and model selected there, including Ollama and local OpenAI-compatible endpoints.

<video src="/videos/posts/tabularis-ai-inline-completion.mp4" poster="/videos/posts/tabularis-ai-inline-completion.jpg" autoplay loop muted playsinline></video>

- `Tab` accepts the suggestion and `Escape` dismisses it. Regular autocomplete and indentation take priority. Accepting inserts text only and never runs the query, and one undo removes it.
- Requests wait for a 600 ms pause in typing and are cancelled when you edit, move the cursor, switch tab or connection, change provider, or leave the editor. A request times out after 20 seconds; after an error, suggestions pause for 30 seconds and normal editing is unaffected.
- **What is sent:** at most 4,000 characters before the cursor, 1,000 after it and up to 8,000 characters of already-cached table and column names for the active connection, database and schema. Result rows, table comments and connection credentials are never added, and no extra database queries are made. String literals in your SQL are part of the editor text and are sent with it.

The setting applies to SQL console tabs; notebook cells and editors inside dialogs do not show inline suggestions.

## Fix with AI

Since v0.33.0, when AI is enabled and a query fails, the error in the results area has a **Fix with AI** button next to **Copy**. It opens the AI dialog with a prompt containing the error message (without stack details) and the tab's SQL, which you can edit before generating. The corrected query replaces the editor text and is not run automatically. The SQL is taken from the whole editor, so if you ran only a selection the prompt still contains all of it.

## Explain & Optimize Queries

The AI is not limited to generating SQL. From the editor you can ask it to explain the current query, and the explanation prompt is configurable in Settings. The assistant breaks down joins, subqueries, and filters in plain language and can suggest likely optimization directions.

## Notebook Cell Naming

In [SQL Notebooks](/wiki/notebooks), the AI can generate descriptive names for cells based on their content:

- **Single cell**: Click the AI icon on any cell header to generate a name for that cell.
- **Batch naming**: In the notebook **Outline** panel, click the sparkles icon (*Generate names for unnamed cells with AI*) to name all unnamed cells at once.

The naming prompt is customizable in **Settings > AI > Notebook Cell Name Prompt**. The cell content (SQL or Markdown) is sent as the user message alongside the prompt.

## Query Tab Naming

Tabularis can also generate short names for SQL result tabs. In multi-result views, the AI uses the current SQL text and a dedicated **Query Tab Name Prompt** from Settings to propose a concise label.

## Custom Prompts

The AI settings currently expose five editable prompts:

- **SQL Generation** (system prompt). Use `{{SCHEMA}}` as the placeholder for the schema snapshot.
- **Query Explanation**. Use `{{LANGUAGE}}` as the placeholder for the output language.
- **Notebook Cell Name Prompt**
- **Query Tab Name Prompt**
- **Explain Plan Analysis Prompt**, used by the AI tab of [Visual Explain](/wiki/visual-explain). It also accepts `{{LANGUAGE}}`.

## Model Context Protocol (MCP)

Tabularis ships with a built-in **MCP Server**, allowing external AI agents like Claude Desktop, Claude Code, Codex, Cursor, Windsurf, or Antigravity to interface with your saved connections over stdio.

- Open the **MCP Server** page from the sidebar (CPU icon).
- Install the config for your target client.
- The agent can then list saved connections, inspect schemas and tables, and execute SQL through the Tabularis MCP server.
