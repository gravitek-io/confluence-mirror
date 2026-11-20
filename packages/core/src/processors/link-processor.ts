import type { ADFNode } from "../types";
import type { ConfluenceClient } from "../client/confluence-client";
import { extractContentFromUrl } from "../utils/url-parser";

/**
 * Link enrichment result containing metadata about a Confluence page or folder link
 */
export interface EnrichedLinkData {
  /**
   * ID of the linked content. The name is kept for backward compatibility:
   * it holds a folder ID when `contentType` is "folder".
   */
  pageId: string;
  /** Kind of content the link points to */
  contentType: "page" | "folder";
  title: string;
  originalUrl: string;
}

/**
 * Options for link processing
 */
export interface LinkProcessorOptions {
  confluenceClient: ConfluenceClient;
  confluenceBaseUrl: string;
}

/**
 * Process ADF to enrich Confluence page and folder links with titles
 *
 * This processor:
 * 1. Recursively traverses the ADF tree
 * 2. Finds all links (marks and inlineCard nodes) pointing to Confluence pages
 * 3. Extracts content type and ID (page or folder) from URLs
 * 4. Fetches titles from Confluence API (pages via getPage, folders via getContentSummary)
 * 5. Enriches link nodes with page metadata
 *
 * @param adf - The ADF document to process
 * @param options - Link processor options (client and base URL)
 * @returns Processed ADF with enriched link data and map of enriched links
 */
export async function processADFWithLinks(
  adf: ADFNode,
  options: LinkProcessorOptions
): Promise<{ adf: ADFNode; enrichedLinks: Map<string, EnrichedLinkData> }> {
  const enrichedLinks = new Map<string, EnrichedLinkData>();
  const { confluenceClient, confluenceBaseUrl } = options;

  // Extract all Confluence page URLs from the ADF
  const confluenceUrls = extractConfluenceUrls(adf, confluenceBaseUrl);

  // Fetch page titles for all unique page IDs
  const pageTitles = await fetchPageTitles(confluenceUrls, confluenceClient);

  // Store enriched link data
  pageTitles.forEach((data) => {
    enrichedLinks.set(data.originalUrl, data);
  });

  // Clone and enrich the ADF tree
  const enrichedAdf = enrichAdfWithLinkData(adf, enrichedLinks);

  return { adf: enrichedAdf, enrichedLinks };
}

/**
 * Extract all Confluence page URLs from the ADF tree
 *
 * @param node - Current ADF node to process
 * @param confluenceBaseUrl - Base URL to match against
 * @param urls - Set to accumulate found URLs
 * @returns Set of unique Confluence page URLs
 */
function extractConfluenceUrls(
  node: ADFNode,
  confluenceBaseUrl: string,
  urls: Set<string> = new Set()
): Set<string> {
  // Check for inline card nodes
  if (node.type === "inlineCard" && node.attrs?.url) {
    const url = node.attrs.url;
    if (isConfluenceUrl(url, confluenceBaseUrl)) {
      urls.add(url);
    }
  }

  // Check for link marks in text nodes
  if (node.marks && Array.isArray(node.marks)) {
    for (const mark of node.marks) {
      if (mark.type === "link" && mark.attrs?.href) {
        const href = mark.attrs.href;
        if (isConfluenceUrl(href, confluenceBaseUrl)) {
          urls.add(href);
        }
      }
    }
  }

  // Recursively process child nodes
  if (node.content && Array.isArray(node.content)) {
    for (const child of node.content) {
      extractConfluenceUrls(child, confluenceBaseUrl, urls);
    }
  }

  return urls;
}

/**
 * Check if a URL points to a Confluence page
 *
 * @param url - URL to check
 * @param confluenceBaseUrl - Base URL to match against
 * @returns true if URL is a Confluence page URL
 */
function isConfluenceUrl(url: string, confluenceBaseUrl: string): boolean {
  try {
    // Normalize base URL for comparison (remove trailing slash)
    const normalizedBase = confluenceBaseUrl.replace(/\/$/, "");

    // Check if URL starts with the base URL
    if (!url.startsWith(normalizedBase)) {
      return false;
    }

    // Check if we can extract a page or folder reference
    return extractContentFromUrl(url) !== null;
  } catch {
    return false;
  }
}

/**
 * Fetch titles for a set of Confluence page and folder URLs
 *
 * @param urls - Set of Confluence page or folder URLs
 * @param client - Confluence API client
 * @returns Array of enriched link data
 */
async function fetchPageTitles(
  urls: Set<string>,
  client: ConfluenceClient
): Promise<EnrichedLinkData[]> {
  const results: EnrichedLinkData[] = [];

  // Group URLs by content (type + ID) to avoid duplicate API calls
  const contentMap = new Map<
    string,
    { type: "page" | "folder"; id: string; urls: string[] }
  >();
  for (const url of urls) {
    const ref = extractContentFromUrl(url);
    if (!ref) continue;
    const key = `${ref.type}:${ref.id}`;
    const entry = contentMap.get(key);
    if (entry) {
      entry.urls.push(url);
    } else {
      contentMap.set(key, { ...ref, urls: [url] });
    }
  }

  // Fetch the title of each unique content item
  await Promise.all(
    Array.from(contentMap.values()).map(async ({ type, id, urls: contentUrls }) => {
      try {
        // Pages keep their historical lookup; folders use the lightweight summary
        const title =
          type === "page"
            ? (await client.getPage(id, false)).title
            : (await client.getContentSummary("folder", id)).title;

        // Add enriched data for all URLs pointing to this content
        for (const url of contentUrls) {
          results.push({ pageId: id, contentType: type, title, originalUrl: url });
        }
      } catch (error) {
        // If we can't fetch the content, skip enrichment for these URLs
        console.warn(`Failed to fetch ${type} ${id}:`, error);
      }
    })
  );

  return results;
}

/**
 * Recursively enrich ADF tree with link metadata
 *
 * @param node - Current ADF node
 * @param enrichedLinks - Map of enriched link data
 * @returns Cloned and enriched ADF node
 */
function enrichAdfWithLinkData(
  node: ADFNode,
  enrichedLinks: Map<string, EnrichedLinkData>
): ADFNode {
  // Clone the node to avoid mutations
  const clonedNode: ADFNode = { ...node };

  // Enrich inline card nodes
  if (clonedNode.type === "inlineCard" && clonedNode.attrs?.url) {
    const enrichedData = enrichedLinks.get(clonedNode.attrs.url);
    if (enrichedData) {
      clonedNode.attrs = {
        ...clonedNode.attrs,
        title: enrichedData.title,
        pageId: enrichedData.pageId,
        contentType: enrichedData.contentType,
      };
    }
  }

  // Enrich link marks
  if (clonedNode.marks && Array.isArray(clonedNode.marks)) {
    clonedNode.marks = clonedNode.marks.map((mark) => {
      if (mark.type === "link" && mark.attrs?.href) {
        const enrichedData = enrichedLinks.get(mark.attrs.href);
        if (enrichedData) {
          return {
            ...mark,
            attrs: {
              ...mark.attrs,
              title: enrichedData.title,
              pageId: enrichedData.pageId,
              contentType: enrichedData.contentType,
            },
          };
        }
      }
      return mark;
    });
  }

  // Recursively process child nodes
  if (clonedNode.content && Array.isArray(clonedNode.content)) {
    clonedNode.content = clonedNode.content.map((child) =>
      enrichAdfWithLinkData(child, enrichedLinks)
    );
  }

  return clonedNode;
}
