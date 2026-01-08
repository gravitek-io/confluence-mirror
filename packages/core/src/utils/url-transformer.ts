import { ConfluenceClient } from "../client/confluence-client";

/**
 * Transform Confluence URLs to local viewer URLs
 *
 * This utility helps convert Confluence page URLs to local application URLs
 * for seamless internal navigation while preserving external Confluence links.
 *
 * @example
 * ```ts
 * const transformer = new UrlTransformer({
 *   confluenceBaseUrl: 'https://mycompany.atlassian.net',
 *   localBaseUrl: 'http://localhost:3000'
 * });
 *
 * // Transform Confluence page URL to local URL
 * const localUrl = transformer.toLocalUrl('https://mycompany.atlassian.net/wiki/pages/123456/Page+Title');
 * // Returns: 'http://localhost:3000/?pageId=123456'
 *
 * // Check if URL should be transformed
 * if (transformer.shouldTransform('https://mycompany.atlassian.net/wiki/pages/123456')) {
 *   // URL points to a Confluence page
 * }
 * ```
 */
export class UrlTransformer {
  private readonly confluenceBaseUrl: string;
  private readonly localBaseUrl: string;

  /**
   * Create a URL transformer
   *
   * @param options - Configuration options
   * @param options.confluenceBaseUrl - Base URL of the Confluence instance (e.g., https://your-domain.atlassian.net)
   * @param options.localBaseUrl - Base URL of the local viewer application (e.g., http://localhost:3000)
   */
  constructor(options: { confluenceBaseUrl: string; localBaseUrl: string }) {
    this.confluenceBaseUrl = options.confluenceBaseUrl.replace(/\/$/, "");
    this.localBaseUrl = options.localBaseUrl.replace(/\/$/, "");
  }

  /**
   * Check if a URL should be transformed to a local viewer URL
   *
   * Returns true if:
   * 1. The URL points to the configured Confluence instance
   * 2. A page ID can be extracted from the URL
   *
   * @param url - URL to check
   * @returns true if URL should be transformed
   */
  shouldTransform(url: string): boolean {
    try {
      // Check if URL starts with the Confluence base URL
      if (!url.startsWith(this.confluenceBaseUrl)) {
        return false;
      }

      // Check if we can extract a page ID
      const pageId = ConfluenceClient.extractPageIdFromUrl(url);
      return pageId !== null;
    } catch {
      return false;
    }
  }

  /**
   * Transform a Confluence URL to a local viewer URL
   *
   * Extracts the page ID from the Confluence URL and creates a local URL
   * with the page ID as a query parameter.
   *
   * @param confluenceUrl - Confluence page URL to transform
   * @returns Local viewer URL with pageId query parameter, or original URL if transformation fails
   */
  toLocalUrl(confluenceUrl: string): string {
    if (!this.shouldTransform(confluenceUrl)) {
      return confluenceUrl;
    }

    const pageId = ConfluenceClient.extractPageIdFromUrl(confluenceUrl);
    if (!pageId) {
      return confluenceUrl;
    }

    return `${this.localBaseUrl}/?pageId=${pageId}`;
  }

  /**
   * Batch transform multiple URLs
   *
   * @param urls - Array of URLs to transform
   * @returns Array of transformed URLs (same order as input)
   */
  toLocalUrls(urls: string[]): string[] {
    return urls.map((url) => this.toLocalUrl(url));
  }

  /**
   * Get the original Confluence URL from a local viewer URL
   *
   * This is useful for "View in Confluence" links that should always
   * point to the original Confluence instance.
   *
   * Note: This method cannot reconstruct the full original URL (with space and title)
   * because that information is not preserved in the local URL format.
   * It returns a basic /pages/{pageId} format URL.
   *
   * @param localUrl - Local viewer URL
   * @returns Confluence URL, or original URL if not a local viewer URL
   */
  toConfluenceUrl(localUrl: string): string {
    try {
      const url = new URL(localUrl);
      const pageId = url.searchParams.get("pageId");

      if (!pageId) {
        return localUrl;
      }

      // Return basic Confluence URL format
      return `${this.confluenceBaseUrl}/wiki/pages/${pageId}`;
    } catch {
      return localUrl;
    }
  }
}
