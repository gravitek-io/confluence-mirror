// Test OAuth2 authentication
// Run with: node demo/test-oauth.js

const clientId = process.env.CONFLUENCE_OAUTH_CLIENT_ID;
const clientSecret = process.env.CONFLUENCE_OAUTH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
  console.error("❌ Missing OAuth credentials in environment variables");
  console.error("Set CONFLUENCE_OAUTH_CLIENT_ID and CONFLUENCE_OAUTH_CLIENT_SECRET");
  process.exit(1);
}

console.log("🔑 OAuth2 Credentials found");
console.log("Client ID:", clientId.substring(0, 10) + "...");

async function testOAuth() {
  try {
    // Step 1: Get access token
    console.log("\n📡 Step 1: Requesting access token...");

    const params = new URLSearchParams({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenResponse = await fetch("https://auth.atlassian.com/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const errorBody = await tokenResponse.text();
      console.error("❌ Token request failed:", tokenResponse.status);
      console.error("Error:", errorBody);
      return;
    }

    const tokenData = await tokenResponse.json();
    console.log("✅ Access token received");
    console.log("Token type:", tokenData.token_type);
    console.log("Expires in:", tokenData.expires_in, "seconds");
    console.log("Scopes:", tokenData.scope);

    // Step 2: Get accessible resources (Cloud ID)
    console.log("\n📡 Step 2: Fetching accessible resources...");

    const resourcesResponse = await fetch(
      "https://api.atlassian.com/oauth/token/accessible-resources",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          Accept: "application/json",
        },
      }
    );

    if (!resourcesResponse.ok) {
      const errorBody = await resourcesResponse.text();
      console.error("❌ Resources request failed:", resourcesResponse.status);
      console.error("Error:", errorBody);
      return;
    }

    const resources = await resourcesResponse.json();
    console.log("✅ Accessible resources received");
    console.log("Number of resources:", resources.length);

    if (resources.length === 0) {
      console.error("❌ No accessible Confluence sites found");
      console.error("The service account may not have proper permissions");
      return;
    }

    resources.forEach((resource, index) => {
      console.log(`\n📦 Resource ${index + 1}:`);
      console.log("  Cloud ID:", resource.id);
      console.log("  Name:", resource.name);
      console.log("  URL:", resource.url);
      console.log("  Scopes:", resource.scopes.join(", "));
    });

    // Step 3: Test API call
    const cloudId = resources[0].id;
    console.log("\n📡 Step 3: Testing Confluence API...");
    console.log("Using Cloud ID:", cloudId);
    console.log("Testing page ID: 2525266134");

    const apiUrl = `https://api.atlassian.com/ex/confluence/${cloudId}/rest/api/content/2525266134?expand=body.atlas_doc_format,version,space`;

    const apiResponse = await fetch(apiUrl, {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        Accept: "application/json",
      },
    });

    if (!apiResponse.ok) {
      const errorBody = await apiResponse.text();
      console.error("❌ API request failed:", apiResponse.status);
      console.error("Error:", errorBody);
      return;
    }

    const pageData = await apiResponse.json();
    console.log("✅ Page fetched successfully!");
    console.log("Page title:", pageData.title);
    console.log("Page type:", pageData.type);
    console.log("Space:", pageData.space.name);

    console.log("\n✅ ALL TESTS PASSED! OAuth2 authentication is working correctly.");

  } catch (error) {
    console.error("\n❌ Test failed with error:");
    console.error(error.message);
    console.error(error.stack);
  }
}

testOAuth();
