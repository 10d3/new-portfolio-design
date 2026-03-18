"use client";

import {
    forwardRef,
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
} from "react";
import { Extension, type Editor, type Range } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { Braces, Plus } from "lucide-react";

/* ── Shared variable store (module-level so editor + panel share it) ── */
export interface Variable {
    id: string;
    name: string;      // e.g. "firstName"
    label: string;     // e.g. "First Name"
    fallback: string;  // e.g. "there"
    example: string;   // e.g. "John"
}

export const DEFAULT_VARIABLES: Variable[] = [
    { id: "firstName", name: "firstName", label: "First Name", fallback: "there", example: "John" },
    { id: "lastName", name: "lastName", label: "Last Name", fallback: "", example: "Doe" },
    { id: "fullName", name: "fullName", label: "Full Name", fallback: "there", example: "John Doe" },
    { id: "email", name: "email", label: "Email", fallback: "", example: "john@doe.com" },
    { id: "company", name: "company", label: "Company", fallback: "your company", example: "Acme Inc." },
    { id: "jobTitle", name: "jobTitle", label: "Job Title", fallback: "", example: "Engineer" },
];

/* ── Variable picker menu ── */
interface VarMenuProps {
    items: Variable[];
    command: (item: Variable) => void;
}
interface VarMenuHandle {
    onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

export const VariableMenu = forwardRef<VarMenuHandle, VarMenuProps>(
    ({ items, command }, ref) => {
        const [selectedIndex, setSelectedIndex] = useState(0);
        const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

        useEffect(() => { setSelectedIndex(0); }, [items]);
        useEffect(() => {
            itemRefs.current[selectedIndex]?.scrollIntoView({ block: "nearest" });
        }, [selectedIndex]);

        useImperativeHandle(ref, () => ({
            onKeyDown: ({ event }: { event: KeyboardEvent }) => {
                if (event.key === "ArrowUp") {
                    setSelectedIndex((i) => (i - 1 + items.length) % items.length);
                    return true;
                }
                if (event.key === "ArrowDown") {
                    setSelectedIndex((i) => (i + 1) % items.length);
                    return true;
                }
                if (event.key === "Enter") {
                    if (items[selectedIndex]) { command(items[selectedIndex]); return true; }
                }
                return false;
            },
        }));

        if (!items.length) {
            return (
                <div className="var-menu">
                    <div className="var-menu-empty">No variables found</div>
                </div>
            );
        }

        return (
            <div className="var-menu" role="listbox" aria-label="Insert variable">
                <div className="var-menu-header">
                    <Braces className="size-3" strokeWidth={2} />
                    Variables
                </div>
                {items.map((item, i) => (
                    <button
                        key={item.id}
                        ref={(el) => { itemRefs.current[i] = el; }}
                        type="button"
                        role="option"
                        aria-selected={i === selectedIndex}
                        onClick={() => command(item)}
                        className={cn("var-menu-item", i === selectedIndex && "var-menu-item--active")}
                    >
                        <span className="var-menu-chip">
                            <span className="var-menu-chip-brace">{"{{"}</span>
                            <span className="var-menu-chip-name">{item.name}</span>
                            <span className="var-menu-chip-brace">{"}}"}</span>
                        </span>
                        <span className="var-menu-body">
                            <span className="var-menu-label">{item.label}</span>
                            {item.example && (
                                <span className="var-menu-example">e.g. "{item.example}"</span>
                            )}
                        </span>
                    </button>
                ))}
            </div>
        );
    }
);
VariableMenu.displayName = "VariableMenu";

/* ── Renderer (portal, positioned manually) ── */
function renderVariableMenu(getVariables: () => Variable[]) {
    let component: VarMenuHandle | null = null;
    let popup: HTMLElement | null = null;
    let reactRoot: ReturnType<typeof import("react-dom/client").createRoot> | null = null;

    const cleanup = () => {
        reactRoot?.unmount();
        reactRoot = null;
        popup?.remove();
        popup = null;
    };

    const position = (props: { clientRect?: (() => DOMRect | null) | null }) => {
        const rect = props.clientRect?.();
        if (!rect || !popup) return;
        popup.style.top = `${rect.bottom + window.scrollY + 6}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;
    };

    return {
        onStart(props: { editor: Editor; range: Range; query: string; clientRect?: (() => DOMRect | null) | null }) {
            popup = document.createElement("div");
            popup.style.cssText = "position:absolute;z-index:9999;top:0;left:0;pointer-events:auto";
            document.body.appendChild(popup);

            import("react-dom/client").then(({ createRoot }) => {
                reactRoot = createRoot(popup!);
                const variables = getVariables();
                const q = props.query.toLowerCase();
                const filtered = q
                    ? variables.filter(v => v.name.toLowerCase().includes(q) || v.label.toLowerCase().includes(q))
                    : variables;

                reactRoot.render(
                    <VariableMenu
                        ref={(el) => { component = el; }}
                        items={filtered}
                        command={(item) => {
                            props.editor
                                .chain()
                                .focus()
                                .deleteRange(props.range)
                                .insertContent({ type: "variableNode", attrs: { name: item.name, fallback: item.fallback } })
                                .run();
                            cleanup();
                        }}
                    />
                );
                position(props);
            });
        },

        onUpdate(props: { editor: Editor; range: Range; query: string; clientRect?: (() => DOMRect | null) | null }) {
            if (!popup || !reactRoot) return;
            const variables = getVariables();
            const q = props.query.toLowerCase();
            const filtered = q
                ? variables.filter(v => v.name.toLowerCase().includes(q) || v.label.toLowerCase().includes(q))
                : variables;

            reactRoot.render(
                <VariableMenu
                    ref={(el) => { component = el; }}
                    items={filtered}
                    command={(item) => {
                        props.editor
                            .chain()
                            .focus()
                            .deleteRange(props.range)
                            .insertContent({ type: "variableNode", attrs: { name: item.name, fallback: item.fallback } })
                            .run();
                        cleanup();
                    }}
                />
            );
            position(props);
        },

        onKeyDown(props: { event: KeyboardEvent }) {
            if (props.event.key === "Escape") { cleanup(); return true; }
            return component?.onKeyDown(props) ?? false;
        },

        onExit() {
            cleanup();
        },
    };
}

/* ── Tiptap Extension ── */
export function createVariableSuggestion(getVariables: () => Variable[]) {
    return Extension.create({
        name: "variableSuggestion",

        addProseMirrorPlugins() {
            return [
                Suggestion({
                    editor: this.editor,
                    char: "{{",
                    allowSpaces: false,
                    startOfLine: false,
                    command: ({
                        editor,
                        range,
                        props,
                    }: {
                        editor: Editor;
                        range: Range;
                        props: Variable;
                    }) => {
                        editor
                            .chain()
                            .focus()
                            .deleteRange(range)
                            .insertContent({ type: "variableNode", attrs: { name: props.name, fallback: props.fallback } })
                            .run();
                    },
                    items: ({ query }: { query: string }) => {
                        const variables = getVariables();
                        const q = query.toLowerCase();
                        if (!q) return variables;
                        return variables.filter(
                            (v) => v.name.toLowerCase().includes(q) || v.label.toLowerCase().includes(q)
                        );
                    },
                    render: () => renderVariableMenu(getVariables),
                }),
            ];
        },
    });
}
