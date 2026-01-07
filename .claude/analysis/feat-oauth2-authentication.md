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

### Confluence OAuth2 Flow

Atlassian Confluence supports OAuth 2.0 (3LO - 3-legged OAuth) with the following:
1. **Client Credentials**: Client ID and Client Secret
2. **Authorization Flow**: Authorization code flow with PKCE
3. **Token Management**: Access tokens and refresh tokens
4. **Scopes**: Required scopes for Confluence API access

### Implementation Requirements

1. **Environment Variables** (.env.local):
   - `CONFLUENCE_OAUTH_CLIENT_ID`: OAuth2 Client ID
   - `CONFLUENCE_OAUTH_CLIENT_SECRET`: OAuth2 Client Secret
   - Keep existing Basic Auth variables for backward compatibility

2. **Authentication Type Selection**:
   - Support both Basic Auth and OAuth2
   - Determine auth type based on available environment variables
   - OAuth2 takes precedence if both are configured

3. **OAuth2 Token Management**:
   - Token acquisition and storage
   - Token refresh mechanism
   - Token expiration handling

4. **ConfluenceClient Modifications**:
   - Support multiple authentication strategies
   - Abstract authentication logic
   - Handle OAuth2 bearer tokens in requests

## Technical Considerations

### Architecture

1. **Authentication Strategy Pattern**:
   - Create abstract authentication interface
   - Implement `BasicAuthStrategy` and `OAuth2Strategy`
   - Inject strategy into `ConfluenceClient`

2. **Token Storage** (for OAuth2):
   - For server-side (demo app): In-memory or session storage
   - Consider token persistence for production use
   - Handle concurrent requests with same token

3. **Error Handling**:
   - Token expiration errors (401)
   - Automatic token refresh
   - Fallback mechanisms

### Security Considerations

1. **Credential Storage**:
   - OAuth2 credentials must be in environment variables
   - Never expose client secret to client-side code
   - Secure token storage mechanism

2. **Token Security**:
   - Short-lived access tokens
   - Secure refresh token handling
   - HTTPS-only communication

3. **Backward Compatibility**:
   - Maintain existing Basic Auth support
   - No breaking changes to existing API
   - Clear migration path for users

## Implementation Approach

### Phase 1: Core Package Updates

1. Create authentication strategy interfaces
2. Implement `BasicAuthStrategy` (refactor existing)
3. Implement `OAuth2Strategy` with token management
4. Update `ConfluenceClient` to use strategies
5. Export new types and interfaces

### Phase 2: Demo App Integration

1. Update environment variables and `.env.example`
2. Create OAuth2 token manager for server-side
3. Update `demo/src/lib/confluence.ts` configuration
4. Add authentication type selection logic
5. Handle OAuth2 callback routes if needed

### Phase 3: Documentation

1. Update README with OAuth2 setup instructions
2. Document OAuth2 app creation in Atlassian
3. Update environment variable documentation
4. Provide migration guide from Basic Auth

## Risks and Mitigation

### Risks

1. **Complexity**: OAuth2 adds significant complexity
2. **Token Management**: Proper token lifecycle management
3. **Breaking Changes**: Potential API changes
4. **Testing**: Difficult to test OAuth2 flow without real credentials

### Mitigation

1. Use strategy pattern to isolate complexity
2. Implement robust token refresh mechanism
3. Maintain backward compatibility with Basic Auth
4. Create mock implementations for testing

## Success Criteria

- [ ] OAuth2 authentication works with Confluence API
- [ ] Automatic token refresh on expiration
- [ ] Backward compatibility with Basic Auth maintained
- [ ] Environment variables properly documented
- [ ] No breaking changes to existing API
- [ ] Demo app works with both auth methods
- [ ] Security best practices followed
- [ ] Clear documentation for setup

## Out of Scope

- Client-side OAuth2 flow (browser-based)
- Multiple OAuth2 providers (only Atlassian Confluence)
- Token persistence across server restarts
- Advanced token caching strategies
- OAuth2 for core package usage (focus on demo app)
