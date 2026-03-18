/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn, isValidUrl } from "@/lib/utils";
import {
    type CommandProps,
    type Editor,
    Node,
    type NodeViewProps,
    NodeViewWrapper,
    ReactNodeViewRenderer,
    mergeAttributes,
} from "@tiptap/react";
import { Sparkles, Link, Upload, Trash } from "lucide-react";
import { type FormEvent, useState } from "react";

export interface LogoOptions {
    HTMLAttributes: Record<string, any>;
    onDrop: (files: File[], editor: Editor) => void;
    onDropRejected?: (files: File[], editor: Editor) => void;
    onEmbed: (url: string, editor: Editor) => void;
    allowedMimeTypes?: Record<string, string[]>;
    maxSize?: number;
}

declare module "@tiptap/core" {
    interface Commands<ReturnType> {
        logo: {
            /**
             * Inserts a logo placeholder
             */
            insertLogoPlaceholder: () => ReturnType;
            /**
             * Sets a logo image from URL
             */
            setLogo: (attrs: { src: string; alt?: string }) => ReturnType;
        };
    }
}

export const LogoExtension = Node.create<LogoOptions>({
    name: "logo",

    group: "block",

    atom: true,

    addOptions() {
        return {
            HTMLAttributes: {},
            onDrop: () => { },
            onDropRejected: () => { },
            onEmbed: () => { },
        };
    },

    addAttributes() {
        return {
            src: { default: null },
            alt: { default: "Logo" },
            width: { default: 120 },
            alignment: { default: "center" },
        };
    },

    parseHTML() {
        return [{ tag: `div[data-type="${this.name}"]` }];
    },

    renderHTML({ HTMLAttributes }) {
        return [
            "div",
            mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
                "data-type": this.name,
            }),
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(LogoComponent);
    },

    addCommands() {
        return {
            insertLogoPlaceholder:
                () =>
                    (props: CommandProps) => {
                        return props.commands.insertContent({
                            type: "logo",
                        });
                    },
            setLogo:
                (attrs: { src: string; alt?: string }) =>
                    (props: CommandProps) => {
                        return props.commands.insertContent({
                            type: "logo",
                            attrs,
                        });
                    },
        };
    },
});

// ─── Logo Component ─────────────────────────────────────────────────

function LogoComponent(props: NodeViewProps) {
    const { node, editor, selected, updateAttributes, deleteNode } = props;

    const [open, setOpen] = useState(!node.attrs.src);
    const [url, setUrl] = useState("");
    const [urlError, setUrlError] = useState(false);

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        files.forEach((file) => {
            const reader = new FileReader();
            reader.onload = () => {
                const src = reader.result as string;
                updateAttributes({ src });
            };
            reader.readAsDataURL(file);
        });

        // Also trigger the upload callback for cloud upload
        if (props.extension.options.onDrop) {
            props.extension.options.onDrop(files, editor);
        }
    };

    const handleInsertEmbed = (e: FormEvent) => {
        e.preventDefault();
        const valid = isValidUrl(url);
        if (!valid) {
            setUrlError(true);
            return;
        }
        if (url !== "") {
            updateAttributes({ src: url });
            setOpen(false);
        }
    };

    const sizes = [
        { label: "S", value: 60 },
        { label: "M", value: 120 },
        { label: "L", value: 200 },
        { label: "XL", value: 300 },
    ];

    const alignments = [
        { label: "Left", value: "left" },
        { label: "Center", value: "center" },
        { label: "Right", value: "right" },
    ];

    // If no src, show the upload placeholder
    if (!node.attrs.src) {
        return (
            <NodeViewWrapper className="w-full my-2">
                <Popover modal open={open} onOpenChange={setOpen}>
                    <PopoverTrigger
                        onClick={() => setOpen(true)}
                        asChild
                        className="w-full"
                    >
                        <div
                            className={cn(
                                "flex cursor-pointer items-center gap-3 rounded-md bg-accent p-2 py-3 text-sm text-accent-foreground transition-colors hover:bg-secondary",
                                selected && "bg-primary/10 hover:bg-primary/20"
                            )}
                        >
                            <Sparkles className="h-5 w-5" />
                            Add a logo
                        </div>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-[400px] px-0 py-2"
                        onPointerDownOutside={() => setOpen(false)}
                        onEscapeKeyDown={() => setOpen(false)}
                    >
                        <Tabs defaultValue="upload" className="px-3">
                            <TabsList>
                                <TabsTrigger className="px-2 py-1 text-sm" value="upload">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload
                                </TabsTrigger>
                                <TabsTrigger className="px-2 py-1 text-sm" value="url">
                                    <Link className="mr-2 h-4 w-4" />
                                    Embed link
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="upload">
                                <div className="my-2 rounded-md border border-dashed text-sm transition-colors hover:bg-secondary">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileInputChange}
                                        className="hidden"
                                        id="logo-file-input"
                                    />
                                    <label
                                        htmlFor="logo-file-input"
                                        className="flex h-24 w-full cursor-pointer flex-col items-center justify-center text-center"
                                    >
                                        <Sparkles className="mx-auto mb-2 h-5 w-5" />
                                        Upload your logo
                                    </label>
                                </div>
                            </TabsContent>
                            <TabsContent value="url">
                                <form onSubmit={handleInsertEmbed}>
                                    <Input
                                        value={url}
                                        onChange={(e) => {
                                            setUrl(e.target.value);
                                            if (urlError) setUrlError(false);
                                        }}
                                        placeholder="Paste the logo image URL..."
                                    />
                                    {urlError && (
                                        <p className="py-1.5 text-xs text-destructive">
                                            Please enter a valid URL
                                        </p>
                                    )}
                                    <Button
                                        onClick={handleInsertEmbed}
                                        type="button"
                                        size="sm"
                                        className="my-2 h-8 w-full p-2 text-xs"
                                    >
                                        Add Logo
                                    </Button>
                                </form>
                            </TabsContent>
                        </Tabs>
                    </PopoverContent>
                </Popover>
            </NodeViewWrapper>
        );
    }

    // If we have a src, show the logo with controls
    return (
        <NodeViewWrapper className="w-full my-3">
            <div
                className={cn(
                    "group relative flex",
                    node.attrs.alignment === "left" && "justify-start",
                    node.attrs.alignment === "center" && "justify-center",
                    node.attrs.alignment === "right" && "justify-end"
                )}
            >
                <div className="relative">
                    <img
                        src={node.attrs.src}
                        alt={node.attrs.alt}
                        style={{ width: node.attrs.width, height: "auto" }}
                        className={cn(
                            "rounded-md object-contain transition-all",
                            selected && "ring-2 ring-primary ring-offset-2"
                        )}
                    />

                    {/* Controls overlay */}
                    {editor?.isEditable && (
                        <div
                            className={cn(
                                "floating-toolbar absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 transition-opacity",
                                "group-hover:opacity-100",
                                selected && "opacity-100"
                            )}
                        >
                            {/* Size buttons */}
                            {sizes.map((size) => (
                                <button
                                    key={size.label}
                                    type="button"
                                    className={cn(
                                        "floating-toolbar-button !w-auto px-2 text-[11px] font-medium",
                                        node.attrs.width === size.value && "floating-toolbar-button--active"
                                    )}
                                    onClick={() => updateAttributes({ width: size.value })}
                                >
                                    {size.label}
                                </button>
                            ))}
                            <div className="floating-toolbar-separator" />
                            {/* Alignment buttons */}
                            {alignments.map((align) => (
                                <button
                                    key={align.value}
                                    type="button"
                                    className={cn(
                                        "floating-toolbar-button !w-auto px-2 text-[11px] font-medium",
                                        node.attrs.alignment === align.value && "floating-toolbar-button--active"
                                    )}
                                    onClick={() => updateAttributes({ alignment: align.value })}
                                >
                                    {align.label}
                                </button>
                            ))}
                            <div className="floating-toolbar-separator" />
                            <button
                                type="button"
                                className="floating-toolbar-button !text-destructive hover:!text-destructive hover:!bg-destructive/10"
                                onClick={() => deleteNode()}
                            >
                                <Trash className="size-3.5" strokeWidth={2} />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </NodeViewWrapper>
    );
}
