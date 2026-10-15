/**
 * OpenCode plugin — OpenRouter routing variants
 *
 * Adds OpenRouter routing variants (`:nitro`, `:floor`, `:exacto`) as OpenCode
 * `#variants` on every OpenRouter base model so they appear in the model picker.
 *
 * Routing variants are not listed in OpenRouter's `GET /api/v1/models` catalog
 * but can be appended to any model ID at request time to change how the request
 * is routed (throughput, price, or tool-calling optimization).
 *
 * Catalog variants (`:free`, `:batch`, `:thinking`, `:extended`) are separate
 * entries in the models API and should already appear as individual models from
 * OpenCode's built-in OpenRouter provider — this plugin does not touch them.
 *
 * @see https://openrouter.ai/docs/guides/routing/model-variants/overview
 */

import { Plugin } from "@opencode/plugin";

/**
 * Active OpenRouter routing-variant suffixes.
 *
 * `:online` is deprecated (use the `openrouter:web_search` server tool instead)
 * and is intentionally excluded.
 */
const ROUTING_VARIANTS = ["nitro", "floor", "exacto"] as const;

/**
 * Provider ID used by OpenCode's built-in OpenRouter provider.
 */
const OPENROUTER_PROVIDER_ID = "openrouter";

/**
 * Read an SDK-typed ID back as the plain string it is at runtime.
 *
 * The plugin SDK types IDs (model IDs, variant IDs) as Effect Schema brands,
 * and its `DeepMutable` helper degrades those `string & Brand` intersections
 * into object types that are not assignable to `string`, even though every ID
 * is a plain string at runtime. Normalize on the way in, and bridge the
 * symmetric write-side mismatch with a single documented cast below.
 */
const toID = (id: unknown): string => String(id);

export default Plugin.define({
  id: "openrouter-variants",
  async setup(ctx) {
    await ctx.model.transform((editor) => {
      for (const model of editor.list(OPENROUTER_PROVIDER_ID)) {
        // Skip catalog variants — they already have their own model entries
        // (e.g. "anthropic/claude-sonnet-4:free").
        if (toID(model.id).includes(":")) continue;

        // The model ID sent to the OpenRouter API. For the native OpenRouter
        // provider this equals the OpenCode model ID, but we read `modelID`
        // to respect any custom aliasing.
        const providerModelID = toID(model.modelID || model.id);

        // Don't duplicate variants that another plugin or config already added.
        const existing = new Set((model.variants ?? []).map((variant) => toID(variant.id)));
        const toAdd = ROUTING_VARIANTS.filter((id) => !existing.has(id));
        if (toAdd.length === 0) continue;

        editor.update(OPENROUTER_PROVIDER_ID, toID(model.id), (draft) => {
          // New entries are plain objects; the branded variant `id` (see the
          // note on `toID`) makes the assembled array need one controlled
          // cast to satisfy the SDK's editor types. Runtime values are
          // unchanged.
          draft.variants = [
            ...(draft.variants ?? []),
            ...toAdd.map((id) => ({
              id,
              // Override the `model` field in the request body so OpenRouter
              // receives "<model_id>:<suffix>" and routes accordingly.
              body: { model: `${providerModelID}:${id}` },
            })),
          ] as unknown as typeof draft.variants;
        });
      }
    });
  },
});
