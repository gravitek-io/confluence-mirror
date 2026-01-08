# OAuth2 Troubleshooting Guide

## Error: "Unauthorized; scope does not match"

This error occurs when the OAuth2 token doesn't have the required scopes to access Confluence content.

### Quick Diagnosis

Your logs show:
```
Token scopes: read:confluence-content.all read:confluence-space.summary read:confluence-user
Error: {"code":401,"message":"Unauthorized; scope does not match"}
```

This means the token was successfully obtained, but Atlassian's API is rejecting it.

### Common Causes & Solutions

#### 1. Missing Scopes in OAuth App Configuration

**Check your OAuth app scopes:**

1. Go to https://admin.atlassian.com
2. Navigate to **Directory** > **Service accounts**
3. Find your service account and click **Manage**
4. Go to **API keys** tab
5. Find your OAuth 2.0 credentials
6. Click **Edit** or **Manage scopes**

**Required scopes for Confluence Mirror:**
- ✅ `read:confluence-content.all` - Read all Confluence content (pages, attachments, etc.)
- ✅ `read:confluence-space.summary` - Read space information
- ✅ `read:confluence-user` - Read user information

**⚠️ IMPORTANT:** After adding scopes, you may need to:
- Generate new credentials (Client ID + Client Secret)
- Or wait a few minutes for changes to propagate

#### 2. Service Account Permissions

Even with correct OAuth scopes, the service account needs Confluence permissions:

1. Go to your Confluence instance
2. Navigate to the space containing the page
3. Go to **Space Settings** > **Permissions**
4. Add your service account with **View** permission (minimum)

**To find your service account email:**
- It's usually in format: `service-account-name@connect.atlassian.com`
- Check in Atlassian Admin > Directory > Service accounts

#### 3. Page/Space Restrictions

Some pages have additional restrictions beyond space permissions:

1. Open the page in Confluence
2. Click **•••** (More actions) > **Restrictions**
3. Make sure the service account is included in view restrictions

#### 4. Using Wrong API Endpoints

If you modified the code, ensure you're using OAuth2 endpoints:

**✅ Correct (OAuth2):**
```
https://api.atlassian.com/ex/confluence/{cloudId}/rest/api/content/{pageId}
```

**❌ Incorrect (Basic Auth only):**
```
https://{domain}.atlassian.net/wiki/rest/api/content/{pageId}
```

### Verification Steps

#### Step 1: Test OAuth2 Flow Manually

Run the diagnostic script:
```bash
cd demo
node test-oauth.js
```

This will show you:
- ✅ Token acquisition (with scopes)
- ✅ Accessible resources (Cloud ID)
- ✅ API call success/failure

#### Step 2: Check Token Scopes

The logs should show:
```
[OAuth2] Token expires in 3600s, scopes: read:confluence-content.all read:confluence-space.summary read:confluence-user
```

If scopes are missing or different, you need to reconfigure the OAuth app.

#### Step 3: Verify Cloud ID

Logs should show:
```
[CloudID] Using Cloud ID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[CloudID] Scopes: read:confluence-content.all, read:confluence-space.summary, read:confluence-user
```

The scopes here come from the accessible-resources endpoint and show what the service account is authorized for.

### Advanced: Granular Scopes

Atlassian is migrating to **granular scopes**. If classic scopes don't work:

**Try these granular scopes instead:**
- `read:content:confluence` - Read Confluence content
- `read:space:confluence` - Read Confluence spaces
- `read:user:confluence` - Read user information

**Note:** You may need to use Confluence REST API v2 endpoints with granular scopes.

### Still Not Working?

If you've verified all of the above and still get the error:

1. **Check Atlassian Status:** https://status.atlassian.com
2. **Contact Atlassian Support:** The service account might need admin approval
3. **Try Basic Auth:** As a temporary workaround, switch to Basic Authentication:
   ```env
   # Comment out OAuth2
   # CONFLUENCE_OAUTH_CLIENT_ID=...
   # CONFLUENCE_OAUTH_CLIENT_SECRET=...

   # Use Basic Auth instead
   CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
   CONFLUENCE_EMAIL=your.email@example.com
   CONFLUENCE_API_KEY=your_api_key
   ```

### Debug Mode

Enable detailed logging by checking the server console. You should see:

```
[Confluence Client] Initializing...
[Confluence Client] Using OAuth2 authentication
[OAuth2Strategy] Creating new token manager...
[OAuth2] Requesting new access token...
[OAuth2] Access token received in XXXms
[OAuth2] Token expires in 3600s, scopes: ...
[CloudID] Fetching accessible resources...
[CloudID] Using Cloud ID: ...
[API] Making request to endpoint: ...
[API] Response received in XXXms, status: 401 ❌
```

If you see status `401` with "scope does not match", the issue is with OAuth app configuration or service account permissions.
