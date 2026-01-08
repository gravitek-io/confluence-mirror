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
   * - Basic Auth: https://{domain}.atlassian.net/wiki/rest/api/{endpoint}
   * - OAuth2: https://api.atlassian.com/ex/confluence/{cloudId}/rest/api/{endpoint}
   */
  private async getApiUrl(endpoint: string): Promise<string> {
    // OAuth2: Use api.atlassian.com with cloudId
    if (this.authStrategy instanceof OAuth2Strategy) {
      const cloudId = await this.authStrategy.getCloudId();
      return `https://api.atlassian.com/ex/confluence/${cloudId}/rest/api/${endpoint}`;
    }

    // Basic Auth: Use direct instance URL
    if (!this.baseUrl) {
      throw new Error("Base URL is required for Basic Authentication");
    }
    return `${this.baseUrl}/wiki/rest/api/${endpoint}`;
  }

  /**
   * Make an authenticated request to the Confluence API
   * Handles token refresh on 401 errors for OAuth2
   */
  private async makeRequest<T>(endpoint: string): Promise<T> {
    console.log(`[API] Making request to endpoint: ${endpoint}`);
    const startTime = Date.now();

    const url = await this.getApiUrl(endpoint);
    console.log(`[API] Full URL: ${url}`);

    const authHeaders = await this.authStrategy.getAuthHeaders();

    const response = await fetch(url, {
      headers: {
        ...authHeaders,
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      cache: "no-store", // Always fetch fresh data for confluence pages
    });

    const elapsed = Date.now() - startTime;
    console.log(`[API] Response received in ${elapsed}ms, status: ${response.status}`);

    // Handle 401 errors with token refresh for OAuth2
    if (response.status === 401 && this.authStrategy.refreshAuth) {
      console.log("[API] Got 401, refreshing token and retrying...");
      await this.authStrategy.refreshAuth();
      // Retry request with new token
      return this.makeRequest<T>(endpoint);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[API] Request failed: ${response.status}`);
      console.error(`[API] Error body:`, errorBody);
      throw new ConfluenceApiError(
        `Confluence API Error: ${response.status} - ${errorBody}`,
        response.status
      );
    }

    const data = await response.json();
    console.log(`[API] Request successful, total time: ${Date.now() - startTime}ms`);
    return data;
  }

  async getPage(
    pageId: string,
    includeChildren: boolean = false
  ): Promise<ConfluencePage> {
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

  async getChildPages(pageId: string): Promise<ConfluenceChildPage[]> {
    const response = await this.makeRequest<{
      results: ConfluenceChildPage[];
    }>(`content/${pageId}/child/page?expand=version,space`);

    return response.results;
  }

  async getCurrentUser(): Promise<any> {
    return this.makeRequest<any>("user/current");
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
