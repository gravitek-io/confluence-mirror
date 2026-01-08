import type { OAuth2TokenManager } from "./oauth2-token-manager";

/**
 * Represents an accessible Atlassian Cloud resource
 * Returned by the accessible-resources endpoint
 */
export interface AccessibleResource {
  id: string;
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

/**
 * Manages automatic Cloud ID detection for Atlassian instances
 * The Cloud ID is required to construct API URLs for OAuth2 authentication
 */
export class CloudIdManager {
  private cloudId: string | null = null;
  private readonly resourcesEndpoint =
    "https://api.atlassian.com/oauth/token/accessible-resources";

  constructor(private tokenManager: OAuth2TokenManager) {}

  /**
   * Get the Cloud ID for the Confluence instance
   * Automatically detects and caches the Cloud ID on first call
   * @returns Confluence Cloud ID (UUID format)
   */
  async getCloudId(): Promise<string> {
    if (!this.cloudId) {
      await this.fetchCloudId();
    }
    return this.cloudId!;
  }

  /**
   * Fetch the Cloud ID from Atlassian's accessible-resources endpoint
   * Uses the first accessible resource (standard for service accounts)
   * @throws Error if no accessible resources are found
   */
  private async fetchCloudId(): Promise<void> {
    console.log("[CloudID] Fetching accessible resources...");
    const startTime = Date.now();

    const accessToken = await this.tokenManager.getAccessToken();

    const response = await fetch(this.resourcesEndpoint, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const elapsed = Date.now() - startTime;

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`[CloudID] Failed to fetch resources after ${elapsed}ms:`, response.status);
      throw new Error(
        `Failed to fetch accessible resources: ${response.status} - ${errorBody}`
      );
    }

    const resources: AccessibleResource[] = await response.json();
    console.log(`[CloudID] Resources received in ${elapsed}ms, count: ${resources.length}`);

    if (resources.length === 0) {
      console.error("[CloudID] No accessible resources found!");
      throw new Error(
        "No accessible Confluence sites found for this service account. " +
          "Please verify that the service account has proper permissions."
      );
    }

    // Use the first accessible resource (typically there's only one for service accounts)
    this.cloudId = resources[0].id;
    console.log(`[CloudID] Using Cloud ID: ${this.cloudId}`);
    console.log(`[CloudID] Site: ${resources[0].name} (${resources[0].url})`);
    console.log(`[CloudID] Scopes: ${resources[0].scopes.join(", ")}`);
  }
}
