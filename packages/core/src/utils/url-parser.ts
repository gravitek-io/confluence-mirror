/**
 * Pure URL parsing helpers for Confluence content (pages and folders).
 * Kept free of any client or network dependency so they can be reused anywhere.
 */

/** Reference to a piece of Confluence content identified from a URL. */
export type ConfluenceContentRef = { type: "page" | "folder"; id: string };

/**
 * Extract a page ID from a Confluence URL.
 * Supports formats like:
 * - https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title
 * - https://your-domain.atlassian.net/wiki/pages/viewpage.action?pageId=123456
 * - https://your-domain.atlassian.net/wiki/spaces/SPACE/overview?homepageId=123456
 *
 * @param url - Confluence URL
 * @returns The page ID, or null when none can be found
 */
export function extractPageIdFromUrl(url: string): string | null {
  // Pattern 1: /pages/123456/title format
  const match1 = url.match(/\/pages\/(\d+)(?:\/|$)/);
  if (match1) {
    return match1[1];
  }

  // Pattern 2: pageId=123456 query parameter
  const match2 = url.match(/[?&]pageId=(\d+)/);
  if (match2) {
    return match2[1];
  }

  // Pattern 3: homepageId=123456 query parameter (space overview pages)
  const match3 = url.match(/[?&]homepageId=(\d+)/);
  if (match3) {
    return match3[1];
  }

  return null;
}

/**
 * Extract a folder ID from a Confluence URL such as
 * https://your-domain.atlassian.net/wiki/spaces/SPACE/folder/123456/Title.
 * The ID must be followed by a separator or the end of the URL, so a
 * "/folder/" fragment inside a page title is not mistaken for a folder.
 *
 * @param url - Confluence URL
 * @returns The folder ID, or null when none can be found
 */
export function extractFolderIdFromUrl(url: string): string | null {
  const match = url.match(/\/folder\/(\d+)(?:[/?#]|$)/);
  return match ? match[1] : null;
}

/**
 * Identify the content a Confluence URL points to.
 * Folders are checked first, then pages.
 *
 * @param url - Confluence URL
 * @returns A typed content reference, or null when the URL has no content ID
 */
export function extractContentFromUrl(url: string): ConfluenceContentRef | null {
  const folderId = extractFolderIdFromUrl(url);
  if (folderId) {
    return { type: "folder", id: folderId };
  }
  const pageId = extractPageIdFromUrl(url);
  if (pageId) {
    return { type: "page", id: pageId };
  }
  return null;
}
