import { ADFDocument, ADFNode } from "../types";

interface MediaMapping {
  url: string;
  type: "image" | "video" | "file" | "unknown";
  fileName?: string;
}

// Helper function to determine if a filename is an image or video
function isImageFile(filename: string): boolean {
  const imageExtensions = [
    ".jpg",
    ".jpeg",
    ".png",
    ".gif",
    ".webp",
    ".bmp",
    ".svg",
  ];
  return imageExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

function isVideoFile(filename: string): boolean {
  const videoExtensions = [
    ".mp4",
    ".webm",
    ".ogg",
    ".mov",
    ".avi",
    ".mkv",
    ".flv",
  ];
  return videoExtensions.some((ext) => filename.toLowerCase().endsWith(ext));
}

// Extract media mappings from Storage HTML (server-side version)
function extractMediaMappings(
  storageHtml: string,
  pageId: string
): Record<string, MediaMapping> {
  const mediaMap: Record<string, MediaMapping> = {};
  const baseUrl = process.env.CONFLUENCE_BASE_URL;

  if (!baseUrl) {
    console.error("CONFLUENCE_BASE_URL not configured");
    return mediaMap;
  }

  // Pattern for extracting ALL attachments from Storage format
  const attachmentRegex = /<ri:attachment ri:filename="([^"]*)"[^>]*\/?>/gi;

  let match;
  let imageIndex = 0;
  let videoIndex = 0;
  let otherIndex = 0;
  const processedFiles = new Set<string>();

  // Extract all attachments and categorize them by file extension
  while ((match = attachmentRegex.exec(storageHtml)) !== null) {
    const filename = match[1];
    if (processedFiles.has(filename)) continue;
    processedFiles.add(filename);

    const fileUrl = `${baseUrl}/wiki/download/attachments/${pageId}/${encodeURIComponent(
      filename
    )}`;

    // Create mapping with type information
    let mediaType: "image" | "video" | "file" | "unknown" = "unknown";
    let indexKey: string;

    if (isImageFile(filename)) {
      mediaType = "image";
      indexKey = `image-${imageIndex}`;
      imageIndex++;
    } else if (isVideoFile(filename)) {
      mediaType = "video";
      indexKey = `video-${videoIndex}`;
      videoIndex++;
    } else {
      mediaType = "file";
      indexKey = `attachment-${otherIndex}`;
      otherIndex++;
    }

    const mediaMapping: MediaMapping = {
      url: fileUrl,
      type: mediaType,
      fileName: filename,
    };

    // Store with multiple keys for easy lookup
    mediaMap[indexKey] = mediaMapping;
    mediaMap[filename] = mediaMapping;

    // console.log(`Mapped ${mediaType} ${indexKey}: ${filename} -> ${fileUrl}`);
  }

  return mediaMap;
}

// Process ADF document to enrich media nodes with URLs and types
function enrichMediaNodes(
  node: ADFNode | ADFDocument,
  mediaMappings: Record<string, MediaMapping>,
  mediaCounter: { count: number }
): ADFNode | ADFDocument {
  if (!node) return node;

  // Handle media nodes
  if (node.type === "media" && node.attrs?.type === "file" && node.attrs?.id) {
    const mediaId = node.attrs.id;

    // Special handling for showroom page demo image
    if (mediaId === "placeholder-image") {
      const enrichedNode = {
        ...node,
        attrs: {
          ...node.attrs,
          // Add our processed data with Unsplash demo image
          processedUrl:
            "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
          processedType: "image",
        },
      };
      mediaCounter.count++;
      return enrichedNode;
    }

    // Try to find media mapping using various strategies
    const possibleKeys = [
      mediaId,
      // Try sequential mapping based on media element order
      `image-${mediaCounter.count}`,
      `video-${mediaCounter.count}`,
      `attachment-${mediaCounter.count}`,
      // Try filename matches
      ...Object.keys(mediaMappings).filter(
        (key) =>
          !key.startsWith("image-") &&
          !key.startsWith("video-") &&
          !key.startsWith("attachment-")
      ),
      // Try all indexed keys as fallback
      ...Object.keys(mediaMappings)
        .filter(
          (key) =>
            key.startsWith("image-") ||
            key.startsWith("video-") ||
            key.startsWith("attachment-")
        )
        .sort(),
    ];

    let foundMapping: MediaMapping | null = null;
    for (const key of possibleKeys) {
      if (mediaMappings[key]) {
        foundMapping = mediaMappings[key];
        // console.log(`Media element ${mediaCounter.count}: Found mapping for ${mediaId} via key "${key}"`);
        break;
      }
    }

    // Enrich the node with URL and type
    if (foundMapping) {
      const enrichedNode = {
        ...node,
        attrs: {
          ...node.attrs,
          // Add our processed data
          processedUrl: foundMapping.url,
          processedType: foundMapping.type,
          processedFileName: foundMapping.fileName,
        },
      };
      mediaCounter.count++;
      return enrichedNode;
    }

    mediaCounter.count++;
  }

  // Recursively process content
  if (node.content) {
    return {
      ...node,
      content: node.content.map(
        (child) =>
          enrichMediaNodes(child, mediaMappings, mediaCounter) as ADFNode
      ),
    };
  }

  return node;
}

// Main function to process ADF document with media enrichment
export async function processADFWithMedia(
  adfDocument: ADFDocument,
  storageHtml: string,
  pageId: string
): Promise<ADFDocument> {
  // Extract media mappings from Storage HTML
  const mediaMappings = extractMediaMappings(storageHtml, pageId);

  // Enrich ADF document with media URLs
  const mediaCounter = { count: 0 };
  const enrichedDocument = enrichMediaNodes(
    adfDocument,
    mediaMappings,
    mediaCounter
  ) as ADFDocument;

  // console.log(`Processed ${mediaCounter.count} media elements for page ${pageId}`);

  return enrichedDocument;
}
