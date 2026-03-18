"use client";

import { BubbleMenu } from "@tiptap/react/menus";
import type { Editor } from "@tiptap/react";
import { cn } from "@/lib/utils";
import {
    Bold,
    Italic,
    Strikethrough,
    Code,
    Heading1,
    Heading2,
    Heading3,
    List,
    ListOrdered,
    Braces,
    Minus,
    Quote,
    WrapText,
    Undo2,
    Redo2,
    ImagePlus,
    ChevronDown,
    Type,
} from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface FloatingToolbarProps {
    editor: Editor;
}

interface ToolItem {
    icon: React.ElementType;
    title: string;
    shortcut?: string;
    action: () => void;
    isActive: () => boolean;
    disabled?: () => boolean;
}

/* ── Separator ── */
function ToolSeparator() {
    return <div className="floating-toolbar-separator" aria-hidden="true" />;
}

/* ── Icon button ── */
function ToolButton({ item }: { item: ToolItem }) {
    const isDisabled = item.disabled?.() ?? false;
    const active = item.isActive();

    return (
        <button
            type="button"
            onClick={item.action}
            disabled={isDisabled}
            title={item.shortcut ? `${item.title} (${item.shortcut})` : item.title}
            aria-label={item.title}
            aria-pressed={active}
            className={cn(
                "floating-toolbar-button",
                active && "floating-toolbar-button--active"
            )}
        >
            <item.icon className="size-3.5" strokeWidth={active ? 2.5 : 2} />
        </button>
    );
}

/* ── Heading picker dropdown ── */
const HEADING_LEVELS = [
    { level: 1 as const, icon: Heading1, label: "Heading 1" },
    { level: 2 as const, icon: Heading2, label: "Heading 2" },
    { level: 3 as const, icon: Heading3, label: "Heading 3" },
];

function HeadingPicker({ editor }: { editor: Editor }) {
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const activeLevel = HEADING_LEVELS.find((h) =>
        editor.isActive("heading", { level: h.level })
    );
    const CurrentIcon = activeLevel?.icon ?? Type;

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!dropdownRef.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                aria-label="Set heading level"
                aria-expanded={open}
                className={cn(
                    "floating-toolbar-button",
                    "!w-auto gap-0.5 px-1.5",
                    activeLevel && "floating-toolbar-button--active"
                )}
            >
                <CurrentIcon className="size-3.5" strokeWidth={activeLevel ? 2.5 : 2} />
                <ChevronDown className="size-2.5 opacity-60" strokeWidth={2} />
            </button>

            {open && (
                <div className="heading-picker">
                    {/* Paragraph option */}
                    <button
                        type="button"
                        onClick={() => {
                            editor.chain().focus().setParagraph().run();
                            setOpen(false);
                        }}
                        className={cn(
                            "heading-picker-item",
                            !activeLevel && "heading-picker-item--active"
                        )}
                    >
                        <Type className="size-4" strokeWidth={1.75} />
                        <span>Paragraph</span>
                    </button>

                    {HEADING_LEVELS.map(({ level, icon: Icon, label }) => {
                        const isActive = editor.isActive("heading", { level });
                        return (
                            <button
                                key={level}
                                type="button"
                                onClick={() => {
                                    editor.chain().focus().setHeading({ level }).run();
                                    setOpen(false);
                                }}
                                className={cn(
                                    "heading-picker-item",
                                    isActive && "heading-picker-item--active"
                                )}
                            >
                                <Icon className="size-4" strokeWidth={1.75} />
                                <span
                                    style={{
                                        fontSize: level === 1 ? "1rem" : level === 2 ? "0.875rem" : "0.8125rem",
                                        fontWeight: level <= 2 ? 600 : 500,
                                    }}
                                >
                                    {label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── Main floating toolbar ── */
export function FloatingToolbar({ editor }: FloatingToolbarProps) {
    const tools: (ToolItem | "separator")[] = [
        // ─── History ───────────────────────────────────
        {
            icon: Undo2,
            title: "Undo",
            action: () => editor.chain().focus().undo().run(),
            isActive: () => false,
            disabled: () => !editor.can().undo(),
        },
        {
            icon: Redo2,
            title: "Redo",
            action: () => editor.chain().focus().redo().run(),
            isActive: () => false,
            disabled: () => !editor.can().redo(),
        },

        "separator",

        // ─── Inline formatting ─────────────────────────
        {
            icon: Bold,
            title: "Bold",
            shortcut: "⌘B",
            action: () => editor.chain().focus().toggleBold().run(),
            isActive: () => editor.isActive("bold"),
        },
        {
            icon: Italic,
            title: "Italic",
            shortcut: "⌘I",
            action: () => editor.chain().focus().toggleItalic().run(),
            isActive: () => editor.isActive("italic"),
        },
        {
            icon: Strikethrough,
            title: "Strikethrough",
            shortcut: "⌘⇧X",
            action: () => editor.chain().focus().toggleStrike().run(),
            isActive: () => editor.isActive("strike"),
        },

        "separator",

        // ─── Lists ─────────────────────────────────────
        {
            icon: List,
            title: "Bullet List",
            action: () => editor.chain().focus().toggleBulletList().run(),
            isActive: () => editor.isActive("bulletList"),
        },
        {
            icon: ListOrdered,
            title: "Ordered List",
            action: () => editor.chain().focus().toggleOrderedList().run(),
            isActive: () => editor.isActive("orderedList"),
        },

        "separator",

        // ─── Code & blocks ─────────────────────────────
        {
            icon: Code,
            title: "Inline Code",
            shortcut: "⌘E",
            action: () => editor.chain().focus().toggleCode().run(),
            isActive: () => editor.isActive("code"),
        },
        {
            icon: Braces,
            title: "Code Block",
            action: () => editor.chain().focus().toggleCodeBlock().run(),
            isActive: () => editor.isActive("codeBlock"),
        },
        {
            icon: Quote,
            title: "Blockquote",
            action: () => editor.chain().focus().toggleBlockquote().run(),
            isActive: () => editor.isActive("blockquote"),
        },
        {
            icon: Minus,
            title: "Horizontal Rule",
            action: () => editor.chain().focus().setHorizontalRule().run(),
            isActive: () => false,
        },
        {
            icon: WrapText,
            title: "Hard Break",
            action: () => editor.chain().focus().setHardBreak().run(),
            isActive: () => false,
        },
        {
            icon: ImagePlus,
            title: "Image",
            action: () => editor.chain().focus().insertImagePlaceholder().run(),
            isActive: () => false,
        },
    ];

    return (
        <BubbleMenu
            editor={editor}
            options={{
                placement: "top",
                offset: 10,
                shift: true,
                flip: true,
            }}
            shouldShow={({ editor, state }) => {
                const { selection } = state;
                if (selection.empty) return false;
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                if ((selection as any).node) return false;
                if (editor.isActive("codeBlock")) return false;
                return true;
            }}
        >
            <div
                className="floating-toolbar"
                role="toolbar"
                aria-label="Text formatting"
            >
                {/* Heading picker — leftmost */}
                <HeadingPicker editor={editor} />
                <ToolSeparator />

                {tools.map((item, i) => {
                    if (item === "separator") return <ToolSeparator key={`sep-${i}`} />;
                    return <ToolButton key={item.title} item={item} />;
                })}
            </div>
        </BubbleMenu>
    );
}
