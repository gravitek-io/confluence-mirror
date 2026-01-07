/**
 * OAuth2 token manager for Atlassian service accounts
 * Implements Client Credentials Flow (2LO - 2-legged OAuth)
 */

/**
 * OAuth2 token response structure from Atlassian
 */
export interface OAuth2Tokens {
  accessToken: string;
  expiresAt: number;
  tokenType: string;
  scope: string;
}

/**
 * Manages OAuth2 token acquisition and refresh using Client Credentials Flow
 * Tokens are valid for 60 minutes and automatically refreshed before expiration
 */
export class OAuth2TokenManager {
  private tokens: OAuth2Tokens | null = null;
  private readonly tokenEndpoint = "https://auth.atlassian.com/oauth/token";

  constructor(
    private clientId: string,
    private clientSecret: string
  ) {}

  /**
   * Get a valid access token, refreshing if necessary
   * @returns Valid OAuth2 access token
   */
  async getAccessToken(): Promise<string> {
    if (!this.tokens || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.tokens!.accessToken;
  }

  /**
   * Refresh the OAuth2 access token using Client Credentials Flow
   * Makes a POST request to Atlassian's token endpoint with client credentials
   */
  async refreshToken(): Promise<void> {
    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(
        `OAuth2 token request failed: ${response.status} - ${errorBody}`
      );
    }

    const data = await response.json();

    this.tokens = {
      accessToken: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
      tokenType: data.token_type,
      scope: data.scope || "",
    };
  }

  /**
   * Check if the current token is expired or about to expire
   * Uses a 1-minute buffer before actual expiry to prevent edge cases
   * @returns true if token needs refresh
   */
  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    // Refresh 1 minute before expiry to prevent edge cases
    return Date.now() >= this.tokens.expiresAt - 60000;
  }
}
