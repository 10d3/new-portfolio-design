/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, {
    type SuggestionOptions,
    type SuggestionProps,
    type SuggestionKeyDownProps,
} from "@tiptap/suggestion";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import {
    forwardRef,
    useCallback,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import {
    Heading1,
    Heading2,
    Heading3,
    Heading4,
    List,
    ListOrdered,
    Quote,
    Code2,
    Minus,
    ImagePlus,
    Type,
    Sparkles,
    RectangleHorizontal,
    Youtube,
} from "lucide-react";
import { cn } from "@/lib/utils";

export interface SlashCommandItem {
    title: string;
    description: string;
    icon: React.ReactNode;
    keywords?: string[];
    command: (props: { editor: any; range: any }) => void;
}

const getSuggestionItems = (): SlashCommandItem[] => [
    {
        title: "Text",
        description: "Plain text paragraph",
        icon: <Type className="size-4" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setParagraph().run();
        },
    },
    {
        title: "Heading 1",
        description: "Large section heading",
        icon: <Heading1 className="size-4" />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 1 })
                .run();
        },
    },
    {
        title: "Heading 2",
        description: "Medium section heading",
        icon: <Heading2 className="size-4" />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 2 })
                .run();
        },
    },
    {
        title: "Heading 3",
        description: "Small section heading",
        icon: <Heading3 className="size-4" />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 3 })
                .run();
        },
    },
    {
        title: "Heading 4",
        description: "Smallest section heading",
        icon: <Heading4 className="size-4" />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .setNode("heading", { level: 4 })
                .run();
        },
    },
    {
        title: "Bullet List",
        description: "Unordered list with bullets",
        icon: <List className="size-4" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBulletList().run();
        },
    },
    {
        title: "Numbered List",
        description: "Ordered list with numbers",
        icon: <ListOrdered className="size-4" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleOrderedList().run();
        },
    },
    {
        title: "Blockquote",
        description: "Quotation block",
        icon: <Quote className="size-4" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleBlockquote().run();
        },
    },
    {
        title: "Code Block",
        description: "Code snippet with syntax",
        icon: <Code2 className="size-4" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
        },
    },
    {
        title: "Divider",
        description: "Horizontal separator line",
        icon: <Minus className="size-4" />,
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).setHorizontalRule().run();
        },
    },
    {
        title: "Image",
        description: "Upload or embed an image",
        icon: <ImagePlus className="size-4" />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertImagePlaceholder()
                .run();
        },
    },
    {
        title: "Logo",
        description: "Upload a logo with size presets",
        icon: <Sparkles className="size-4" />,
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertLogoPlaceholder()
                .run();
        },
    },
    {
        title: "Button",
        description: "Customisable interactive button",
        icon: <RectangleHorizontal className="size-4" />,
        keywords: ["button", "btn", "cta", "link", "action"],
        command: ({ editor, range }) => {
            editor.chain().focus().deleteRange(range).insertContent({ type: "buttonNode", attrs: {} }).run();
        }
    },
    {
        title: "YouTube",
        description: "Embed a YouTube video player",
        icon: <Youtube className="size-4" />,
        keywords: ["youtube", "video", "embed", "yt", "player", "watch"],
        command: ({ editor, range }) => {
            editor
                .chain()
                .focus()
                .deleteRange(range)
                .insertContent({ type: "youtubeNode", attrs: { src: "" } })
                .run();
        },
    },
];

// ─── Command List Component ─────────────────────────────────────────────

export interface CommandListRef {
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
}

interface CommandListProps {
    items: SlashCommandItem[];
    command: (item: SlashCommandItem) => void;
}

const CommandList = forwardRef<CommandListRef, CommandListProps>(
    ({ items, command }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);
        const containerRef = useRef<HTMLDivElement>(null);

        const selectItem = useCallback(
            (index: number) => {
                const item = items[index];
                if (item) {
                    command(item);
                }
            },
            [items, command]
        );

        useEffect(() => {
            setSelectedIndex(0);
        }, [items]);

        // Scroll selected item into view
        useEffect(() => {
            const container = containerRef.current;
            if (!container) return;
            const selected = container.children[selectedIndex] as HTMLElement;
            if (selected) {
                selected.scrollIntoView({ block: "nearest" });
            }
        }, [selectedIndex]);

        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }: SuggestionKeyDownProps) => {
                if (event.key === "ArrowUp") {
                    setSelectedIndex((prev) =>
                        prev <= 0 ? items.length - 1 : prev - 1
                    );
                    return true;
                }
                if (event.key === "ArrowDown") {
                    setSelectedIndex((prev) =>
                        prev >= items.length - 1 ? 0 : prev + 1
                    );
                    return true;
                }
                if (event.key === "Enter") {
                    selectItem(selectedIndex);
                    return true;
                }
                return false;
            },
        }));

        if (items.length === 0) {
            return (
                <div className="slash-command-menu">
                    <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                        No results found
                    </div>
                </div>
            );
        }

        return (
            <div className="slash-command-menu" ref={containerRef} role="listbox" aria-label="Insert block">
                <div className="slash-command-menu-header">Insert</div>
                {items.map((item, index) => (
                    <button
                        key={item.title}
                        type="button"
                        role="option"
                        aria-selected={index === selectedIndex}
                        className={cn(
                            "slash-command-item",
                            index === selectedIndex && "slash-command-item--active"
                        )}
                        onClick={() => selectItem(index)}
                        onMouseEnter={() => setSelectedIndex(index)}
                    >
                        <div className="slash-command-item-icon">{item.icon}</div>
                        <div className="slash-command-item-content">
                            <span className="slash-command-item-title">{item.title}</span>
                            <span className="slash-command-item-description">
                                {item.description}
                            </span>
                        </div>
                    </button>
                ))}
            </div>
        );
    }
);

CommandList.displayName = "CommandList";

// ─── Suggestion Configuration ───────────────────────────────────────────

const renderSuggestion = (): Omit<
    SuggestionOptions<SlashCommandItem>["render"],
    "onBeforeStart"
> & {
    onStart: (props: SuggestionProps<SlashCommandItem>) => void;
    onUpdate: (props: SuggestionProps<SlashCommandItem>) => void;
    onKeyDown: (props: SuggestionKeyDownProps) => boolean;
    onExit: () => void;
} => {
    let component: ReactRenderer<CommandListRef> | null = null;
    let popup: TippyInstance | null = null;

    return {
        onStart: (props: SuggestionProps<SlashCommandItem>) => {
            component = new ReactRenderer(CommandList, {
                props,
                editor: props.editor,
            });

            if (!props.clientRect) return;

            popup = tippy(document.body, {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                animation: "shift-away",
                maxWidth: "none",
            });
        },

        onUpdate(props: SuggestionProps<SlashCommandItem>) {
            component?.updateProps(props);
            if (popup && props.clientRect) {
                popup.setProps({
                    getReferenceClientRect: props.clientRect as () => DOMRect,
                });
            }
        },

        onKeyDown(props: SuggestionKeyDownProps) {
            if (props.event.key === "Escape") {
                popup?.hide();
                return true;
            }
            return component?.ref?.onKeyDown(props) ?? false;
        },

        onExit() {
            popup?.destroy();
            component?.destroy();
        },
    };
};

// ─── Slash Command Extension ────────────────────────────────────────────

export const SlashCommand = Extension.create({
    name: "slash-command",

    addOptions() {
        return {
            suggestion: {
                char: "/",
                command: ({
                    editor,
                    range,
                    props,
                }: {
                    editor: any;
                    range: any;
                    props: SlashCommandItem;
                }) => {
                    props.command({ editor, range });
                },
            } as Partial<SuggestionOptions<SlashCommandItem>>,
        };
    },

    addProseMirrorPlugins() {
        return [
            Suggestion<SlashCommandItem>({
                editor: this.editor,
                ...this.options.suggestion,
                items: ({ query }: { query: string }) => {
                    const q = query.toLowerCase();
                    return getSuggestionItems().filter((item) =>
                        item.title.toLowerCase().includes(q) ||
                        (item.keywords && item.keywords.some((kw) => kw.includes(q)))
                    );
                },
                render: renderSuggestion,
            }),
        ];
    },
});
