# Confluence Mirror

Transform your Confluence pages into beautiful React components! This project demonstrates how to seamlessly integrate Confluence content into modern web applications.

![Confluence Mirror](./images/confluence-mirror.png)

> **Disclaimer:** This is an unofficial project, not affiliated with Atlassian.

## 🏗 Project Structure

This repository contains:

- **packages/core** - `confluence-mirror-core`: Framework-agnostic Confluence API & ADF processing
- **demo/** - Complete implementation example with reusable React components

## 🚀 Quick Start

```bash
# Clone and run the demo
git clone https://github.com/Gravitek-io/confluence-mirror
cd confluence-mirror
npm install
npm run dev
```

Visit http://localhost:3000 to see the demo in action.

> **Note**: Before running the demo, configure authentication. See [Authentication Setup](#-authentication) below.

## 🔐 Authentication

The project supports **two authentication methods** with Atlassian Confluence:

### OAuth2 (Recommended)
- Uses Atlassian service accounts
- More secure with short-lived tokens
- Auto-refreshing authentication
- Automatic Cloud ID detection

```env
CONFLUENCE_OAUTH_CLIENT_ID=your_client_id
CONFLUENCE_OAUTH_CLIENT_SECRET=your_client_secret
```

### Basic Auth (Legacy)
- Uses personal Atlassian account
- Email + API token
- Simpler setup for development

```env
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_EMAIL=your.email@domain.com
CONFLUENCE_API_KEY=your_api_token
```

**Detailed setup instructions**: See [demo/README.md](./demo/README.md#-configuration)

## 🎯 Integration Approaches

### Option 1: Install Package + Copy Components

```bash
# Install the published core package
npm install confluence-mirror-core

# Copy reusable components from demo
cp -r demo/src/components/confluence/ your-project/src/components/
cp demo/src/lib/confluence.ts your-project/src/lib/
```

### Option 2: Fork This Repository

Fork this repository and customize the demo app for your needs.

## 📦 Core Package

### confluence-mirror-core

Framework-agnostic core logic for Confluence integration:

- ✅ Confluence REST API client
- ✅ ADF (Atlas Document Format) processing  
- ✅ Media URL rewriting
- ✅ Table of contents extraction
- ✅ TypeScript types

## 📖 Documentation

- [Core Package Documentation](./packages/core/README.md)
- [Demo App Setup & Integration Guide](./demo/README.md)

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests.

## 📄 License

Apache-2.0 © Gravitek
