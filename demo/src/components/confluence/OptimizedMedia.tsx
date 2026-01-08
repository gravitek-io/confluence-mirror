"use client";

import React from "react";
import Image from "next/image";

interface OptimizedMediaProps {
  url: string;
  type: "image" | "video" | "unknown" | "file";
  alt: string;
  pageId: string;
  fileName?: string;
}

// Optimized media component with pre-processed URLs
export default function OptimizedMedia({
  url,
  type,
  alt,
  pageId,
  fileName,
}: OptimizedMediaProps) {
  // Handle special case for showroom page
  if (pageId === "showroom") {
    const showroomImageUrl =
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80";

    const getFullSizeUrl = (imageUrl: string) => {
      return imageUrl.replace("w=1200&q=80", "w=2400&q=90");
    };

    return (
      <div className="max-w-full overflow-hidden flex justify-center">
        <div
          className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
          onClick={() =>
            window.open(
              getFullSizeUrl(showroomImageUrl),
              "_blank",
              "noopener,noreferrer"
            )
          }
          title="Click to open full size image in new tab"
        >
          <Image
            src={showroomImageUrl}
            alt={alt}
            className="rounded-lg shadow-sm hover:shadow-lg transition-shadow max-w-full h-auto"
            unoptimized={true}
            width={1000}
            height={800}
            style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
          />
        </div>
      </div>
    );
  }

  // Render video
  if (type === "video") {
    return (
      <div className="max-w-full overflow-hidden flex justify-center my-6">
        <video
          className="rounded-lg shadow-sm max-w-full h-auto"
          controls
          preload="metadata"
        >
          <source src={url} />
          <p className="text-gray-600">
            Your browser does not support the video tag.
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline ml-1"
            >
              Download the video
            </a>
          </p>
        </video>
      </div>
    );
  }

  // Render file attachment (documents, presentations, etc.)
  if (type === "file" || type === "unknown") {
    const getFileIcon = (filename?: string) => {
      if (!filename) return "📄";
      const lower = filename.toLowerCase();
      if (lower.endsWith(".pdf")) return "📕";
      if (lower.endsWith(".ppt") || lower.endsWith(".pptx")) return "📊";
      if (lower.endsWith(".doc") || lower.endsWith(".docx")) return "📘";
      if (lower.endsWith(".xls") || lower.endsWith(".xlsx")) return "📗";
      if (lower.endsWith(".zip") || lower.endsWith(".rar")) return "📦";
      return "📄";
    };

    const displayName = fileName || alt || "File attachment";
    const icon = getFileIcon(fileName);

    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 hover:border-gray-300 transition-colors max-w-md"
      >
        <span className="text-3xl">{icon}</span>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-gray-900 truncate">
            {displayName}
          </span>
          <span className="text-xs text-gray-500">Click to open or download</span>
        </div>
        <svg
          className="w-4 h-4 text-gray-400 flex-shrink-0"
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
      </a>
    );
  }

  // Render image (default)
  const getFullSizeUrl = (imageUrl: string) => {
    // For Confluence images, return the same URL (already full size)
    return imageUrl;
  };

  return (
    <div className="max-w-full overflow-hidden flex justify-center">
      <div
        className="cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
        onClick={() =>
          window.open(getFullSizeUrl(url), "_blank", "noopener,noreferrer")
        }
        title="Click to open full size image in new tab"
      >
        <Image
          src={url}
          alt={alt}
          className="rounded-lg shadow-sm hover:shadow-lg transition-shadow max-w-full h-auto"
          unoptimized={true}
          width={1000}
          height={800}
          style={{ width: 'auto', height: 'auto', maxWidth: '100%' }}
        />
      </div>
    </div>
  );
}
