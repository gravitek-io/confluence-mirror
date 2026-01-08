import type { AuthStrategy } from "./auth-strategies";
import { BasicAuthStrategy, OAuth2Strategy } from "./auth-strategies";

export interface ConfluencePage {
  id: string;
  title: string;
  body: {
    atlas_doc_format?: {
      value: string;
    };
    storage?: {
      value: string;
      representation: string;
    };
  };
  version: {
    number: number;
    when?: string;
    by?: {
      displayName: string;
      email?: string;
    };
  };
  space: {
    key: string;
    name: string;
  };
  _links: {
    webui: string;
  };
  children?: {
    page?: {
      results: ConfluenceChildPage[];
      size: number;
    };
  };
}

export interface ConfluenceChildPage {
  id: string;
  title: string;
  type: string;
  status: string;
  _links: {
    webui: string;
  };
}

export class ConfluenceApiError extends Error {
  public statusCode?: number;

  constructor(message: string, statusCode?: number) {
    super(message);
    this.name = "ConfluenceApiError";
    this.statusCode = statusCode;
  }
}

/**
 * Confluence API client supporting both Basic Auth and OAuth2 authentication
 */
export class ConfluenceClient {
  private readonly baseUrl: string | null; // For Basic Auth only
  private readonly authStrategy: AuthStrategy;

  /**
   * Create a ConfluenceClient with a specific authentication strategy
   * @param authStrategy - Authentication strategy (BasicAuthStrategy or OAuth2Strategy)
   * @param baseUrl - Base URL for Confluence instance (required only for Basic Auth)
   */
  constructor(authStrategy: AuthStrategy, baseUrl?: string) {
    this.authStrategy = authStrategy;
    this.baseUrl = baseUrl ? baseUrl.replace(/\/$/, "") : null;
  }

  /**
   * Factory method for Basic Authentication (backward compatibility)
   * @param baseUrl - Confluence instance URL (e.g., https://your-domain.atlassian.net)
   * @param email - User email
   * @param apiKey - API key
   * @returns ConfluenceClient instance
   */
  static createWithBasicAuth(
    baseUrl: string,
    email: string,
    apiKey: string
  ): ConfluenceClient {
    return new ConfluenceClient(new BasicAuthStrategy(email, apiKey), baseUrl);
  }

  /**
   * Factory method for OAuth2 authentication with service accounts
   * @param clientId - OAuth2 Client ID
   * @param clientSecret - OAuth2 Client Secret
   * @returns ConfluenceClient instance
   */
  static createWithOAuth2(
    clientId: string,
    clientSecret: string
  ): ConfluenceClient {
    return new ConfluenceClient(new OAuth2Strategy(clientId, clientSecret));
  }

  /**
   * Construct the full API URL based on authentication strategy
   * - Basic Auth: https://{domain}.atlassian.net/wiki/rest/api/{endpoint} (API v1)
   * - OAuth2: https://api.atlassian.com/ex/confluence/{cloudId}/wiki/api/v2/{endpoint} (API v2)
   */
  private async getApiUrl(endpoint: string): Promise<string> {
    // OAuth2: Use api.atlassian.com with cloudId and API v2
    if (this.authStrategy instanceof OAuth2Strategy) {
      const cloudId = await this.authStrategy.getCloudId();
      return `https://api.atlassian.com/ex/confluence/${cloudId}/wiki/api/v2/${endpoint}`;
    }

    // Basic Auth: Use direct instance URL with API v1
    if (!this.baseUrl) {
      throw new Error("Base URL is required for Basic Authentication");
    }
    return `${this.baseUrl}/wiki/rest/api/${endpoint}`;
  }

  /**
   * Make an authenticated request to the Confluence API
   * Handles token refresh on 401 errors for OAuth2
   */
  private async makeRequest<T>(endpoint: string, retryCount = 0): Promise<T> {
    const url = await this.getApiUrl(endpoint);

    const authHeaders = await this.authStrategy.getAuthHeaders();

    const response = await fetch(url, {
      headers: {
        ...authHeaders,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data for confluence pages
    });

    // Handle 401 errors with token refresh for OAuth2 (max 1 retry to avoid infinite loops)
    if (response.status === 401 && this.authStrategy.refreshAuth && retryCount === 0) {
      await this.authStrategy.refreshAuth();
      // Retry request with new token (only once)
      return this.makeRequest<T>(endpoint, retryCount + 1);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ConfluenceApiError(
        `Confluence API Error: ${response.status} - ${errorBody}`,
        response.status
      );
    }

    const data = await response.json();
    return data;
  }

  async getPage(
    pageId: string,
    includeChildren: boolean = false
  ): Promise<ConfluencePage> {
    // OAuth2 uses API v2, Basic Auth uses API v1
    if (this.authStrategy instanceof OAuth2Strategy) {
      // API v2 endpoint: /pages/{id}
      // Note: v2 only accepts ONE body-format at a time
      // Priority: atlas_doc_format (preferred for rendering)
      const params = new URLSearchParams({
        "body-format": "atlas_doc_format",
      });

      if (includeChildren) {
        params.append("include-children", "true");
      }

      const pageData = await this.makeRequest<any>(
        `pages/${pageId}?${params.toString()}`
      );

      // If atlas_doc_format is not available, fetch storage format as fallback
      if (!pageData.body?.atlas_doc_format) {
        const storageParams = new URLSearchParams({
          "body-format": "storage",
        });
        const storagePage = await this.makeRequest<any>(
          `pages/${pageId}?${storageParams.toString()}`
        );
        // Merge storage body into the page
        if (storagePage.body?.storage) {
          pageData.body = pageData.body || {};
          pageData.body.storage = storagePage.body.storage;
        }
      }

      // API v2 doesn't return space object, only spaceId
      // Fetch space details if spaceId is available
      if (pageData.spaceId && !pageData.space) {
        try {
          const spaceData = await this.makeRequest<any>(`spaces/${pageData.spaceId}`);
          pageData.space = {
            key: spaceData.key,
            name: spaceData.name,
          };
        } catch (error) {
          // Fallback: create minimal space object
          pageData.space = {
            key: pageData.spaceId,
            name: pageData.spaceId,
          };
        }
      }

      // Map v2 response to v1 structure expected by the app
      const page: ConfluencePage = {
        id: pageData.id,
        title: pageData.title,
        body: pageData.body,
        version: pageData.version || { number: 1 },
        space: pageData.space || { key: '', name: '' },
        _links: pageData._links || { webui: '' },
        children: pageData.children,
      };

      return page;
    } else {
      // API v1 endpoint: /content/{id}
      const expandParams = [
        "body.storage",
        "body.atlas_doc_format",
        "version",
        "space",
        "history.lastUpdated",
      ];

      if (includeChildren) {
        expandParams.push("children.page");
      }

      return this.makeRequest<ConfluencePage>(
        `content/${pageId}?expand=${expandParams.join(",")}`
      );
    }
  }

  async getChildPages(pageId: string): Promise<ConfluenceChildPage[]> {
    // OAuth2 uses API v2, Basic Auth uses API v1
    if (this.authStrategy instanceof OAuth2Strategy) {
      // API v2 endpoint: /pages/{id}/children
      const response = await this.makeRequest<{
        results: any[];
        _links?: {
          base?: string;
        };
      }>(`pages/${pageId}/children`);

      // Map v2 response format to match v1 format expected by the app
      // Note: v2 child pages don't have _links, we need to construct webui URL manually
      const baseUrl = response._links?.base || 'https://confluence.atlassian.net/wiki';

      return response.results.map((page) => ({
        id: page.id,
        title: page.title,
        type: page.type || "page",
        status: page.status || "current",
        _links: {
          // Construct webui URL from base URL and page ID
          // Format: /wiki/spaces/{spaceKey}/pages/{pageId}/{pageTitle}
          // Since we don't have spaceKey, use simpler format: /wiki/pages/{pageId}
          webui: `${baseUrl}/pages/${page.id}`,
        },
      }));
    } else {
      // API v1 endpoint: /content/{id}/child/page
      const response = await this.makeRequest<{
        results: ConfluenceChildPage[];
      }>(`content/${pageId}/child/page?expand=version,space`);

      return response.results;
    }
  }

  async getCurrentUser(): Promise<any> {
    // OAuth2 uses API v2, Basic Auth uses API v1
    if (this.authStrategy instanceof OAuth2Strategy) {
      // API v2 doesn't have a direct "current user" endpoint
      // We'll need to use the user endpoint with proper auth context
      return this.makeRequest<any>("user");
    } else {
      // API v1 endpoint
      return this.makeRequest<any>("user/current");
    }
  }

  /**
   * Extract page ID from Confluence URL
   * Supports formats like:
   * - https://your-domain.atlassian.net/wiki/spaces/SPACE/pages/123456/Page+Title
   * - https://your-domain.atlassian.net/wiki/pages/viewpage.action?pageId=123456
   * - https://your-domain.atlassian.net/wiki/spaces/SPACE/overview?homepageId=123456
   */
  static extractPageIdFromUrl(url: string): string | null {
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
}
