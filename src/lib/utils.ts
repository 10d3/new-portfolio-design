import { twMerge } from "tailwind-merge";
import { clsx, type ClassValue } from "clsx";
import type { Editor } from "@tiptap/react";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function formatDate(date: string): string {
    return new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });
}
/** Base URL for the site — used in sitemaps, OG tags, etc. */
export const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://amherley.dev";

export function isValidUrl(url: string): boolean {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

/** CSS class applied to node wrappers when they are selected in the editor. */
export const NODE_HANDLES_SELECTED_STYLE_CLASSNAME = "node-selected";

/**
 * Duplicates the currently selected node in the Tiptap editor,
 * inserting a copy immediately after it.
 */
export function duplicateContent(editor: Editor): void {
    const { view, state } = editor;
    const { selection } = state;
    const { $anchor } = selection;

    const node = $anchor.node();
    const nodeStart = $anchor.before($anchor.depth);
    const nodeEnd = nodeStart + node.nodeSize;

    editor
        .chain()
        .focus()
        .insertContentAt(nodeEnd, node.toJSON())
        .run();

    view.dispatch(view.state.tr.scrollIntoView());
}