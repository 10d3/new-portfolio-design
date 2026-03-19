"use client";

import { EditorContent, type Extension, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { createLowlight, all } from "lowlight";
import { ImageExtension } from "./extensions/image";
import { ImagePlaceholder } from "./extensions/image-placeholder";
import { SlashCommand } from "./extensions/slash-command";
import { LogoExtension } from "./extensions/logo";
import { BlockHandle, handleBlockDrop } from "./extensions/block-handle";
import { useCallback } from "react";
import { FloatingToolbar } from "./toolbars/floating-toolbar";
import { useUploadThing } from "@/lib/uploadthing";
import "./editor-block-styles.css";
import { ButtonNode } from "./extensions/button-node";
import { YouTubeNode } from "./extensions/youtube-node";
import { Editor as TiptapEditor } from "@tiptap/react";
import { VariableNode } from "./extensions/variable-node";

// Lowlight instance with all bundled languages
const lowlight = createLowlight(all);

export const Editor = ({
  content,
  onChange,
  isReadOnly,
  onCreate,
  onUpdate
}: {
  content: string;
  onChange?: (content: string) => void;
  isReadOnly?: boolean;
  onUpdate?: (editor: TiptapEditor) => void;
  onCreate?: (editor: TiptapEditor) => void;
}) => {
  const { startUpload } = useUploadThing("imageUploader", {
    onClientUploadComplete: (res) => {
      console.log(res);
      if (res && res.length > 0) {
        editor?.chain().focus().setImage({ src: res[0].ufsUrl }).run();
      }
    },
    onUploadError: (error: Error) => {
      console.error("Upload error:", error);
      alert(`ERROR! ${error.message}`);
    },
  });
  const extensions = [
    StarterKit.configure({
      orderedList: {
        HTMLAttributes: {
          class: "list-decimal",
        },
      },
      bulletList: {
        HTMLAttributes: {
          class: "list-disc",
        },
      },
      code: {
        HTMLAttributes: {
          class: "bg-accent rounded-md p-1",
        },
      },
      horizontalRule: {
        HTMLAttributes: {
          class: "my-2",
        },
      },
      // Disabled — replaced by CodeBlockLowlight below
      codeBlock: false,
      heading: {
        levels: [1, 2, 3, 4],
        HTMLAttributes: {
          class: "tiptap-heading",
        },
      },
    }),
    CodeBlockLowlight.configure({
      lowlight,
      // No defaultLanguage → lowlight auto-detects from code content
      HTMLAttributes: {
        class: "hljs not-prose",
      },
    }),
    ButtonNode,
    YouTubeNode,
    VariableNode,
    ImageExtension,
    ImagePlaceholder.configure({
      onDrop: async (files) => {
        startUpload(files);
      },
    }),
    LogoExtension.configure({
      onDrop: async (files) => {
        startUpload(files);
      },
    }),
    ...(isReadOnly
      ? []
      : [
        SlashCommand,
        Placeholder.configure({
          placeholder: ({ node }) => {
            if (node.type.name === "heading") {
              return `Heading ${node.attrs.level}`;
            }
            return "Type '/' for commands...";
          },
          showOnlyWhenEditable: true,
          showOnlyCurrent: true,
        }),
      ]),
  ];
  const editor = useEditor({
    extensions: extensions as Extension[],
    content,
    immediatelyRender: false,
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange?.(html);
      onUpdate?.(editor);
    },
    onCreate: ({ editor }) => {
      onCreate?.(editor);
    },
  });

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      if (!editor) return;
      handleBlockDrop(editor, e);
    },
    [editor]
  );

  // const wordCount = editor?.storage.characterCount?.words() ?? 0;
  // const charCount = editor?.storage.characterCount?.characters() ?? 0;

  if (!editor) {
    return null;
  }
  return (
    <div
      className={`editor-root relative w-full rounded-lg bg-card overflow-hidden ${!isReadOnly ? "border border-border" : "px-0 mx-0"
        }`}
    >
      {!isReadOnly && <div className="flex items-center gap-2 border-b border-border px-4 py-2">
        <span className="text-xs text-muted-foreground font-mono">
          Type <kbd className="px-1 py-0.5 rounded bg-muted border border-border text-[10px]">/</kbd> for commands · <span className="opacity-60">drag ⠿ to reorder</span>
        </span>
      </div>}
      <div
        onClick={() => {
          if (!isReadOnly) editor?.chain().focus().run();
        }}
        onDrop={!isReadOnly ? onDrop : undefined}
        onDragOver={!isReadOnly ? (e) => e.preventDefault() : undefined}
        className={`editor-surface bg-card ${!isReadOnly ? "min-h-[18rem] cursor-text px-12" : ""
          }`}
      >
        <div className="relative ">
          {!isReadOnly && <BlockHandle editor={editor} />}
          <EditorContent
            className="editor-content outline-none"
            editor={editor}
          />
        </div>
        {!isReadOnly && <FloatingToolbar editor={editor} />}
      </div>
    </div>
  );
};
