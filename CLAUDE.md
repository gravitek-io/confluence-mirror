# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Confluence Mirror** is a demonstration project that shows how to integrate Confluence content into React applications. It consists of a published core package (`confluence-mirror-core`) and a complete implementation example with reusable React components.

### Key Features

- Complete ADF (Atlas Document Format) rendering support
- Confluence REST API client with TypeScript types
- Automatic table of contents generation
- Media processing and optimization
- Clean Tailwind CSS styling (no CSS overrides)
- Server-side rendering with Next.js 16

## Project Architecture

This is a workspace-based project with the following structure:

### Current Structure (Post-Refactoring)

- **packages/core** (`confluence-mirror-core`): Published npm package with framework-agnostic core logic
  - Confluence API client (`ConfluenceClient`)
  - ADF processors (media, TOC, text extraction)
  - TypeScript types and interfaces
  - **Status**: Published on npm as `confluence-mirror-core@0.1.2`
- **demo/**: Complete implementation example with reusable React components
  - All React components for ADF rendering
  - Integration examples and how-to guides
  - Interactive demo application

### Key Dependencies

- Core package: Pure TypeScript with no dependencies
- Demo: Next.js 16, React 19, Tailwind CSS v4, confluence-mirror-core

## Development Commands

```bash
# Install all dependencies (root + workspaces)
npm install

# Development
npm run dev                 # Start demo app in development
npm run build              # Build all packages and demo
npm run build:core         # Build core package only
npm run build:demo         # Build demo app only
npm run lint               # Lint all workspaces

# Package-specific commands
cd packages/core && npm run dev    # Watch build core package
cd demo && npm run dev             # Start demo in development

# Publishing (core package only)
cd packages/core && npm publish    # Publish core package to npm
```

## Core Architecture

### Confluence API Integration

- **Authentication**: Basic auth using email + API key
- **API Version**: Confluence REST API v1 (standard endpoints)
- **Supported Formats**: ADF (Atlas Document Format) and Storage format
- **URL Extraction**: Supports multiple Confluence URL patterns

### ADF Processing Pipeline

1. **Raw ADF**: Fetched from Confluence API
2. **Media Processing**: Extract and process media references (`processADFWithMedia`)
3. **TOC Processing**: Generate table of contents from headings (`processADFWithTOC`)
4. **Rendering**: Convert ADF nodes to React components (`renderADF`)

### Component Architecture (Demo Implementation)

- **AdfRenderer**: Core rendering engine that converts ADF nodes to React
- **OptimizedADFRenderer**: Wrapper with media and TOC preprocessing  
- **OptimizedMedia**: Component for handling Confluence media assets
- **OptimizedTOC**: Table of contents component with clean Tailwind styling
- **ConfluencePage**: High-level server component for complete page rendering
- **ConfluenceMirrorServer**: All-in-one component with navigation
- **NavigationTreeServer**: Child pages navigation component
- **ConfluenceForm**: Reusable form component for page input

## Supported ADF Elements

The renderer supports comprehensive ADF elements including:

- **Text**: Bold, italic, code, strikethrough, underline, links
- **Structure**: Headings, paragraphs, lists (bullet/ordered), blockquotes
- **Layout**: Multi-column layouts with responsive behavior
- **Content**: Tables, panels (info/warning/error/success/note), code blocks
- **Interactive**: Task lists with checkboxes, status badges
- **Rich**: Media (images/attachments), inline cards, mentions, dates, emojis
- **Extensions**: Confluence macros and bodied extensions

## Working with the Codebase

### Adding New ADF Support

1. Add type definitions in `packages/core/src/types/index.ts`
2. Implement rendering logic in `demo/src/components/confluence/AdfRenderer.tsx`
3. Add processing logic if needed in `packages/core/src/processors/`

### Development Workflow

1. Make changes to core package first (types, API logic)
2. Build core package: `npm run build:core`
3. Make changes to demo components (rendering, styling)
4. Test in demo app: `npm run dev` from root

### File Organization

- **Core Package**: All reusable logic in `packages/core/src/`
  - **Types**: TypeScript interfaces in `types/`
  - **API Logic**: Confluence client in `client/`
  - **Processors**: Pure functions for ADF transformation in `processors/`
- **Demo Components**: React components in `demo/src/components/`
  - **Reusable**: `/confluence/` - Components for integration
  - **Demo-specific**: `/showroom/`, `ConfluenceFormDemo.tsx`

## Recent Major Changes (Architecture Refactoring)

### Removed packages/next Package

The `packages/next` package was removed due to styling complexity issues. The approach changed from:
- **Before**: Multi-package library with external styling challenges
- **After**: Published core package + implementation example with local components

### Resolved CSS Issues

- **Problem**: Tailwind classes not generated for external package components
- **Problem**: SVG sizing conflicts with @tailwindcss/typography
- **Solution**: Moved components to demo app, removed typography plugin
- **Result**: Clean Tailwind CSS without overrides or !important declarations

### Component Organization

- **`/demo/src/components/confluence/`**: Reusable components ready for copy-paste integration
  - `ConfluenceMirrorServer.tsx` - All-in-one component with navigation
  - `ConfluencePage.tsx` - Page content component
  - `NavigationTreeServer.tsx` - Child pages navigation
  - `OptimizedAdfRenderer.tsx` - ADF rendering with preprocessing
  - `OptimizedToc.tsx` - Table of contents component
  - `OptimizedMedia.tsx` - Media handling component
  - `AdfRenderer.tsx` - Core ADF rendering logic
  - `ConfluenceForm.tsx` - Reusable form component
- **`/demo/src/components/showroom/`**: Demo-specific components
  - `ShowroomContent.tsx` - Showroom demo renderer
  - `ShowroomNavigation.tsx` - Showroom navigation sidebar
- **`ConfluenceFormDemo.tsx`**: Demo wrapper with Next.js routing

## Demo Application Structure

### Pages

- **`/`**: Home page with form input and live page rendering
- **`/showroom`**: Complete showcase of all supported ADF elements in 2-column layout
- **`/how-to`**: Step-by-step integration guide with code examples

### Integration Approaches

1. **Install + Copy**: `npm install confluence-mirror-core` + copy demo components
2. **Fork Repository**: Clone and customize the entire demo app

### Documentation Strategy

- **Main README**: High-level overview and quick start
- **Demo README**: Detailed setup and integration guide
- **Core README**: API documentation for published package
- **`/how-to` page**: Interactive version of integration guide

## Environment Configuration

Required environment variables in `.env.local` (demo app):

```
CONFLUENCE_API_KEY=your_confluence_api_key
CONFLUENCE_BASE_URL=https://your-domain.atlassian.net
CONFLUENCE_EMAIL=your.email@domain.com
```
