import { OAuth2TokenManager } from "./oauth2-token-manager";
import { CloudIdManager } from "./cloud-id-manager";

/**
 * Base interface for authentication strategies
 * Supports both Basic Authentication and OAuth2
 */
export interface AuthStrategy {
  /**
   * Get authentication headers for API requests
   * @returns Headers object with Authorization header
   */
  getAuthHeaders(): Promise<Record<string, string>>;

  /**
   * Optional method to force authentication refresh
   * Used for token expiration handling
   */
  refreshAuth?(): Promise<void>;
}

/**
 * Basic Authentication strategy using email and API key
 * Uses HTTP Basic Auth with Base64 encoding
 */
export class BasicAuthStrategy implements AuthStrategy {
  constructor(
    private email: string,
    private apiKey: string
  ) {}

  async getAuthHeaders(): Promise<Record<string, string>> {
    const credentials = Buffer.from(
      `${this.email}:${this.apiKey}`
    ).toString("base64");
    return {
      Authorization: `Basic ${credentials}`,
    };
  }
}

/**
 * Global cache for OAuth2 token managers
 * Keyed by clientId to ensure tokens are shared across instances
 */
const tokenManagerCache = new Map<string, OAuth2TokenManager>();

/**
 * Global cache for Cloud ID managers
 * Keyed by clientId to ensure Cloud IDs are shared across instances
 */
const cloudIdManagerCache = new Map<string, CloudIdManager>();

/**
 * OAuth2 authentication strategy for Atlassian service accounts
 * Implements Client Credentials Flow (2LO) with automatic token refresh
 * and Cloud ID detection
 *
 * IMPORTANT: Uses singleton pattern to share tokens across all instances
 * with the same clientId. This prevents 401 loops in Next.js Server Components.
 */
export class OAuth2Strategy implements AuthStrategy {
  private tokenManager: OAuth2TokenManager;
  private cloudIdManager: CloudIdManager;

  constructor(clientId: string, clientSecret: string) {
    // Reuse existing token manager for this clientId if available
    if (!tokenManagerCache.has(clientId)) {
      tokenManagerCache.set(clientId, new OAuth2TokenManager(clientId, clientSecret));
    }
    this.tokenManager = tokenManagerCache.get(clientId)!;

    // Reuse existing Cloud ID manager for this clientId if available
    if (!cloudIdManagerCache.has(clientId)) {
      cloudIdManagerCache.set(clientId, new CloudIdManager(this.tokenManager));
    }
    this.cloudIdManager = cloudIdManagerCache.get(clientId)!;
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.tokenManager.getAccessToken();
    return {
      Authorization: `Bearer ${accessToken}`,
    };
  }

  /**
   * Get the Cloud ID for constructing OAuth2 API URLs
   * @returns Confluence Cloud ID
   */
  async getCloudId(): Promise<string> {
    return this.cloudIdManager.getCloudId();
  }

  /**
   * Force token refresh (called on 401 errors)
   */
  async refreshAuth(): Promise<void> {
    await this.tokenManager.refreshToken();
  }
}
