# opencode-openrouter-autorouter-variants

An [OpenCode](https://opencode.ai) plugin that adds [OpenRouter routing
variants](https://openrouter.ai/docs/guides/routing/model-variants/overview) as
selectable `#variants` on every OpenRouter base model.

## What it does

OpenRouter supports two kinds of model-variant suffixes:

| Kind        | Suffixes                                    | In `GET /api/v1/models`?                       | Handled by this plugin?                                 |
| ----------- | ------------------------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| **Catalog** | `:free`, `:batch`, `:thinking`, `:extended` | Yes — separate entries with their own metadata | No (already listed by the built-in OpenRouter provider) |
| **Routing** | `:nitro`, `:floor`, `:exacto`               | No — accepted on any model at request time     | **Yes**                                                 |

Because routing variants are not in the catalog, they never appear in
OpenCode's model picker. This plugin derives them from every OpenRouter base
model and registers them as OpenCode `#variants`:

```
openrouter/anthropic/claude-sonnet-4#nitro   → throughput-optimized routing
openrouter/anthropic/claude-sonnet-4#floor   → price-optimized routing
openrouter/anthropic/claude-sonnet-4#exacto  → tool-calling-optimized routing
```

Each variant overrides the `model` field in the request body so OpenRouter
receives the model ID with the routing suffix (e.g.
`anthropic/claude-sonnet-4:nitro`).

> `:online` is deprecated (use the `openrouter:web_search` server tool instead)
> and is intentionally excluded.

## Install

Add the package to the `plugins` array in your `opencode.json(c)` — OpenCode
downloads and loads it automatically:

```jsonc
{
  "$schema": "https://opencode.ai/config.json",
  "plugins": ["opencode-openrouter-autorouter-variants"],
}
```

You can also pin a version:

```jsonc
{
  "plugins": ["opencode-openrouter-autorouter-variants@0.1.0"],
}
```

### Requirements

- OpenRouter must be connected (via `/connect` or the `OPENROUTER_API_KEY`
  credential) for OpenRouter models to appear. The plugin adds variants only to
  the models OpenCode already lists for the `openrouter` provider.
- Variants appear on base models only — catalog variants such as `:free` are
  left untouched.

## Development

Requires Node.js 20.19+ (or 22.12+) and npm.

```sh
npm install
npm run build        # type-check and emit dist/ (tsc)
npm run typecheck    # tsc --noEmit
npm run lint         # oxlint
npm run format       # oxfmt (write)
npm run format:check # oxfmt (check only)
npm run check        # format:check + lint + typecheck
```

### Local install in OpenCode

To test a local checkout instead of the published package, point the `plugins`
array at the package directory:

```jsonc
{
  "plugins": ["/absolute/path/to/opencode-openrouter-auto-router-variants"],
}
```

## License

[MIT](./LICENSE)
