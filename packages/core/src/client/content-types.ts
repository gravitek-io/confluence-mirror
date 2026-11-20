/**
 * Types for the Confluence content hierarchy (folders, pages and other
 * content kinds) returned by the REST v2 read methods of `ConfluenceClient`.
 */

/**
 * Kind of a Confluence content item. Known kinds are listed for
 * autocompletion; any other string is accepted because Confluence may add
 * new kinds (reads of unsupported kinds are rejected by the client).
 */
export type ConfluenceContentType =
  | "page"
  | "folder"
  | "whiteboard"
  | "database"
  | "embed"
  | (string & {});

/** Lightweight item of a direct-children listing (no body, no space). */
export interface ConfluenceTreeItem {
  id: string;
  title: string;
  type: ConfluenceContentType;
  status: string;
  /** Position among siblings, as ordered in the Confluence page tree. */
  childPosition?: number;
}

/** Ancestor reference; ancestors are returned root first. */
export interface ConfluenceAncestor {
  id: string;
  type: ConfluenceContentType;
}

/** Metadata of a content item, without its body. */
export interface ConfluenceContentSummary {
  id: string;
  title: string;
  type: ConfluenceContentType;
  spaceId: string;
  parentId?: string;
  parentType?: ConfluenceContentType;
}

/** A Confluence folder, with its space resolved when permissions allow. */
export interface ConfluenceFolder extends ConfluenceContentSummary {
  status: string;
  /**
   * Space of the folder, or `null` when the space lookup failed (for example
   * missing permission). Never filled with the space ID, so callers can rely
   * on `space.key` for whitelist checks.
   */
  space: { key: string; name: string } | null;
  _links: { webui: string };
}

/** Result of a direct-children listing. */
export interface DirectChildrenResult {
  items: ConfluenceTreeItem[];
  /** `true` when more children exist than the requested `maxItems`. */
  truncated: boolean;
}
