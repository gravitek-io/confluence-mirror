import { test, expect } from '@playwright/test';

/**
 * Showroom Page Tests - Validate all ADF processors and rendering
 *
 * This test suite validates that all ADF elements from the showroom page
 * render correctly. It helps detect regressions in processors when making
 * changes to the API client or processing logic.
 */

test.describe('Showroom Page - ADF Processors Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/showroom');
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('should render the showroom page', async ({ page }) => {
    await expect(page).toHaveTitle(/Confluence Mirror/);
    await expect(page.locator('h1').first()).toContainText('Confluence Mirror - Showroom');
  });

  test.describe('Text Formatting Processor', () => {
    test('should render bold text', async ({ page }) => {
      const boldText = page.locator('strong').filter({ hasText: 'bold text' }).first();
      await expect(boldText).toBeVisible();
    });

    test('should render italic text', async ({ page }) => {
      const italicText = page.locator('em').filter({ hasText: 'italic text' });
      await expect(italicText).toBeVisible();
    });

    test('should render underlined text', async ({ page }) => {
      const underlinedText = page.locator('u').filter({ hasText: 'underlined text' });
      await expect(underlinedText).toBeVisible();
    });

    test('should render strikethrough text', async ({ page }) => {
      const strikeText = page.locator('s, del').filter({ hasText: 'strikethrough text' });
      await expect(strikeText).toBeVisible();
    });

    test('should render inline code', async ({ page }) => {
      const codeText = page.locator('code').filter({ hasText: 'inline code' });
      await expect(codeText).toBeVisible();
    });

    test('should render links', async ({ page }) => {
      const link = page.locator('a').filter({ hasText: 'link to Confluence' });
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href', 'https://www.atlassian.com/software/confluence');
    });
  });

  test.describe('Lists Processor', () => {
    test('should render bullet lists', async ({ page }) => {
      const bulletList = page.locator('ul').first();
      await expect(bulletList).toBeVisible();

      // Check that bullet list items exist
      const listItems = bulletList.locator('li');
      const count = await listItems.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should render ordered lists', async ({ page }) => {
      const orderedList = page.locator('ol').first();
      await expect(orderedList).toBeVisible();

      const firstItem = orderedList.locator('li').filter({ hasText: 'First numbered item' });
      await expect(firstItem).toBeVisible();
    });
  });

  test.describe('Special Confluence Elements', () => {
    test('should render status badges', async ({ page }) => {
      // Status badges are rendered as inline elements, just check they're in the content
      const content = await page.textContent('body');
      expect(content).toContain('In Progress');
      expect(content).toContain('Done');
      expect(content).toContain('Urgent');
    });

    test('should render dates', async ({ page }) => {
      // Date should be formatted and visible in the content
      const content = await page.textContent('body');
      expect(content).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}|Aug|August|2023/);
    });

    test('should render mentions', async ({ page }) => {
      // Mentions are rendered inline in the content
      const content = await page.textContent('body');
      expect(content).toContain('John Doe');
    });

    test('should render emojis', async ({ page }) => {
      // Emojis should be visible in the page
      const content = await page.textContent('body');
      expect(content).toMatch(/😊|🚀|✅/);
    });
  });

  test.describe('Panels Processor', () => {
    test('should render info panel', async ({ page }) => {
      // Panels are rendered as divs with specific styles, check content exists
      const content = await page.textContent('body');
      expect(content).toContain('This is an information panel');
    });

    test('should render warning panel', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('This is a warning panel');
    });

    test('should render error panel', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('This is an error panel');
    });

    test('should render success panel', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('This is a success panel');
    });

    test('should render note panel', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('This is a note panel');
    });
  });

  test.describe('Code and Quotes Processor', () => {
    test('should render blockquotes', async ({ page }) => {
      const blockquote = page.locator('blockquote').filter({
        hasText: 'This is a block quote'
      });
      await expect(blockquote).toBeVisible();
    });

    test('should render code blocks', async ({ page }) => {
      const codeBlock = page.locator('pre code').filter({
        hasText: 'function example()'
      });
      await expect(codeBlock).toBeVisible();
    });
  });

  test.describe('Table Processor', () => {
    test('should render table structure', async ({ page }) => {
      const table = page.locator('table').first();
      await expect(table).toBeVisible();
    });

    test('should render table headers', async ({ page }) => {
      const elementTypeHeader = page.locator('th').filter({ hasText: 'Element Type' });
      const supportHeader = page.locator('th').filter({ hasText: 'Support' });
      const descriptionHeader = page.locator('th').filter({ hasText: 'Description' });

      await expect(elementTypeHeader).toBeVisible();
      await expect(supportHeader).toBeVisible();
      await expect(descriptionHeader).toBeVisible();
    });

    test('should render table data', async ({ page }) => {
      const formattedTextCell = page.locator('td').filter({ hasText: 'Formatted Text' });
      await expect(formattedTextCell).toBeVisible();
    });
  });

  test.describe('Media Processor', () => {
    test('should render media/images', async ({ page }) => {
      // Look for image elements with proper src attribute
      const mediaImage = page.locator('img').first();
      await expect(mediaImage).toBeVisible();

      // Verify the image has a valid src (not empty or broken)
      const src = await mediaImage.getAttribute('src');
      expect(src).toBeTruthy();
      expect(src).not.toBe('');

      // For the placeholder image in showroom, verify it's from Unsplash
      if (src?.includes('unsplash')) {
        expect(src).toContain('unsplash.com');
      }
    });

    test('should render image captions', async ({ page }) => {
      // Caption is rendered below the image
      const content = await page.textContent('body');
      expect(content).toContain('Centered italic image caption');
    });
  });

  test.describe('TOC Processor', () => {
    test('should render table of contents', async ({ page }) => {
      // TOC is rendered, check that heading links exist
      const headings = page.locator('h2');
      const count = await headings.count();
      expect(count).toBeGreaterThan(0);
    });

    test('should generate heading anchors', async ({ page }) => {
      // All h2 headings should have IDs for TOC linking
      const headings = page.locator('h2');
      const count = await headings.count();

      for (let i = 0; i < count; i++) {
        const heading = headings.nth(i);
        const id = await heading.getAttribute('id');
        expect(id).toBeTruthy();
      }
    });
  });

  test.describe('Extensions Processor', () => {
    test('should render Confluence extensions', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('Content of a custom Confluence extension');
    });

    test('should render bodied extensions', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('This is a bodied extension');
    });
  });

  test.describe('Task Lists Processor', () => {
    test('should render task lists', async ({ page }) => {
      const taskList = page.locator('input[type="checkbox"]').first();
      await expect(taskList).toBeVisible();
    });

    test('should render completed tasks', async ({ page }) => {
      const completedTask = page.locator('input[type="checkbox"][checked]').first();
      await expect(completedTask).toBeVisible();
    });

    test('should render pending tasks', async ({ page }) => {
      const pendingTasks = page.locator('input[type="checkbox"]:not([checked])');
      const count = await pendingTasks.count();
      expect(count).toBeGreaterThan(0);
    });
  });

  test.describe('Layout Processor', () => {
    test('should render column layouts', async ({ page }) => {
      // Columns are rendered using CSS grid/flex, check content exists
      const content = await page.textContent('body');
      expect(content).toContain('multi-column layouts');
    });

    test('should render multi-column content', async ({ page }) => {
      const content = await page.textContent('body');
      expect(content).toContain('This is the left column');
      expect(content).toContain('This is the right column');
    });
  });

  test.describe('Navigation Integration', () => {
    test('should render showroom navigation', async ({ page }) => {
      // ShowroomNavigation component is rendered, check it exists
      const navigation = page.locator('.col-span-1').first();
      await expect(navigation).toBeVisible();
    });

    test('should have back to home link', async ({ page }) => {
      const backLink = page.locator('a').filter({ hasText: /Back to Home/i });
      await expect(backLink).toBeVisible();
    });
  });

  test.describe('Visual Regression', () => {
    test('should match showroom visual snapshot', async ({ page }) => {
      // Take a screenshot of the main content area only (not full page to avoid flakiness)
      const mainContent = page.locator('.col-span-3').first();
      await expect(mainContent).toHaveScreenshot('showroom-content.png');
    });
  });
});
