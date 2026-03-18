"use client";

import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper } from "@tiptap/react";
import type { NodeViewProps } from "@tiptap/react";
import { useState, useRef, useEffect } from "react";

/* ── Variable chip NodeView ── */
function VariableChipView({ node, updateAttributes, deleteNode, selected }: NodeViewProps) {
    const name: string = node.attrs.name ?? "variable";
    const fallback: string = node.attrs.fallback ?? "";
    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState(name);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (editing) {
            inputRef.current?.focus();
            inputRef.current?.select();
        }
    }, [editing]);

    const commit = () => {
        const trimmed = draft.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
        if (trimmed) updateAttributes({ name: trimmed });
        else setDraft(name);
        setEditing(false);
    };

    return (
        <NodeViewWrapper
            as="span"
            className="variable-chip-wrapper"
            data-selected={selected ? "true" : undefined}
        >
            {editing ? (
                <span className="variable-chip variable-chip--editing">
                    <span className="variable-chip-brace">{"{{ "}</span>
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commit}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") { e.preventDefault(); commit(); }
                            if (e.key === "Escape") { setDraft(name); setEditing(false); }
                            e.stopPropagation();
                        }}
                        onClick={(e) => e.stopPropagation()}
                        onMouseDown={(e) => e.stopPropagation()}
                        className="variable-chip-input"
                        style={{ width: `${Math.max(draft.length, 2) + 1}ch` }}
                        spellCheck={false}
                    />
                    <span className="variable-chip-brace">{" }}"}</span>
                </span>
            ) : (
                <span
                    className="variable-chip"
                    data-selected={selected ? "true" : undefined}
                    title={fallback ? `Fallback: "${fallback}"` : `Variable: ${name}`}
                    onDoubleClick={(e) => {
                        e.preventDefault();
                        setDraft(name);
                        setEditing(true);
                    }}
                    contentEditable={false}
                >
                    <span className="variable-chip-brace">{"{{ "}</span>
                    <span className="variable-chip-name">{name}</span>
                    <span className="variable-chip-brace">{" }}"}</span>
                </span>
            )}
        </NodeViewWrapper>
    );
}

/* ── Tiptap Node definition ── */
export const VariableNode = Node.create({
    name: "variableNode",
    group: "inline",
    inline: true,
    atom: true,
    selectable: true,
    draggable: false,

    addAttributes() {
        return {
            name: { default: "variable" },
            fallback: { default: "" },
        };
    },

    parseHTML() {
        return [{ tag: 'span[data-variable]' }];
    },

    renderHTML({ HTMLAttributes, node }) {
        return [
            "span",
            mergeAttributes(HTMLAttributes, {
                "data-variable": node.attrs.name,
                "data-fallback": node.attrs.fallback,
                class: "variable-chip-html",
            }),
            `{{ ${node.attrs.name} }}`,
        ];
    },

    addNodeView() {
        return ReactNodeViewRenderer(VariableChipView);
    },
});
