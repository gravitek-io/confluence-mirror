import React from "react";
import { ConfluenceChildPage } from "confluence-mirror-core";
import { confluenceClient } from "@/lib/confluence";

// Type pour un item de navigation server-side
export interface NavigationItem {
  id: string;
  title: string;
  type: string;
  status: string;
  confluenceUrl: string;
  appUrl?: string;
  children?: NavigationItem[];
}

// Props pour un item de navigation individuel
interface NavigationItemProps {
  item: NavigationItem;
  level?: number;
}

function NavigationTreeItem({ item, level = 0 }: NavigationItemProps) {
  const indentClass = level > 0 ? `ml-${level * 4}` : "";
  const href = item.appUrl || item.confluenceUrl;
  const isExternal = !item.appUrl;

  return (
    <li className={`${indentClass}`}>
      <a
        href={href}
        target={isExternal ? "_blank" : undefined}
        rel={isExternal ? "noopener noreferrer" : undefined}
        className="flex items-center py-2 px-3 text-sm text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors group"
      >
        {/* Icon for pages */}
        <svg
          className="w-4 h-4 mr-2 text-gray-400 group-hover:text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>

        <span className="flex-1 truncate">{item.title}</span>

        {/* External link indicator */}
        {isExternal && (
          <svg
            className="w-3 h-3 ml-1 text-gray-400 group-hover:text-blue-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>

      {/* Recursive children */}
      {item.children && item.children.length > 0 && (
        <ul className="mt-1">
          {item.children.map((child) => (
            <NavigationTreeItem key={child.id} item={child} level={level + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

// Props for the main component
interface NavigationTreeServerProps {
  pageId: string;
  baseUrl?: string; // URL de base pour la navigation dans l'app
  className?: string;
  title?: string;
}

/**
 * NavigationTreeServer - Version Server Component
 * Retrieves the data server-side via the Confluence client
 */
export default async function NavigationTreeServer({
  pageId,
  baseUrl,
  className = "",
  title = "Navigation",
}: NavigationTreeServerProps) {
  let navigationItems: NavigationItem[] = [];
  let error: string | null = null;

  try {
    const childPages = await confluenceClient.getChildPages(pageId);

    navigationItems = childPages.map(
      (page: ConfluenceChildPage): NavigationItem => ({
        id: page.id,
        title: page.title,
        type: page.type,
        status: page.status,
        confluenceUrl: page._links.webui,
        appUrl: baseUrl ? `${baseUrl}?pageId=${page.id}` : undefined,
      })
    );
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load navigation";
    console.error("Navigation fetch error:", err);
  }

  if (error) {
    return (
      <div
        className={`bg-white rounded-lg border border-red-200 p-4 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
          <p className="font-medium">Failed to load navigation</p>
          <p className="mt-1 text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  if (navigationItems.length === 0) {
    return (
      <div
        className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">{title}</h3>
        </div>
        <div className="text-sm text-gray-500 text-center py-6">
          <svg
            className="w-8 h-8 mx-auto mb-2 text-gray-300"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p>No child pages found</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}
    >
      <div className="flex items-center mb-4">
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>

      <nav>
        <ul className="space-y-1">
          {navigationItems.map((item) => (
            <NavigationTreeItem key={item.id} item={item} />
          ))}
        </ul>
      </nav>
    </div>
  );
}
