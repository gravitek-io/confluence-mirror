# Confluence Mirror - E2E Tests

This directory contains end-to-end tests for the Confluence Mirror demo application using Playwright.

## Purpose

These tests validate that all ADF (Atlas Document Format) processors work correctly by testing the Showroom page, which demonstrates all supported Confluence elements. This helps:

- **Detect regressions** when modifying API clients or processors
- **Validate compatibility** between API v1 (Basic Auth) and API v2 (OAuth2)
- **Ensure rendering quality** of all ADF element types
- **Visual regression testing** to catch UI changes

## Test Coverage

The test suite covers all major ADF processors:

### ✅ Text Formatting Processor
- Bold, italic, underline, strikethrough
- Inline code
- Links

### ✅ Lists Processor
- Bullet lists
- Ordered lists

### ✅ Special Confluence Elements
- Status badges
- Dates and timestamps
- User mentions
- Emojis

### ✅ Panels Processor
- Info, warning, error, success, note panels

### ✅ Code and Quotes Processor
- Blockquotes
- Code blocks with syntax highlighting

### ✅ Table Processor
- Table structure
- Headers and data cells

### ✅ Media Processor
- Images and media rendering
- Image captions
- Media URLs extraction from Storage format

### ✅ TOC (Table of Contents) Processor
- TOC generation
- Heading anchor links

### ✅ Extensions Processor
- Standard extensions
- Bodied extensions

### ✅ Task Lists Processor
- Completed tasks
- Pending tasks

### ✅ Layout Processor
- Multi-column layouts
- Responsive design

## Running Tests

### Prerequisites

```bash
# Install dependencies (if not already done)
npm install

# Install Playwright browsers (first time only)
npx playwright install chromium
```

### Running All Tests

```bash
# Run all tests in headless mode
npm test

# Run tests with UI (interactive mode)
npm run test:ui

# Run tests in headed mode (see browser)
npm run test:headed

# Run only showroom tests
npm run test:showroom
```

### Running Specific Tests

```bash
# Run a specific test file
npx playwright test showroom.spec.ts

# Run a specific test by name
npx playwright test -g "should render media/images"

# Debug a test
npx playwright test showroom.spec.ts --debug
```

## Test Results

Test results are saved in:
- `playwright-report/` - HTML report with screenshots
- `test-results/` - Test artifacts and screenshots

View the HTML report:
```bash
npx playwright show-report
```

## Visual Regression Testing

The test suite includes visual regression tests that capture screenshots:

1. **First run**: Creates baseline screenshots
2. **Subsequent runs**: Compares against baseline

To update baseline screenshots:
```bash
npx playwright test --update-snapshots
```

## Writing New Tests

When adding new ADF element support:

1. Add test cases in `showroom.spec.ts`
2. Follow the existing test structure
3. Use descriptive test names
4. Verify both presence and correctness

Example:
```typescript
test('should render my new element', async ({ page }) => {
  const element = page.locator('.my-new-element');
  await expect(element).toBeVisible();
  await expect(element).toContainText('Expected text');
});
```

## CI/CD Integration

These tests are designed to run in CI/CD pipelines:

```yaml
# Example GitHub Actions workflow
- name: Run Playwright tests
  run: npm test
  env:
    CI: true
```

## Troubleshooting

### Tests failing on media processor

If media tests fail, check:
1. API v2 is fetching **both** `atlas_doc_format` AND `storage` formats
2. Media processor is receiving Storage HTML
3. Media URLs are being extracted correctly

### Visual regression failures

Visual tests may fail due to:
- Font rendering differences across systems
- Browser version changes
- Actual UI changes (intended or unintended)

Review the diff images in `test-results/` to determine if changes are expected.

## Best Practices

- **Run tests locally** before committing
- **Update snapshots** only when UI changes are intentional
- **Keep tests focused** - one assertion per test when possible
- **Use descriptive names** - test names should explain what they validate
- **Maintain test data** - keep showroom.tsx up-to-date with new elements
