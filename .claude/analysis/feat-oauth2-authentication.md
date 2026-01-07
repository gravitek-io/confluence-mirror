# Feature Analysis: OAuth2 Authentication

## Context

Currently, the Confluence Mirror project only supports Basic Authentication using an API Key (email + API key combination). To improve security and provide more flexible authentication options, we need to implement OAuth2 authentication support.

## Current Authentication Implementation

### Core Package (packages/core/src/client/confluence-client.ts)

The `ConfluenceClient` class currently:
- Accepts `baseUrl`, `email`, and `apiKey` in the constructor (lines 61-65)
- Uses Basic Authentication in the `makeRequest` method (lines 72-74)
- Encodes credentials as Base64: `${email}:${apiKey}`

### Demo Configuration (demo/src/lib/confluence.ts)

The demo app reads environment variables:
- `CONFLUENCE_BASE_URL`: Base URL of Confluence instance
- `CONFLUENCE_EMAIL`: User email for Basic Auth
- `CONFLUENCE_API_KEY`: API key for Basic Auth

## OAuth2 Requirements

### Confluence OAuth2 Flow for Service Accounts

Atlassian service accounts use OAuth 2.0 **Client Credentials Flow (2LO - 2-legged OAuth)**:
1. **Client Credentials**: Client ID and Client Secret (no user interaction required)
2. **Token Endpoint**: `https://auth.atlassian.com/oauth/token`
3. **Token Lifetime**: 60 minutes (3600 seconds)
4. **Grant Type**: `client_credentials` (simple POST request)
5. **Cloud ID Detection**: Automatic via `https://api.atlassian.com/oauth/token/accessible-resources`
6. **API Base URL**: `https://api.atlassian.com/ex/confluence/{cloudId}/` (different from Basic Auth)

### Implementation Requirements

1. **Environment Variables** (.env.local):
   - `CONFLUENCE_OAUTH_CLIENT_ID`: OAuth2 Client ID
   - `CONFLUENCE_OAUTH_CLIENT_SECRET`: OAuth2 Client Secret
   - **No Cloud ID needed** - automatically detected
   - **No Base URL needed** - uses api.atlassian.com
   - Keep existing Basic Auth variables for backward compatibility

2. **Authentication Type Selection**:
   - Support both Basic Auth and OAuth2
   - Determine auth type based on available environment variables
   - OAuth2 takes precedence if both are configured

3. **OAuth2 Token Management**:
   - Token acquisition via Client Credentials Flow
   - Automatic token refresh before expiration (60-minute lifetime)
   - In-memory token storage
   - 1-minute buffer before expiry for refresh

4. **Cloud ID Management**:
   - Automatic detection on first API call
   - Cached for subsequent requests
   - Uses `accessible-resources` endpoint

5. **ConfluenceClient Modifications**:
   - Support multiple authentication strategies
   - Dynamic URL construction (Basic Auth vs OAuth2)
   - Handle OAuth2 bearer tokens in requests
   - Support both `instance.atlassian.net` and `api.atlassian.com` URLs

## Technical Considerations

### Architecture

1. **Authentication Strategy Pattern**:
   - Create abstract `AuthStrategy` interface
   - Implement `BasicAuthStrategy` (refactor existing logic)
   - Implement `OAuth2Strategy` with token and Cloud ID managers
   - Inject strategy into `ConfluenceClient`

2. **Token Management** (for OAuth2):
   - `OAuth2TokenManager`: Handles Client Credentials Flow
   - In-memory token storage for demo app
   - Automatic refresh with 1-minute buffer before expiry
   - No refresh tokens needed (Client Credentials generates new access tokens)

3. **Cloud ID Management**:
   - `CloudIdManager`: Automatic Cloud ID detection
   - Fetches from `accessible-resources` endpoint
   - Caches Cloud ID for session lifetime
   - Handles cases with multiple accessible resources

4. **URL Construction**:
   - Basic Auth: `https://{domain}.atlassian.net/wiki/rest/api/{endpoint}`
   - OAuth2: `https://api.atlassian.com/ex/confluence/{cloudId}/rest/api/{endpoint}`
   - Dynamic URL builder based on auth strategy

5. **Error Handling**:
   - Token expiration errors (401) → automatic refresh
   - Invalid credentials → clear error messages
   - No accessible resources → informative error
   - API errors → maintain existing error handling

### Security Considerations

1. **Credential Storage**:
   - OAuth2 credentials stored only in environment variables
   - Never expose Client ID/Secret to client-side code
   - Demo app is server-side only (Next.js Server Components)

2. **Token Security**:
   - Short-lived access tokens (60 minutes)
   - Bearer token in Authorization header
   - HTTPS-only communication (enforced by Atlassian)
   - In-memory token storage (no disk persistence)

3. **Service Account Security**:
   - Non-human identity (no password)
   - Scoped permissions controlled in Atlassian Admin
   - Designed for automation and integrations
   - Client Secret cannot be recovered after creation

4. **Backward Compatibility**:
   - Maintain existing Basic Auth support
   - No breaking changes to existing API
   - Clear migration path for users
   - Factory methods for both auth types

## Implementation Approach

### Phase 1: Core Package Updates

1. Create authentication strategy interfaces (`AuthStrategy`)
2. Implement `BasicAuthStrategy` (refactor existing logic)
3. Implement `OAuth2TokenManager` (Client Credentials Flow)
4. Implement `CloudIdManager` (automatic detection)
5. Implement `OAuth2Strategy` (integrates token and Cloud ID managers)
6. Update `ConfluenceClient` to support dynamic URLs
7. Add factory methods for both auth types
8. Export new types and interfaces

### Phase 2: Demo App Integration

1. Update environment variables in `.env.example`
2. Update `demo/src/lib/confluence.ts` configuration
3. Add authentication type selection logic (OAuth2 first, Basic Auth fallback)
4. Test with both authentication methods

### Phase 3: Documentation

1. Update README with OAuth2 setup instructions
2. Document service account creation in Atlassian Admin
3. Document OAuth2 credential generation
4. Update environment variable documentation (emphasize simplicity)
5. Provide migration guide from Basic Auth to OAuth2
6. Add code examples for both auth types

## Risks and Mitigation

### Risks

1. **Complexity**: OAuth2 and Cloud ID detection add complexity
2. **Token Management**: Proper token lifecycle management
3. **URL Changes**: OAuth2 uses different API base URL
4. **Testing**: Difficult to test OAuth2 flow without real service account credentials
5. **Multiple Resources**: Handling multiple accessible Confluence sites

### Mitigation

1. Use strategy pattern to isolate complexity
2. Implement robust token refresh mechanism with buffer
3. Maintain backward compatibility with Basic Auth (no breaking changes)
4. Dynamic URL construction based on auth strategy
5. Use first accessible resource (standard for service accounts)
6. Clear error messages for configuration issues
7. Factory methods provide simple API

## Success Criteria

- [ ] OAuth2 authentication works with Atlassian service accounts
- [ ] Client Credentials Flow (2LO) implemented correctly
- [ ] Automatic Cloud ID detection works
- [ ] Automatic token refresh before expiration (60 minutes)
- [ ] Backward compatibility with Basic Auth maintained
- [ ] Environment variables properly documented (minimal config)
- [ ] No breaking changes to existing API
- [ ] Demo app works with both auth methods
- [ ] Security best practices followed
- [ ] Clear documentation for service account setup
- [ ] Factory methods provide simple API

## Out of Scope

- 3-legged OAuth2 flow (3LO) - not needed for service accounts
- User-interactive authentication flows
- Multiple OAuth2 providers (only Atlassian Confluence)
- Token persistence across server restarts (in-memory only)
- Advanced token caching strategies
- Multiple Cloud ID selection (uses first accessible resource)
- Manual Cloud ID configuration (fully automatic)
