import React from "react";
import { TocItem } from "confluence-mirror-core";

interface OptimizedTOCProps {
  items: TocItem[];
}

// Component to display the table of contents with proper indentation (Server Component)
function TocDisplay({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="space-y-1">
      {items.map((item) => {
        // Calculate indentation based on heading level (h1 = level 1, h2 = level 2, etc.)
        const indentLevel = Math.max(0, item.level - 1); // h1 gets 0 indent, h2 gets 1, etc.
        const marginLeft = indentLevel * 16; // 16px per level

        // Different styling based on heading level
        let textStyle = "";
        switch (item.level) {
          case 1:
            textStyle = "font-bold text-gray-900 text-base";
            break;
          case 2:
            textStyle = "font-semibold text-gray-800 text-sm";
            break;
          case 3:
            textStyle = "font-medium text-gray-700 text-sm";
            break;
          case 4:
            textStyle = "text-gray-700 text-sm";
            break;
          case 5:
            textStyle = "text-gray-600 text-xs";
            break;
          case 6:
            textStyle = "text-gray-600 text-xs";
            break;
          default:
            textStyle = "text-gray-700 text-sm";
        }

        return (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className={`block hover:text-blue-600 transition-colors no-underline ${textStyle}`}
              style={{ marginLeft: `${marginLeft}px` }}
            >
              {item.title}
            </a>
          </li>
        );
      })}
    </ul>
  );
}

// Main TOC component (Server Component)
export default function OptimizedTOC({ items }: OptimizedTOCProps) {
  if (items.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 my-6">
        <div className="flex items-center mb-4">
          <svg
            className="h-5 w-5 text-blue-800 mr-2 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 10h16M4 14h16M4 18h16"
            />
          </svg>
          <span className="font-medium text-gray-800">Table of Contents</span>
        </div>
        <p className="text-sm text-gray-600">
          No headings detected on this page.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
      <div className="flex items-center mb-4">
        <svg
          className="h-5 w-5 text-blue-800 mr-2 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 10h16M4 14h16M4 18h16"
          />
        </svg>
        <span className="font-medium text-blue-800">Table of Contents</span>
      </div>
      <TocDisplay items={items} />
    </div>
  );
}
