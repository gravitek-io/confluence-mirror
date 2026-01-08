import { ConfluenceClient } from "confluence-mirror-core";
import React from "react";
import ConfluencePage from "./ConfluencePage";
import NavigationTreeServer from "./NavigationTreeServer";

// Props du composant
interface ConfluenceMirrorServerProps {
  pageId?: string;
  url?: string;
  baseUrl?: string; // URL de base pour la navigation
  showNavigation?: boolean;
  navigationTitle?: string;
  children?: React.ReactNode;
}

/**
 * ConfluenceMirrorServer - Version Server Component
 * Composition de composants pour afficher une page Confluence avec navigation et TOC
 * Tous les appels API sont faits côté serveur
 */
export default async function ConfluenceMirrorServer({
  pageId,
  url,
  baseUrl,
  showNavigation = true,
  navigationTitle = "Child Pages",
  children,
}: ConfluenceMirrorServerProps) {
  // Si des children sont fournis, on les affiche au lieu du layout par défaut
  if (children) {
    return <div className="confluence-mirror-server">{children}</div>;
  }

  // Résolution du pageId si URL fournie
  let resolvedPageId = pageId;
  if (url && !pageId) {
    resolvedPageId = ConfluenceClient.extractPageIdFromUrl(url) || undefined;
  }

  if (!resolvedPageId) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-red-800 mb-2">
          Configuration Error
        </h3>
        <p className="text-red-700">
          Either pageId or a valid Confluence URL must be provided.
        </p>
      </div>
    );
  }

  return (
    <div className="confluence-mirror-server">
      {showNavigation ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar gauche avec navigation */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <NavigationTreeServer
                pageId={resolvedPageId}
                baseUrl={baseUrl}
                title={navigationTitle}
              />
            </div>
          </div>

          {/* Contenu principal */}
          <div className="lg:col-span-3">
            <ConfluencePage pageId={resolvedPageId} showHeader={true} />
          </div>
        </div>
      ) : (
        /* Sans navigation - pleine largeur */
        <ConfluencePage pageId={resolvedPageId} showHeader={true} />
      )}
    </div>
  );
}
