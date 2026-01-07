# Implementation Plan: OAuth2 Authentication

## Overview

Add OAuth2 authentication support to Confluence Mirror while maintaining backward compatibility with existing Basic Authentication.

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

// OAuth2 implementation
export class OAuth2Strategy implements AuthStrategy {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private baseUrl: string
  ) {}

  async getAuthHeaders(): Promise<Record<string, string>> {
    await this.ensureValidToken();
    return {
      'Authorization': `Bearer ${this.accessToken}`,
    };
  }

  async refreshAuth(): Promise<void> {
    // Implement OAuth2 token acquisition/refresh
  }

  private async ensureValidToken(): Promise<void> {
    // Check token validity and refresh if needed
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

Refactor `ConfluenceClient` to accept and use authentication strategies:

```typescript
export class ConfluenceClient {
  private readonly baseUrl: string;
  private readonly authStrategy: AuthStrategy;

  constructor(baseUrl: string, authStrategy: AuthStrategy) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.authStrategy = authStrategy;
  }

  private async makeRequest<T>(endpoint: string): Promise<T> {
    const url = `${this.baseUrl}/wiki/rest/api/${endpoint}`;
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

    // ... rest of error handling
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
    baseUrl,
    new BasicAuthStrategy(email, apiKey)
  );
}
```

**Files to update**:
- `packages/core/src/client/confluence-client.ts`

---

### Step 3: Implement OAuth2 Token Management

**Location**: `packages/core/src/client/oauth2-token-manager.ts`

Create OAuth2 token manager for Atlassian API:

```typescript
export interface OAuth2Tokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

export class OAuth2TokenManager {
  private tokens: OAuth2Tokens | null = null;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private baseUrl: string
  ) {}

  async getAccessToken(): Promise<string> {
    if (!this.tokens || this.isTokenExpired()) {
      await this.refreshTokens();
    }
    return this.tokens!.accessToken;
  }

  private isTokenExpired(): boolean {
    if (!this.tokens) return true;
    return Date.now() >= this.tokens.expiresAt - 60000; // 1 minute buffer
  }

  private async refreshTokens(): Promise<void> {
    // Implement OAuth2 Client Credentials flow
    // POST to https://auth.atlassian.com/oauth/token
  }
}
```

**Files to create**:
- `packages/core/src/client/oauth2-token-manager.ts`

---

### Step 4: Update OAuth2Strategy with Token Manager

**Location**: `packages/core/src/client/auth-strategies.ts`

Integrate token manager into OAuth2Strategy:

```typescript
export class OAuth2Strategy implements AuthStrategy {
  private tokenManager: OAuth2TokenManager;

  constructor(clientId: string, clientSecret: string, baseUrl: string) {
    this.tokenManager = new OAuth2TokenManager(clientId, clientSecret, baseUrl);
  }

  async getAuthHeaders(): Promise<Record<string, string>> {
    const accessToken = await this.tokenManager.getAccessToken();
    return {
      'Authorization': `Bearer ${accessToken}`,
    };
  }

  async refreshAuth(): Promise<void> {
    // Force token refresh
    await this.tokenManager.getAccessToken();
  }
}
```

---

### Step 5: Update Core Package Exports

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

### Step 6: Build and Test Core Package

```bash
cd packages/core
npm run build
```

Verify:
- No TypeScript errors
- All exports work correctly
- Build output includes new files

---

### Step 7: Update Demo Environment Variables

**Location**: `demo/.env.example`

Add OAuth2 environment variables:

```
# Authentication Method: Choose one
# Option 1: Basic Authentication (API Key)
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_EMAIL=your.email@example.com
CONFLUENCE_API_KEY=your_confluence_api_key

# Option 2: OAuth2 Authentication (recommended for production)
# CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
# CONFLUENCE_OAUTH_CLIENT_ID=your_oauth_client_id
# CONFLUENCE_OAUTH_CLIENT_SECRET=your_oauth_client_secret
```

**Files to update**:
- `demo/.env.example`

---

### Step 8: Update Demo Configuration

**Location**: `demo/src/lib/confluence.ts`

Add authentication strategy selection logic:

```typescript
import {
  ConfluenceClient,
  BasicAuthStrategy,
  OAuth2Strategy
} from 'confluence-mirror-core';

// Determine authentication method based on environment variables
function createConfluenceClient(): ConfluenceClient {
  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  if (!baseUrl) {
    throw new Error('CONFLUENCE_BASE_URL is required');
  }

  // Prefer OAuth2 if credentials are provided
  const oauthClientId = process.env.CONFLUENCE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.CONFLUENCE_OAUTH_CLIENT_SECRET;

  if (oauthClientId && oauthClientSecret) {
    const authStrategy = new OAuth2Strategy(
      oauthClientId,
      oauthClientSecret,
      baseUrl
    );
    return new ConfluenceClient(baseUrl, authStrategy);
  }

  // Fallback to Basic Auth
  const email = process.env.CONFLUENCE_EMAIL;
  const apiKey = process.env.CONFLUENCE_API_KEY;

  if (!email || !apiKey) {
    throw new Error(
      'Either OAuth2 credentials (CONFLUENCE_OAUTH_CLIENT_ID, CONFLUENCE_OAUTH_CLIENT_SECRET) ' +
      'or Basic Auth credentials (CONFLUENCE_EMAIL, CONFLUENCE_API_KEY) are required'
    );
  }

  const authStrategy = new BasicAuthStrategy(email, apiKey);
  return new ConfluenceClient(baseUrl, authStrategy);
}

export const confluenceClient = createConfluenceClient();
```

**Files to update**:
- `demo/src/lib/confluence.ts`

---

### Step 9: Update Documentation

**Files to update**:
- `README.md`: Add OAuth2 section to authentication documentation
- `demo/README.md`: Add OAuth2 setup instructions
- `packages/core/README.md`: Document authentication strategies API
- `demo/src/app/how-to/page.tsx`: Add OAuth2 integration example

**Documentation sections to add**:
1. How to create OAuth2 app in Atlassian
2. OAuth2 vs Basic Auth comparison
3. Environment variable setup for OAuth2
4. Code examples for both auth methods
5. Migration guide from Basic Auth to OAuth2

---

### Step 10: Test Implementation

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

- OAuth2 implementation focuses on Client Credentials flow for server-side usage
- Token storage is in-memory for demo app (production apps should use persistent storage)
- Backward compatibility maintained through factory methods and fallback logic
- Security best practices followed (credentials in environment variables only)
