# Implementation Plan: OAuth2 Authentication

## Overview

Add OAuth2 authentication support using **Client Credentials Flow (2LO)** for Atlassian service accounts. This implementation will automatically detect the Confluence Cloud ID and handle token management transparently, while maintaining full backward compatibility with existing Basic Authentication.

## Key Technical Details

- **OAuth2 Flow**: Client Credentials Grant (2-legged OAuth 2.0)
- **Token Endpoint**: `https://auth.atlassian.com/oauth/token`
- **Token Lifetime**: 60 minutes (3600 seconds)
- **API Base URL**: `https://api.atlassian.com/ex/confluence/{cloudId}/` (different from Basic Auth)
- **Cloud ID Detection**: Automatic via `https://api.atlassian.com/oauth/token/accessible-resources`
- **Required Credentials**: Client ID + Client Secret only

## Implementation Steps

### Step 1: Create Authentication Strategy Interfaces

**Location**: `packages/core/src/client/auth-strategies.ts`

Create base authentication strategy interface and implementations:

```typescript
// Base interface for authentication strategies
export interface AuthStrategy {
  getAuthHeaders(): Promise<Record<string, string>>;
  refreshAuth?(): Promise<void>;
}

// Basic Auth implementation (existing logic)
export class BasicAuthStrategy implements AuthStrategy {
  constructor(private email: string, private apiKey: string) {}

  async getAuthHeaders(): Promise<Record<string, string>> {
    const credentials = Buffer.from(`${this.email}:${this.apiKey}`).toString('base64');
    return {
      'Authorization': `Basic ${credentials}`,
    };
  }
}

// OAuth2 implementation for Client Credentials Flow (2LO)
export class OAuth2Strategy implements AuthStrategy {
  private tokenManager: OAuth2TokenManager;
  private cloudIdManager: CloudIdManager;

  constructor(
    private clientId: string,
    private clientSecret: string
  ) {
    this.tokenManager = new OAuth2TokenManager(clientId, clientSecret);
    this.cloudIdManager = new CloudIdManager(this.tokenManager);
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.tokenManager.getAccessToken();
    return {
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  async getCloudId(): Promise<string> {
    return this.cloudIdManager.getCloudId();
  }

  async refreshAuth(): Promise<void> {
    // Force token refresh
    await this.tokenManager.refreshToken();
  }
}
```

**Files to create**:
- `packages/core/src/client/auth-strategies.ts`

**Files to update**:
- `packages/core/src/index.ts` (export new types)

---

### Step 2: Update ConfluenceClient to Use Auth Strategies

**Location**: `packages/core/src/client/confluence-client.ts`

Refactor `ConfluenceClient` to support both Basic Auth (with direct URL) and OAuth2 (with Cloud ID):

```typescript
export class ConfluenceClient {
  private readonly baseUrl: string | null; // For Basic Auth
  private readonly authStrategy: AuthStrategy;

  constructor(authStrategy: AuthStrategy, baseUrl?: string) {
    this.authStrategy = authStrategy;
    this.baseUrl = baseUrl ? baseUrl.replace(/\/$/, '') : null;
  }

  private async getApiUrl(endpoint: string): Promise<string> {
    // OAuth2: Use api.atlassian.com with cloudId
    if (this.authStrategy instanceof OAuth2Strategy) {
      const cloudId = await this.authStrategy.getCloudId();
      return `https://api.atlassian.com/ex/confluence/${cloudId}/rest/api/${endpoint}`;
    }

    // Basic Auth: Use direct instance URL
    if (!this.baseUrl) {
      throw new Error('Base URL is required for Basic Authentication');
    }
    return `${this.baseUrl}/wiki/rest/api/${endpoint}`;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = await this.getApiUrl(endpoint);
    const authHeaders = await this.authStrategy.getAuthHeaders();

    const response = await fetch(url, {
      headers: {
        ...authHeaders,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    // Handle 401 errors with token refresh for OAuth2
    if (response.status === 401 && this.authStrategy.refreshAuth) {
      await this.authStrategy.refreshAuth();
      // Retry request with new token
      return this.makeRequest<T>(endpoint);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ConfluenceApiError(
        `Confluence API Error: ${response.status} - ${errorBody}`,
        response.status
      );
    }

    return response.json();
  }
}
```

**Backward Compatibility Helper**:
```typescript
// Static factory method for backward compatibility
static createWithBasicAuth(
  baseUrl: string,
  email: string,
  apiKey: string
): ConfluenceClient {
  return new ConfluenceClient(
    new BasicAuthStrategy(email, apiKey),
    baseUrl
  );
}

// Factory method for OAuth2
static createWithOAuth2(
  clientId: string,
  clientSecret: string
): ConfluenceClient {
  return new ConfluenceClient(
    new OAuth2Strategy(clientId, clientSecret)
  );
}
```

**Files to update**:
- `packages/core/src/client/confluence-client.ts`

---

### Step 3: Implement OAuth2 Token Management and Cloud ID Detection

**Location**: `packages/core/src/client/oauth2-token-manager.ts`

Create OAuth2 token manager implementing Client Credentials Flow:

```typescript
export interface OAuth2Tokens {
  accessToken: string;
  expiresAt: number;
  tokenType: string;
  scope: string;
}

export class OAuth2TokenManager {
  private tokens: OAuth2Tokens | null = null;
  private readonly tokenEndpoint = 'https://auth.atlassian.com/oauth/token';

  constructor(
    private clientId: string,
    private clientSecret: string
  ) {}

  async getAccessToken(): Promise<string> {
    if (!this.tokens || this.isTokenExpired()) {
      await this.refreshToken();
    }
    return this.tokens!.accessToken;
  }

  async refreshToken(): Promise<void> {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: this.clientId,
      client_secret: this.clientSecret,
    });

    const response = await fetch(this.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`OAuth2 token request failed: ${response.status} - ${errorBody}`);
    }

    const data = await response.json();

    this.tokens = {
      accessToken: data.access_token,
      expiresAt: Date.now() + (data.expires_in * 1000),
      tokenType: data.token_type,
      scope: data.scope || '',
    };
  }

  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    // Refresh 1 minute before expiry
    return Date.now() >= this.tokens.expiresAt - 60000;
  }
}
```

**Location**: `packages/core/src/client/cloud-id-manager.ts`

Create Cloud ID manager for automatic detection:

```typescript
export interface AccessibleResource {
  id: string;
  url: string;
  name: string;
  scopes: string[];
  avatarUrl: string;
}

export class CloudIdManager {
  private cloudId: string | null = null;
  private readonly resourcesEndpoint = 'https://api.atlassian.com/oauth/token/accessible-resources';

  constructor(private tokenManager: OAuth2TokenManager) {}

  async getCloudId(): Promise<string> {
    if (!this.cloudId) {
      await this.fetchCloudId();
    }
    return this.cloudId!;
  }

  private async fetchCloudId(): Promise<void> {
    const accessToken = await this.tokenManager.getAccessToken();

    const response = await fetch(this.resourcesEndpoint, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const errorBody = await response.text();
      throw new Error(`Failed to fetch accessible resources: ${response.status} - ${errorBody}`);
    }

    const resources: AccessibleResource[] = await response.json();

    if (resources.length === 0) {
      throw new Error('No accessible Confluence sites found for this service account');
    }

    // Use the first accessible resource (typically there's only one)
    this.cloudId = resources[0].id;
  }
}
```

**Files to create**:
- `packages/core/src/client/oauth2-token-manager.ts`
- `packages/core/src/client/cloud-id-manager.ts`

---

### Step 4: Update Core Package Exports

**Location**: `packages/core/src/index.ts`

Export new authentication types:

```typescript
export { ConfluenceClient, ConfluenceApiError } from './client/confluence-client';
export type { ConfluencePage, ConfluenceChildPage } from './client/confluence-client';
export {
  BasicAuthStrategy,
  OAuth2Strategy,
  type AuthStrategy
} from './client/auth-strategies';
```

**Files to update**:
- `packages/core/src/index.ts`

---

### Step 5: Build and Test Core Package

```bash
cd packages/core
npm run build
```

Verify:
- No TypeScript errors
- All exports work correctly
- Build output includes new files

---

### Step 6: Update Demo Environment Variables

**Location**: `demo/.env.example`

Add OAuth2 environment variables (note: Cloud ID is auto-detected):

```
# Authentication Method: Choose one

# Option 1: OAuth2 Authentication (recommended for service accounts)
# Only Client ID and Client Secret are required - Cloud ID is auto-detected
CONFLUENCE_OAUTH_CLIENT_ID=your_oauth_client_id
CONFLUENCE_OAUTH_CLIENT_SECRET=your_oauth_client_secret

# Option 2: Basic Authentication (API Key - legacy)
# CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
# CONFLUENCE_EMAIL=your.email@example.com
# CONFLUENCE_API_KEY=your_confluence_api_key
```

**Files to update**:
- `demo/.env.example`

---

### Step 7: Update Demo Configuration

**Location**: `demo/src/lib/confluence.ts`

Add authentication strategy selection logic (OAuth2 takes precedence):

```typescript
import {
  ConfluenceClient,
  BasicAuthStrategy,
  OAuth2Strategy
} from 'confluence-mirror-core';

// Determine authentication method based on environment variables
function createConfluenceClient(): ConfluenceClient {
  // Option 1: OAuth2 (preferred for service accounts)
  const oauthClientId = process.env.CONFLUENCE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.CONFLUENCE_OAUTH_CLIENT_SECRET;

  if (oauthClientId && oauthClientSecret) {
    return ConfluenceClient.createWithOAuth2(
      oauthClientId,
      oauthClientSecret
    );
  }

  // Option 2: Basic Auth (fallback)
  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const apiKey = process.env.CONFLUENCE_API_KEY;

  if (baseUrl && email && apiKey) {
    return ConfluenceClient.createWithBasicAuth(
      baseUrl,
      email,
      apiKey
    );
  }

  // No valid credentials found
  throw new Error(
    'Authentication credentials required. Please provide either:\n' +
    '  - OAuth2: CONFLUENCE_OAUTH_CLIENT_ID and CONFLUENCE_OAUTH_CLIENT_SECRET\n' +
    '  - Basic Auth: CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_KEY'
  );
}

export const confluenceClient = createConfluenceClient();
```

**Files to update**:
- `demo/src/lib/confluence.ts`

---

### Step 8: Update Documentation

**Files to update**:
- `README.md`: Add OAuth2 section to authentication documentation
- `demo/README.md`: Add OAuth2 setup instructions (including service account creation)
- `packages/core/README.md`: Document authentication strategies API
- `demo/src/app/how-to/page.tsx`: Add OAuth2 integration example

**Documentation sections to add**:
1. **How to create a service account in Atlassian**:
   - Navigate to Atlassian Administration
   - Create service account
   - Generate OAuth2 credentials (Client ID + Client Secret)
   - Assign proper Confluence permissions/scopes
2. **OAuth2 vs Basic Auth comparison**:
   - Security benefits of OAuth2
   - Token expiration and automatic refresh
   - No need for Cloud ID configuration
3. **Environment variable setup**:
   - Minimal configuration (just 2 variables)
   - Automatic Cloud ID detection
4. **Code examples**:
   - Using factory methods
   - Both authentication methods
5. **Migration guide**:
   - From Basic Auth to OAuth2
   - Breaking changes (if any)

---

### Step 9: Test Implementation

**Manual Testing**:
1. Test with Basic Auth (existing credentials)
2. Test with OAuth2 credentials
3. Test with missing credentials (proper error messages)
4. Test token refresh on expiration
5. Test error handling for invalid credentials

**Demo App Testing**:
```bash
# Test with Basic Auth
npm run dev

# Test with OAuth2 (update .env.local with OAuth2 credentials)
npm run dev
```

---

## Files Summary

### New Files
- `packages/core/src/client/auth-strategies.ts`
- `packages/core/src/client/oauth2-token-manager.ts`
- `packages/core/src/client/cloud-id-manager.ts`

### Modified Files
- `packages/core/src/client/confluence-client.ts`
- `packages/core/src/index.ts`
- `demo/.env.example`
- `demo/src/lib/confluence.ts`
- `README.md`
- `demo/README.md`
- `packages/core/README.md`
- `demo/src/app/how-to/page.tsx`

### Build Commands
```bash
# Build core package
npm run build:core

# Test demo app
npm run dev
```

## Rollback Plan

If issues arise:
1. Revert `ConfluenceClient` changes
2. Remove auth strategy files
3. Restore original demo configuration
4. Keep Basic Auth as-is

The backward compatibility factory method ensures existing code continues to work.

## Success Metrics

- [ ] Core package builds without errors
- [ ] Demo app works with Basic Auth (existing behavior)
- [ ] Demo app works with OAuth2 credentials
- [ ] Automatic token refresh works
- [ ] Clear error messages for missing credentials
- [ ] Documentation is complete and accurate
- [ ] No breaking changes to existing API

## Notes

- **OAuth2 Flow**: Client Credentials Grant (2LO) - simpler than 3LO, no user interaction required
- **Cloud ID Detection**: Fully automatic via `accessible-resources` endpoint - no manual configuration needed
- **API URLs**: OAuth2 uses `api.atlassian.com` while Basic Auth uses direct instance URLs
- **Token Management**: 60-minute tokens with automatic refresh (1-minute buffer before expiry)
- **Token Storage**: In-memory for demo app (production apps should use persistent storage)
- **Backward Compatibility**: Maintained through factory methods and fallback logic
- **Security**: All credentials in environment variables only, never exposed to client-side
- **Service Accounts**: Designed specifically for Atlassian service accounts (non-human identities)
