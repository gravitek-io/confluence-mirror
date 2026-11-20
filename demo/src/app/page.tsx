import { Suspense } from "react";
import Link from "next/link";
import ConfluenceMirrorServer from "@/components/confluence/ConfluenceMirrorServer";
import ConfluenceFormDemo from "@/components/demo/ConfluenceFormDemo";

interface HomeProps {
  searchParams: Promise<{ pageId?: string; url?: string; folderId?: string }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const { pageId, url, folderId } = await searchParams;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confluence Mirror
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Display your Confluence pages as React components with TailwindCSS
            styling.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/showroom"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
            >
              🎨 View Showroom
            </Link>
            <Link
              href="/how-to"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100 transition-colors"
            >
              📖 How to Integrate
            </Link>
          </div>
        </div>

        <ConfluenceFormDemo initialPageId={pageId} />

        {/* Folder links are routed to `?folderId=` by the core package. The demo
            does not render folders: it only explains it. The space key is not
            known here, so no safe Confluence link can be built. */}
        {folderId && (
          <div className="mt-8 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-lg p-6 text-amber-900">
            <p className="font-medium">Folders are not rendered by this demo.</p>
            <p className="mt-1 text-sm">
              The link points to a Confluence folder. Open it directly in
              Confluence, or see the package documentation to list a
              folder&apos;s content with <code>getDirectChildren()</code>.
            </p>
          </div>
        )}

        {(pageId || url) && (
          <div className="mt-8 max-w-7xl mx-auto">
            <Suspense
              fallback={
                <div className="bg-white rounded-lg shadow-lg p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-4 text-gray-600">
                    Loading Confluence page...
                  </p>
                </div>
              }
            >
              <ConfluenceMirrorServer
                key={pageId || url}
                pageId={pageId}
                url={url}
                baseUrl="http://localhost:3000"
                showNavigation={true}
                navigationTitle="Child Pages"
              />
            </Suspense>
          </div>
        )}
      </div>
    </div>
  );
}
