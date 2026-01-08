# Confluence Mirror

Transform your Confluence pages into beautiful React components! This project demonstrates how to seamlessly integrate Confluence content into modern web applications, bringing your documentation to life with native React rendering and Tailwind CSS styling.

## 🧪 Testing with Demo App

### 🔧 Configuration

Before running the demo, you need to configure your Confluence API access.

#### Environment Variables

Create a `.env.local` file in the demo directory:

```env
# Your Confluence instance
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net

# Your Atlassian account email
CONFLUENCE_EMAIL=your.email@domain.com

# Confluence API token (generate from Atlassian Account Settings)
CONFLUENCE_API_KEY=your_api_token_here
```

#### Confluence API Setup

1. **Generate API Token**:

   - Go to [Atlassian Account Settings](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Name it "Confluence Mirror Demo"
   - Copy the generated token

2. **Test Connection**:
   - Start the demo app
   - Enter a valid Confluence page URL
   - If it loads, your configuration is correct!

### 🚀 Quick Start

```bash
# From the repository root
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the demo.

### 🎨 Demo Features

- **Page Viewer**: Enter any Confluence page URL or ID to render it
- **Showroom**: Comprehensive showcase of all supported ADF elements
- **How-to Guide**: Live examples of integration methods

### 📖 Demo Pages

#### Home Page (`/`)

- **Page Input**: Enter Confluence URL or page ID
- **Live Rendering**: See your pages transformed instantly
- **Error Handling**: Clear feedback for invalid pages or auth issues

#### Showroom (`/showroom`)

- **Complete Demo**: All supported ADF elements
- **Styling Examples**: See default Tailwind styles in action
- **Component Showcase**: Every feature of the library

#### How-to Guide (`/how-to`)

- **Integration Examples**: Step-by-step integration guide
- **Code Variants**: All-in-one vs individual components
- **Live Documentation**: Interactive version of this README

---

## 🧪 Testing

The demo includes comprehensive end-to-end tests using Playwright to validate all ADF processors and prevent regressions.

### Running Tests

```bash
# Run all tests
npm test

# Run with UI (interactive mode)
npm run test:ui

# Run in headed mode (see browser)
npm run test:headed

# Run only showroom tests
npm run test:showroom
```

### Test Coverage

The test suite validates all major processors:
- ✅ Text formatting (bold, italic, links, code)
- ✅ Lists (bullet, ordered)
- ✅ Tables with headers and cells
- ✅ **Media processor** (images, captions, URL extraction)
- ✅ Panels (info, warning, error, success, note)
- ✅ Code blocks and blockquotes
- ✅ **TOC processor** (heading anchors, navigation)
- ✅ Task lists (completed, pending)
- ✅ Layout columns
- ✅ Confluence extensions
- ✅ Special elements (status, dates, mentions, emojis)

### Why These Tests Matter

These tests are critical for:
1. **API Compatibility**: Ensuring OAuth2 (API v2) and Basic Auth (API v1) both work
2. **Media Processing**: Validating that Storage format is fetched for media URL extraction
3. **Regression Detection**: Catching breaking changes in processors early
4. **Visual Regression**: Ensuring UI consistency across changes

See `tests/README.md` for detailed testing documentation.

---

## 🚀 Integration in your React App

### Installation

```bash
npm install confluence-mirror-core
```

### Copy Components

Copy the confluence components from this demo to your project:

```bash
# Copy all confluence components
cp -r demo/src/components/confluence/ your-project/src/components/

# Copy utility functions
cp demo/src/lib/confluence.ts your-project/src/lib/
```

### Tailwind CSS Setup

The components are styled with standard Tailwind CSS classes. Ensure your `tailwind.config.js` includes the component paths:

```javascript
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  // ... rest of your config
};
```

### Configuration

Create your Confluence client configuration:

```typescript
// src/lib/confluence.ts
export const confluenceConfig = {
  baseUrl: process.env.CONFLUENCE_BASE_URL!,
  email: process.env.CONFLUENCE_EMAIL!,
  apiKey: process.env.CONFLUENCE_API_KEY!,
};
```

### Usage Examples

#### Option 1: All-in-one Component

Simple usage with predefined layout:

```tsx
import ConfluenceMirrorServer from "@/components/confluence/ConfluenceMirrorServer";
import { confluenceConfig } from "@/lib/confluence";

<ConfluenceMirrorServer
  config={confluenceConfig}
  pageId="123456"
  showNavigation={true}
/>;
```

#### Option 2: Individual Components (Custom Layout)

Full flexibility for custom layouts and styling:

```tsx
import ConfluencePage from "@/components/confluence/ConfluencePage";
import NavigationTreeServer from "@/components/confluence/NavigationTreeServer";
import { confluenceConfig } from "@/lib/confluence";

<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
  <div className="lg:col-span-1">
    <NavigationTreeServer
      pageId="123456"
      config={confluenceConfig}
      title="Navigation"
    />
  </div>

  <div className="lg:col-span-2">
    <ConfluencePage
      pageId="123456"
      config={confluenceConfig}
      showHeader={false}
    />
  </div>
</div>;
```

#### Optional: Page Input Form

For user input functionality, you can also copy the form component:

```tsx
import ConfluenceForm from "@/components/confluence/ConfluenceForm";

<ConfluenceForm
  initialPageId=""
  onPageIdChange={(pageId) => {
    // Handle page change in your app
    console.log("New page ID:", pageId);
  }}
  onError={(error) => {
    // Handle validation errors
    console.error("Form error:", error);
  }}
/>;
```

---

## 🛠️ Development

### Project Structure

```
demo/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── page.tsx            # Home page with form
│   │   ├── layout.tsx          # Root layout
│   │   ├── showroom/           # Showroom demo
│   │   └── how-to/             # Integration guide
│   ├── components/
│   │   ├── confluence/         # 📦 Reusable components
│   │   │   ├── ConfluenceMirrorServer.tsx
│   │   │   ├── ConfluencePage.tsx
│   │   │   ├── NavigationTreeServer.tsx
│   │   │   ├── OptimizedAdfRenderer.tsx
│   │   │   ├── OptimizedToc.tsx
│   │   │   ├── OptimizedMedia.tsx
│   │   │   ├── AdfRenderer.tsx
│   │   │   └── ConfluenceForm.tsx
│   │   ├── demo/               # Demo-specific components
│   │   │   ├── ConfluenceFormDemo.tsx
│   │   │   ├── ShowroomContent.tsx
│   │   │   └── ShowroomNavigation.tsx
│   └── lib/
│       └── confluence.ts       # Configuration helper
├── package.json
└── README.md
```

### Build & Deploy

```bash
# Development
npm run dev

# Production build
npm run build
npm run start

# Linting
npm run lint
```

## 🔍 Troubleshooting

### Common Issues

**"Page not found" errors**:

- Verify the Confluence page exists and is accessible
- Check that your API token has read permissions
- Try with a page ID instead of URL

**Authentication failures**:

- Ensure `CONFLUENCE_EMAIL` matches your Atlassian account
- Regenerate your API token if it's expired
- Test the base URL in your browser

**Styling issues**:

- The demo includes Tailwind CSS setup
- Check `tailwind.config.js` for proper content paths
- Verify Next.js configuration is correct

**Performance issues**:

- Confluence pages with many images may load slowly
- Consider implementing pagination for large pages
- Use the `Suspense` boundary for better UX

### Debug Mode

Enable additional logging:

```bash
# Enable debug logs
DEBUG=confluence-mirror:* npm run dev
```

## 🎨 Customization

The demo shows how to customize confluence-mirror-next:

### Custom Styling

```tsx
// Override default styles
<ConfluencePage
  pageId={pageId}
  config={config}
  className="bg-gray-50 p-8 rounded-lg shadow-xl"
/>
```

### Custom Components

```tsx
// Use individual components
import { OptimizedADFRenderer, OptimizedTOC } from "@/components/confluence";

<div className="grid grid-cols-4 gap-6">
  <aside className="col-span-1">
    <OptimizedTOC items={tableOfContents} />
  </aside>
  <main className="col-span-3">
    <OptimizedADFRenderer document={document} pageId={pageId} />
  </main>
</div>;
```

## 📚 Learn More

- [confluence-mirror-core Documentation](../packages/core/README.md)
- [Confluence REST API Docs](https://developer.atlassian.com/cloud/confluence/rest/)
- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

Found a bug or want to improve the demo?

1. Fork the repository
2. Create a feature branch
3. Make your changes to the demo app
4. Test thoroughly
5. Submit a pull request

## 📄 License

Apache-2.0
