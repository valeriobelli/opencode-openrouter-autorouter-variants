# Changesets

This folder is managed by [@changesets/cli](https://github.com/changesets/changesets).

## Adding a changeset

Run `pnpm changeset` and follow the prompts. A markdown file describing the
change will be created here. Commit it alongside your code.

When changesets are present on `main`, the Release workflow opens a "Version
Packages" pull request that bumps versions and updates the changelog. Merging
that PR publishes to npm.
