import Link from "next/link";
import ShowroomContent from "@/components/demo/ShowroomContent";
import ShowroomNavigation from "@/components/demo/ShowroomNavigation";
import { ADFDocument } from "@gravitek/confluence-mirror-core";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showroom - Confluence Mirror',
  description: 'Showcase of all supported Confluence ADF elements',
};

export default function ShowroomPage() {
  // Demo ADF document with all supported types
  const showroomDocument: ADFDocument = {
    version: 1,
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [{ type: "text", text: "🎨 Confluence to React - Showroom" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This page showcases all the Confluence elements supported by our application.",
          },
        ],
      },
      {
        type: "extension",
        attrs: {
          extensionType: "com.atlassian.confluence.macro.core",
          extensionKey: "toc",
        },
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Text Formatting" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Normal text, " },
          { type: "text", text: "bold text", marks: [{ type: "strong" }] },
          { type: "text", text: ", " },
          { type: "text", text: "italic text", marks: [{ type: "em" }] },
          { type: "text", text: ", " },
          {
            type: "text",
            text: "underlined text",
            marks: [{ type: "underline" }],
          },
          { type: "text", text: ", " },
          {
            type: "text",
            text: "strikethrough text",
            marks: [{ type: "strike" }],
          },
          { type: "text", text: " and " },
          { type: "text", text: "inline code", marks: [{ type: "code" }] },
          { type: "text", text: "." },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Here is a " },
          {
            type: "text",
            text: "link to Confluence",
            marks: [
              {
                type: "link",
                attrs: {
                  href: "https://www.atlassian.com/software/confluence",
                },
              },
            ],
          },
          { type: "text", text: "." },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Lists" }],
      },
      {
        type: "bulletList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "First bullet list item" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second item" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Third item with content" }],
              },
            ],
          },
        ],
      },
      {
        type: "orderedList",
        content: [
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "First numbered item" }],
              },
            ],
          },
          {
            type: "listItem",
            content: [
              {
                type: "paragraph",
                content: [{ type: "text", text: "Second numbered item" }],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Special Confluence Elements" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Status: " },
          { type: "status", attrs: { text: "In Progress", color: "blue" } },
          { type: "text", text: " " },
          { type: "status", attrs: { text: "Done", color: "green" } },
          { type: "text", text: " " },
          { type: "status", attrs: { text: "Urgent", color: "red" } },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Date: " },
          { type: "date", attrs: { timestamp: 1692720000000 } }, // Fixed date: Aug 22, 2023
          { type: "text", text: " and mention: " },
          {
            type: "mention",
            attrs: { text: "John Doe", displayName: "John Doe" },
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Emojis: " },
          { type: "emoji", attrs: { text: "😊" } },
          { type: "text", text: " " },
          { type: "emoji", attrs: { text: "🚀" } },
          { type: "text", text: " " },
          { type: "emoji", attrs: { text: "✅" } },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Panels" }],
      },
      {
        type: "panel",
        attrs: { panelType: "info" },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is an information panel with an icon.",
              },
            ],
          },
        ],
      },
      {
        type: "panel",
        attrs: { panelType: "warning" },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is a warning panel." }],
          },
        ],
      },
      {
        type: "panel",
        attrs: { panelType: "error" },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is an error panel." }],
          },
        ],
      },
      {
        type: "panel",
        attrs: { panelType: "success" },
        content: [
          {
            type: "paragraph",
            content: [{ type: "text", text: "This is a success panel." }],
          },
        ],
      },
      {
        type: "panel",
        attrs: { panelType: "note" },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a note panel. It provides additional information or context.",
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Quotes and Code" }],
      },
      {
        type: "blockquote",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a block quote. It can contain multiple lines and is styled with a left border.",
              },
            ],
          },
        ],
      },
      {
        type: "codeBlock",
        attrs: { language: "javascript" },
        content: [
          {
            type: "text",
            text: 'function example() {\n  console.log("Hello, world!");\n  return "Confluence to React";\n}',
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Table" }],
      },
      {
        type: "table",
        content: [
          {
            type: "tableRow",
            content: [
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Element Type" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Support" }],
                  },
                ],
              },
              {
                type: "tableHeader",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Description" }],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Formatted Text" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "status",
                        attrs: { text: "Complete", color: "green" },
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "Bold, italic, underline, code, links",
                      },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Lists" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "status",
                        attrs: { text: "Complete", color: "green" },
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Bulleted and numbered lists" },
                    ],
                  },
                ],
              },
            ],
          },
          {
            type: "tableRow",
            content: [
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [{ type: "text", text: "Images" }],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "status",
                        attrs: { text: "Hybrid", color: "blue" },
                      },
                    ],
                  },
                ],
              },
              {
                type: "tableCell",
                content: [
                  {
                    type: "paragraph",
                    content: [
                      { type: "text", text: "Via ADF + Storage mapping" },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Cards and Links" }],
      },
      {
        type: "paragraph",
        content: [
          { type: "text", text: "Here is an inline card: " },
          {
            type: "inlineCard",
            attrs: {
              url: "https://www.atlassian.com/software/confluence",
              title: "Confluence by Atlassian",
            },
          },
        ],
      },
      {
        type: "rule",
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Images and Media" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Confluence images are supported via our hybrid approach that combines ADF and Storage for optimal rendering.",
          },
        ],
      },
      {
        type: "mediaSingle",
        attrs: { layout: "center" },
        content: [
          {
            type: "media",
            attrs: {
              id: "placeholder-image",
              type: "file",
              collection: "contentId-showroom",
              alt: "Image de démonstration",
            },
          },
        ],
      },
      {
        type: "caption",
        content: [{ type: "text", text: "Centered italic image caption" }],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Confluence Extensions" }],
      },
      {
        type: "extension",
        attrs: {
          extensionType: "com.atlassian.confluence.macro.example",
          extensionKey: "demo-macro",
        },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "Content of a custom Confluence extension.",
              },
            ],
          },
        ],
      },
      {
        type: "bodiedExtension",
        attrs: {
          extensionType: "com.atlassian.confluence.macro.note",
          extensionKey: "note-macro",
          title: "Information Note",
        },
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: "This is a bodied extension with custom content inside. It can contain any ADF content including ",
              },
              { type: "text", text: "bold text", marks: [{ type: "strong" }] },
              { type: "text", text: " and links." },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Task Lists" }],
      },
      {
        type: "taskList",
        attrs: { localId: "task-list-1" },
        content: [
          {
            type: "taskItem",
            attrs: { localId: "task-1", state: "DONE" },
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Completed task - this one is done!" },
                ],
              },
            ],
          },
          {
            type: "taskItem",
            attrs: { localId: "task-2", state: "TODO" },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Pending task - still needs to be completed",
                  },
                ],
              },
            ],
          },
          {
            type: "taskItem",
            attrs: { localId: "task-3", state: "TODO" },
            content: [
              {
                type: "paragraph",
                content: [
                  { type: "text", text: "Another task with " },
                  { type: "text", text: "formatting", marks: [{ type: "em" }] },
                  { type: "text", text: " and " },
                  {
                    type: "text",
                    text: "links",
                    marks: [
                      { type: "link", attrs: { href: "https://example.com" } },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [{ type: "text", text: "Layout and Columns" }],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Confluence supports multi-column layouts for organizing content side by side:",
          },
        ],
      },
      {
        type: "layoutSection",
        content: [
          {
            type: "layoutColumn",
            attrs: { width: 50 },
            content: [
              {
                type: "panel",
                attrs: { panelType: "info" },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "This is the left column (50% width). You can put any content here including text, images, panels, and more.",
                      },
                    ],
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Additional content in the left column.",
                  },
                ],
              },
            ],
          },
          {
            type: "layoutColumn",
            attrs: { width: 50 },
            content: [
              {
                type: "panel",
                attrs: { panelType: "success" },
                content: [
                  {
                    type: "paragraph",
                    content: [
                      {
                        type: "text",
                        text: "This is the right column (50% width). Layouts are perfect for comparing information or creating structured content.",
                      },
                    ],
                  },
                ],
              },
              {
                type: "bulletList",
                content: [
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [
                          { type: "text", text: "Lists work great in columns" },
                        ],
                      },
                    ],
                  },
                  {
                    type: "listItem",
                    content: [
                      {
                        type: "paragraph",
                        content: [{ type: "text", text: "Responsive design" }],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [{ type: "text", text: "Three-column layout example:" }],
      },
      {
        type: "layoutSection",
        content: [
          {
            type: "layoutColumn",
            attrs: { width: 33 },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Column 1 (33%)",
                    marks: [{ type: "strong" }],
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Perfect for feature lists or step-by-step guides.",
                  },
                ],
              },
            ],
          },
          {
            type: "layoutColumn",
            attrs: { width: 33 },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Column 2 (33%)",
                    marks: [{ type: "strong" }],
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Great for organizing related information side by side.",
                  },
                ],
              },
            ],
          },
          {
            type: "layoutColumn",
            attrs: { width: 33 },
            content: [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Column 3 (33%)",
                    marks: [{ type: "strong" }],
                  },
                ],
              },
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "Responsive design ensures it works on all devices.",
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "This page demonstrates all the features currently supported by our Confluence to React application.",
          },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Confluence Mirror - Showroom
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            This page showcases all the Confluence elements supported by our
            application.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>

        <div className="grid grid-cols-4 gap-6">
          {/* Navigation Column - Left */}
          <div className="col-span-1">
            <ShowroomNavigation />
          </div>

          {/* Content Column - Right */}
          <div className="col-span-3">
            <div className="bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                      Showroom - Supported ADF Types
                    </h1>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Demo Page</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md">
                      ✨ Showroom
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <ShowroomContent document={showroomDocument} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
