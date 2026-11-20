# Publishing @gravitek/confluence-mirror-core

Release steps for version 0.3.0 (folder browsing, Node 22+, security fixes). See [packages/core/CHANGELOG.md](./packages/core/CHANGELOG.md).

## Before publishing

1. The release branch is reviewed and merged, and CI is green.
2. `packages/core/package.json` has version `0.3.0`.
3. You are logged in to npm with publish rights on the `@gravitek` scope:

```bash
npm whoami
```

## Release

```bash
# From the repository root
npm ci
npm run build:core
npm test

# Check the tarball: only dist/, README.md, package.json (and LICENSE if present)
cd packages/core
npm pack --dry-run

# Publish
npm publish --access public
```

Then tag the release and push the tag:

```bash
git tag core-v0.3.0
git push origin core-v0.3.0
```

## Verification

```bash
npm info @gravitek/confluence-mirror-core version   # 0.3.0

mkdir test-install && cd test-install
npm init -y
npm install @gravitek/confluence-mirror-core
```

## Notes

- The package has no runtime dependencies and requires Node.js 22 or later.
- Local development of the demo uses the workspace link to `packages/core`.
