import type { ADFNode } from "../types";
import { ConfluenceClient } from "../client/confluence-client";

/**
 * Link enrichment result containing metadata about a Confluence page link
 */
export interface EnrichedLinkData {
  pageId: string;
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
 * Process ADF to enrich Confluence page links with page titles
 *
 * This processor:
 * 1. Recursively traverses the ADF tree
 * 2. Finds all links (marks and inlineCard nodes) pointing to Confluence pages
 * 3. Extracts page IDs from URLs
 * 4. Fetches page titles from Confluence API
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

    // Check if we can extract a page ID
    const pageId = ConfluenceClient.extractPageIdFromUrl(url);
    return pageId !== null;
  } catch {
    return false;
  }
}

/**
 * Fetch page titles for a set of Confluence URLs
 *
 * @param urls - Set of Confluence page URLs
 * @param client - Confluence API client
 * @returns Array of enriched link data
 */
async function fetchPageTitles(
  urls: Set<string>,
  client: ConfluenceClient
): Promise<EnrichedLinkData[]> {
  const results: EnrichedLinkData[] = [];

  // Group URLs by page ID to avoid duplicate API calls
  const pageIdMap = new Map<string, string[]>();
  for (const url of urls) {
    const pageId = ConfluenceClient.extractPageIdFromUrl(url);
    if (pageId) {
      if (!pageIdMap.has(pageId)) {
        pageIdMap.set(pageId, []);
      }
      pageIdMap.get(pageId)!.push(url);
    }
  }

  // Fetch page data for each unique page ID
  await Promise.all(
    Array.from(pageIdMap.entries()).map(async ([pageId, pageUrls]) => {
      try {
        const page = await client.getPage(pageId, false);

        // Add enriched data for all URLs pointing to this page
        for (const url of pageUrls) {
          results.push({
            pageId,
            title: page.title,
            originalUrl: url,
          });
        }
      } catch (error) {
        // If we can't fetch the page, skip enrichment for these URLs
        console.warn(`Failed to fetch page ${pageId}:`, error);
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
