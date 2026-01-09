# Publishing @gravitek/confluence-mirror-core

## ✅ Migration Complete

The package has been successfully migrated from `confluence-mirror-core` to `@gravitek/confluence-mirror-core`.

All changes have been committed. The project builds successfully.

## 📦 Step 1: Publish the New Package

```bash
cd packages/core

# Verify you're logged in to npm as the correct user
npm whoami

# Publish to npm (version 0.2.0)
npm publish --access public
```

**What's in version 0.2.0:**
- ✅ Link enrichment with page titles
- ✅ URL transformation to local viewer
- ✅ Date parsing improvements (string timestamps)
- ✅ File attachment support (PowerPoint, PDF, etc.)
- ✅ Child pages link transformation
- ✅ OAuth2 authentication support
- ✅ @gravitek organization namespace

## 🔄 Step 2: Deprecate the Old Package

After successful publication, deprecate the old package:

```bash
# Deprecate all versions of the old package
npm deprecate confluence-mirror-core \
  "⚠️ Package moved to @gravitek/confluence-mirror-core. Please update: npm uninstall confluence-mirror-core && npm install @gravitek/confluence-mirror-core"
```

## 📝 Step 3: Update README on npm

The old package page will show the deprecation warning automatically.

You can optionally publish a final version (0.1.4) with just a README pointing to the new package:

```bash
# Only if you want to make the migration more visible
cd packages/core

# Temporarily revert to old name
# Update package.json: "name": "confluence-mirror-core", "version": "0.1.4"
# Update README.md with migration notice

npm publish
npm deprecate confluence-mirror-core "⚠️ Moved to @gravitek/confluence-mirror-core"

# Then restore the new name
git restore package.json
```

## ✨ Usage in Client Projects

### New Installation

```bash
npm install @gravitek/confluence-mirror-core
```

### Imports

```typescript
import {
  ConfluenceClient,
  processADFWithMedia,
  processADFWithTOC,
  processADFWithLinks,
  UrlTransformer
} from '@gravitek/confluence-mirror-core';
```

## 🎯 Next Steps for Client Projects

1. Install the package: `npm install @gravitek/confluence-mirror-core`
2. Copy React components from `/demo/src/components/confluence/`
3. Copy utility: `/demo/src/lib/confluence.ts`
4. Adapt styling to client's design system
5. Configure environment variables

## 📖 Documentation

- npm: https://www.npmjs.com/package/@gravitek/confluence-mirror-core
- GitHub: https://github.com/Gravitek-io/confluence-mirror
- Demo: Running locally at http://localhost:3000

## 🔍 Verification

After publishing, verify the package:

```bash
# Search for the package
npm search @gravitek/confluence-mirror-core

# View package info
npm info @gravitek/confluence-mirror-core

# Install in a test project
mkdir test-install && cd test-install
npm init -y
npm install @gravitek/confluence-mirror-core
```

## ⚠️ Important Notes

- The package is now under the `@gravitek` organization
- Version 0.2.0 includes all features developed since 0.1.3
- No breaking changes in the API (only package name change)
- Local development continues to work with `file:../packages/core`
