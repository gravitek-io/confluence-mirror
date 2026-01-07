import { ConfluenceClient } from "confluence-mirror-core";

/**
 * Create and configure the Confluence client with automatic authentication detection
 * Supports both OAuth2 (preferred) and Basic Authentication
 *
 * Priority:
 * 1. OAuth2 if CONFLUENCE_OAUTH_CLIENT_ID and CONFLUENCE_OAUTH_CLIENT_SECRET are set
 * 2. Basic Auth if CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_KEY are set
 */
function createConfluenceClient(): ConfluenceClient {
  // Option 1: OAuth2 Authentication (preferred for service accounts)
  const oauthClientId = process.env.CONFLUENCE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.CONFLUENCE_OAUTH_CLIENT_SECRET;

  if (oauthClientId && oauthClientSecret) {
    return ConfluenceClient.createWithOAuth2(oauthClientId, oauthClientSecret);
  }

  // Option 2: Basic Authentication (fallback)
  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const apiKey = process.env.CONFLUENCE_API_KEY;

  if (baseUrl && email && apiKey) {
    return ConfluenceClient.createWithBasicAuth(baseUrl, email, apiKey);
  }

  // No valid credentials found
  throw new Error(
    "Authentication credentials required. Please provide either:\n" +
      "  - OAuth2: CONFLUENCE_OAUTH_CLIENT_ID and CONFLUENCE_OAUTH_CLIENT_SECRET\n" +
      "  - Basic Auth: CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_KEY\n\n" +
      "See demo/.env.example for configuration instructions."
  );
}

export const confluenceClient = createConfluenceClient();