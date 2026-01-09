# Implementation Plan: Migrate to Next.js 16.1

## Overview

Migrate the Confluence Mirror demo application from Next.js 15.4.10 to Next.js 16.1 (latest stable release). This migration will unlock performance improvements from Turbopack (now default), file system caching, and new caching APIs while maintaining full compatibility with existing code.

## Key Technical Details

- **Current Version**: Next.js 15.4.10
- **Target Version**: Next.js 16.1.x (latest stable)
- **React Version**: 19.1.0 (compatible, may update to 19.2+ if available)
- **Bundler**: Turbopack (now default in Next.js 16)
- **Tailwind CSS**: v4.1.11 (verify compatibility with Turbopack)
- **Breaking Changes**: Review migration guide for any breaking changes

## Implementation Steps

### Step 1: Review Next.js 16 Migration Guide

Before making changes, review the official migration guide:
- Visit https://nextjs.org/docs/upgrading
- Check for breaking changes from 15.x to 16.x
- Review deprecated APIs and their replacements
- Note any configuration changes required

**Documentation to review**:
- Next.js 16.1 release notes
- Next.js 16.0 release notes
- Turbopack documentation
- React 19.2 changelog (if updating)

---

### Step 2: Update Dependencies

**Location**: `demo/package.json`

Update Next.js and related packages to 16.1.x:

```json
{
  "dependencies": {
    "@gravitek/confluence-mirror-core": "file:../packages/core",
    "@tailwindcss/postcss": "^4.1.11",
    "next": "^16.1.0",  // Update from 15.4.10
    "react": "^19.1.0",  // Check if 19.2+ available
    "react-dom": "^19.1.0",  // Match React version
    "tailwindcss": "^4.1.11"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3",
    "@playwright/test": "^1.57.0",
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "^16.1.0",  // Update to match Next.js
    "typescript": "^5"
  }
}
```

**Commands**:
```bash
cd demo
npm install next@latest
npm install eslint-config-next@latest
npm install  # Resolve all dependencies
```

**Verification**:
- Check for any dependency conflicts
- Ensure all packages resolve correctly
- Review npm warnings for deprecated packages

---

### Step 3: Review and Update Configuration Files

**Location**: `demo/next.config.ts`

Check current configuration for deprecated options:

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Turbopack is now default in Next.js 16 - no config needed
  // Remove any experimental Turbopack flags if present

  // Review any experimental features
  experimental: {
    // Check if any experimental flags are now stable or deprecated
  },

  // Verify other configuration options are still valid
};

export default nextConfig;
```

**Items to check**:
- Remove experimental Turbopack flags (now default)
- Review experimental features (PPR, React Compiler)
- Check if any configuration is deprecated
- Verify Tailwind CSS PostCSS configuration

**Location**: `demo/tsconfig.json`

Verify TypeScript configuration:
- Check if Next.js 16 requires any TypeScript updates
- Ensure `strict` mode is compatible
- Review compiler options

---

### Step 4: Test Development Server

**Commands**:
```bash
cd demo
npm run dev
```

**Verification checklist**:
- [ ] Development server starts without errors
- [ ] No console warnings about deprecated features
- [ ] Hot Module Replacement (HMR) works
- [ ] Turbopack is active (check terminal output)
- [ ] File system caching works (restart server, check speed)

**Test all routes**:
- [ ] `/` - Home page with form
- [ ] `/showroom` - Complete ADF showcase
- [ ] `/how-to` - Integration guide

**Visual regression checks**:
- [ ] Tailwind CSS styles render correctly
- [ ] Typography is intact
- [ ] Colors and spacing unchanged
- [ ] Layout components render properly
- [ ] Responsive design works
- [ ] Images load correctly

---

### Step 5: Test Application Functionality

**Form Testing** (`/` page):
- [ ] URL input accepts Confluence links
- [ ] Form submission works
- [ ] Page ID extraction works
- [ ] Error handling displays correctly
- [ ] Loading states work

**Navigation Testing**:
- [ ] Client-side navigation works
- [ ] Prefetching works (no performance regression)
- [ ] Back/forward buttons work
- [ ] External links work

**Server Components**:
- [ ] ConfluenceMirrorServer renders
- [ ] ConfluencePage renders
- [ ] NavigationTreeServer renders
- [ ] OptimizedADFRenderer works
- [ ] OptimizedTOC works
- [ ] OptimizedMedia works

**ADF Rendering** (`/showroom`):
- [ ] All ADF elements render correctly
- [ ] Text formatting (bold, italic, code, etc.)
- [ ] Headings and paragraphs
- [ ] Lists (ordered, unordered, task lists)
- [ ] Tables
- [ ] Code blocks
- [ ] Panels (info, warning, error, etc.)
- [ ] Media (images, attachments)
- [ ] Links and mentions
- [ ] Layouts (multi-column)

---

### Step 6: Run Playwright Tests

**Commands**:
```bash
cd demo
npm run test
```

**Test suites**:
- [ ] All e2e tests pass
- [ ] No new test failures
- [ ] No timeout issues
- [ ] Showroom tests pass

**If tests fail**:
1. Check if failures are due to Next.js changes
2. Review test selectors (ensure still valid)
3. Check for timing issues (Turbopack may be faster)
4. Update tests if necessary

---

### Step 7: Test Production Build

**Commands**:
```bash
cd demo
npm run build
```

**Verification checklist**:
- [ ] Build completes without errors
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Turbopack build succeeds
- [ ] Output size reasonable (check for regressions)
- [ ] Static pages generated correctly

**Build output to check**:
- Route information (static/dynamic)
- Bundle sizes
- Build warnings or errors
- Build time (should be faster with Turbopack)

**Test production server**:
```bash
npm run start
```

- [ ] Production server starts
- [ ] All routes work in production
- [ ] No console errors in production
- [ ] Performance is good (no regressions)

---

### Step 8: Update Documentation

**Location**: `README.md`

Update Next.js version reference:
```markdown
### Key Dependencies

- Next.js 16.1
- React 19
- Tailwind CSS v4
```

**Location**: `demo/README.md`

Update development instructions if needed:
- Add note about Turbopack being default
- Update any Next.js-specific instructions
- Update troubleshooting section if needed

**Location**: `CHANGELOG.md`

Add entry for this migration:
```markdown
## [Unreleased]

### Changed
- Upgraded Next.js from 15.4.10 to 16.1.x
- Turbopack now default bundler (improved performance)
- Updated eslint-config-next to 16.1.x

### Performance
- Faster development server startup with Turbopack file system caching
- Improved Hot Module Replacement (HMR) speed
```

**Location**: `packages/core/README.md`

No changes needed (core package unaffected)

---

### Step 9: Handle Breaking Changes

**Review migration guide for breaking changes**:
- Check fetch() caching behavior changes
- Review routing changes
- Check Server Components behavior
- Verify environment variable handling
- Review headers and middleware changes

**If breaking changes found**:
1. Document the change
2. Update affected code
3. Test thoroughly
4. Update documentation

**Common areas to check**:
- `fetch()` calls with caching
- `revalidateTag()` usage
- Server Component data fetching
- Route handlers (if any)
- Middleware (if any)

---

### Step 10: Performance Verification

**Metrics to compare** (before and after):

**Development**:
- [ ] Server startup time (should be faster)
- [ ] HMR speed (should be faster)
- [ ] File system caching works (second startup faster)

**Build**:
- [ ] Build time (should be faster with Turbopack)
- [ ] Bundle size (should be similar or smaller)

**Runtime**:
- [ ] Page load time (should be similar or better)
- [ ] Navigation speed (should be similar or better)
- [ ] Time to Interactive (should be similar or better)

**If performance regresses**:
1. Check browser console for errors
2. Review Turbopack configuration
3. Check for bundle size increases
4. Consider enabling experimental features (PPR, etc.)
5. Report issues to Next.js team

---

### Step 11: Optional - Enable New Features

**Consider enabling these features** (if beneficial):

**React Compiler** (if available):
```typescript
// next.config.ts
experimental: {
  reactCompiler: true,
}
```
Benefits: Automatic memoization, better performance

**Partial Pre-Rendering (PPR)** (experimental):
```typescript
// next.config.ts
experimental: {
  ppr: true,
}
```
Benefits: Faster page loads with static shell

**Bundle Analyzer** (experimental):
```typescript
// next.config.ts
experimental: {
  bundleAnalyzer: true,
}
```
Benefits: Better bundle size insights

**Note**: Only enable if well-tested and beneficial. Can defer to future PR.

---

### Step 12: Final Verification

**Complete checklist**:
- [ ] All dependencies updated
- [ ] Development server works
- [ ] All routes render correctly
- [ ] Tailwind CSS intact
- [ ] Form functionality works
- [ ] Navigation works
- [ ] Playwright tests pass
- [ ] Production build succeeds
- [ ] Production server works
- [ ] No console errors or warnings
- [ ] Performance metrics stable or improved
- [ ] Documentation updated
- [ ] CHANGELOG updated

**Clean up**:
- [ ] Remove any temporary files
- [ ] Remove unused dependencies
- [ ] Update `.gitignore` if needed

---

## Files Summary

### Modified Files
- `demo/package.json` - Update Next.js and eslint-config-next versions
- `demo/next.config.ts` - Remove deprecated options (if any)
- `README.md` - Update Next.js version reference
- `demo/README.md` - Update development instructions (if needed)
- `CHANGELOG.md` - Add migration entry

### Files to Review (may need updates)
- `demo/tsconfig.json` - Verify TypeScript configuration
- `demo/.env.example` - Check if env vars changed
- `demo/src/app/layout.tsx` - Verify no breaking changes
- `demo/src/components/**/*` - Test all components
- `demo/playwright.config.ts` - Update if needed

### No Changes Required
- `packages/core/**/*` - Core package unaffected
- `demo/src/lib/confluence.ts` - No changes needed
- `demo/tailwind.config.ts` - Should work with Turbopack

## Rollback Plan

If critical issues arise:

1. **Revert package.json**:
   ```bash
   git checkout demo/package.json
   npm install
   ```

2. **Test reverted version**:
   ```bash
   npm run dev
   npm run test
   npm run build
   ```

3. **Document issues**:
   - Record what broke
   - Check Next.js GitHub issues
   - Report bug if necessary
   - Plan alternative approach

## Success Metrics

- [ ] Next.js updated to 16.1.x
- [ ] All dependencies compatible
- [ ] Development server starts and runs
- [ ] All routes render correctly
- [ ] Tailwind CSS styling intact
- [ ] All functionality works (forms, navigation, etc.)
- [ ] Playwright tests pass (100%)
- [ ] Production build succeeds
- [ ] Production server runs
- [ ] No console errors or warnings
- [ ] Performance stable or improved
- [ ] Documentation updated
- [ ] CHANGELOG updated

## Notes

- **Turbopack**: Now default bundler - no configuration needed
- **File System Caching**: Improves dev server startup time
- **React 19.2**: Check if available for additional features
- **Breaking Changes**: Review migration guide carefully
- **Tailwind v4**: Already compatible, verify with Turbopack
- **Core Package**: Unaffected by Next.js upgrade
- **Tests**: May need minor updates if selectors change
- **Performance**: Should improve, especially dev experience
- **Future Features**: Can enable PPR, React Compiler in future PR

## References

- Next.js 16.1 Release: https://nextjs.org/blog (December 18, 2025)
- Next.js 16 Release: https://nextjs.org/blog (October 2025)
- Migration Guide: https://nextjs.org/docs/upgrading
- Turbopack Docs: https://nextjs.org/docs/architecture/turbopack
- React 19 Docs: https://react.dev/blog
