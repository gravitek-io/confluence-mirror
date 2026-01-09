import Link from "next/link";

export default function HowToPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            How to Integrate
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Step-by-step guide to integrate Confluence Mirror in your React application
          </p>
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* Step 1: Installation */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              📦 Step 1: Installation
            </h2>
            <p className="text-gray-600 mb-4">
              Install the core package that handles Confluence API integration:
            </p>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`npm install @gravitek/confluence-mirror-core`}
            </pre>
          </div>
        </section>

        {/* Step 2: Copy Components */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              📋 Step 2: Copy Components
            </h2>
            <p className="text-gray-600 mb-4">
              Copy the reusable confluence components from this demo to your project:
            </p>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`# Copy all confluence components
cp -r demo/src/components/confluence/ your-project/src/components/

# Copy utility functions
cp demo/src/lib/confluence.ts your-project/src/lib/`}
            </pre>
          </div>
        </section>

        {/* Step 3: Tailwind Setup */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              🎨 Step 3: Tailwind CSS Setup
            </h2>
            <p className="text-gray-600 mb-4">
              Components use standard Tailwind classes. Ensure your config includes the component paths:
            </p>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`// tailwind.config.js
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // ... rest of your config
}`}
            </pre>
          </div>
        </section>

        {/* Step 4: Configuration */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              ⚙️ Step 4: Configuration
            </h2>
            <p className="text-gray-600 mb-4">
              Set up your Confluence client configuration:
            </p>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
              {`// src/lib/confluence.ts
import { ConfluenceClient } from "@gravitek/confluence-mirror-core";

// Automatic authentication detection:
// - OAuth2 if CONFLUENCE_OAUTH_CLIENT_ID and CONFLUENCE_OAUTH_CLIENT_SECRET are set
// - Basic Auth if CONFLUENCE_BASE_URL, CONFLUENCE_EMAIL, and CONFLUENCE_API_KEY are set

function createConfluenceClient(): ConfluenceClient {
  const oauthClientId = process.env.CONFLUENCE_OAUTH_CLIENT_ID;
  const oauthClientSecret = process.env.CONFLUENCE_OAUTH_CLIENT_SECRET;

  if (oauthClientId && oauthClientSecret) {
    return ConfluenceClient.createWithOAuth2(oauthClientId, oauthClientSecret);
  }

  const baseUrl = process.env.CONFLUENCE_BASE_URL;
  const email = process.env.CONFLUENCE_EMAIL;
  const apiKey = process.env.CONFLUENCE_API_KEY;

  if (baseUrl && email && apiKey) {
    return ConfluenceClient.createWithBasicAuth(baseUrl, email, apiKey);
  }

  throw new Error("Authentication credentials required");
}

export const confluenceClient = createConfluenceClient();`}
            </pre>
          </div>
        </section>

        {/* Step 5: Usage Examples */}
        <section className="mb-12">
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              🚀 Step 5: Usage Examples
            </h2>
            
            {/* Option 1 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Option 1: All-in-one Component
              </h3>
              <p className="text-gray-600 mb-4">
                Simple usage with predefined layout:
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`import ConfluenceMirrorServer from "@/components/confluence/ConfluenceMirrorServer";

<ConfluenceMirrorServer
  pageId="123456"
  showNavigation={true}
/>`}
              </pre>
            </div>

            {/* Option 2 */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Option 2: Individual Components (Custom Layout)
              </h3>
              <p className="text-gray-600 mb-4">
                Full flexibility for custom layouts and styling:
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`import ConfluencePage from "@/components/confluence/ConfluencePage";
import NavigationTreeServer from "@/components/confluence/NavigationTreeServer";

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-1">
    <NavigationTreeServer
      pageId="123456"
      title="Navigation"
    />
  </div>

  <div className="lg:col-span-2">
    <ConfluencePage
      pageId="123456"
      showHeader={false}
    />
  </div>
</div>`}
              </pre>
            </div>

            {/* Optional Form */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Optional: Page Input Form
              </h3>
              <p className="text-gray-600 mb-4">
                For user input functionality:
              </p>
              <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
                {`import ConfluenceForm from "@/components/confluence/ConfluenceForm";

<ConfluenceForm
  initialPageId=""
  onPageIdChange={(pageId) => {
    // Handle page change in your app
    console.log('New page ID:', pageId);
  }}
  onError={(error) => {
    // Handle validation errors
    console.error('Form error:', error);
  }}
/>`}
              </pre>
            </div>
          </div>
        </section>

        {/* Components Reference */}
        <section>
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h2 className="text-xl font-bold text-blue-900 mb-4">
              📦 Components Reference
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Reusable Components</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <code>ConfluenceMirrorServer</code> - All-in-one component</li>
                  <li>• <code>ConfluencePage</code> - Page content only</li>
                  <li>• <code>NavigationTreeServer</code> - Navigation tree</li>
                  <li>• <code>ConfluenceForm</code> - Page input form</li>
                  <li>• <code>OptimizedAdfRenderer</code> - ADF renderer</li>
                  <li>• <code>OptimizedToc</code> - Table of contents</li>
                  <li>• <code>OptimizedMedia</code> - Media handling</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">Core Package</h4>
                <ul className="space-y-1 text-blue-700">
                  <li>• <code>ConfluenceClient</code> - API client</li>
                  <li>• <code>processADFWithMedia</code> - Media processing</li>
                  <li>• <code>processADFWithTOC</code> - TOC extraction</li>
                  <li>• TypeScript types and interfaces</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
