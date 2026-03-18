"use client";

import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useState, useCallback, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
// import type { ButtonAttrs } from "./button-node";
import {
    Settings2,
    Check,
    ChevronDown,
    Minus,
    Plus,
    Type,
    Palette,
    Square,
    Maximize2,
    Link,
    AlignLeft,
    AlignCenter,
    AlignRight,
    Eye,
    EyeOff,
    X,
} from "lucide-react";
import { ButtonAttrs } from "../extensions/button-node";

/* ── Palettes ── */
const BG_SWATCHES = [
    "#007AFF", "#34C759", "#FF3B30", "#FF9500",
    "#AF52DE", "#5856D6", "#1C1C1E", "#ffffff",
];
const TEXT_SWATCHES = [
    "#ffffff", "#000000", "#1C1C1E", "#007AFF", "#FF3B30", "#34C759",
];

const SIZE_OPTIONS: { value: ButtonAttrs["size"]; label: string }[] = [
    { value: "sm", label: "Small" },
    { value: "md", label: "Medium" },
    { value: "lg", label: "Large" },
];

const SIZE_MAP_PREVIEW: Record<string, string> = {
    sm: "px-3.5 py-1.5 text-[13px]",
    md: "px-5 py-2 text-[15px]",
    lg: "px-7 py-3 text-[17px]",
};

const ALIGN_MAP_FLEX: Record<string, string> = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
};

/* ─────────────────────────────────────────────────────────────── */
/* Sub-components                                                  */
/* ─────────────────────────────────────────────────────────────── */

function ColorSwatch({
    color,
    active,
    onClick,
    size = 20,
}: {
    color: string;
    active?: boolean;
    onClick: () => void;
    size?: number;
}) {
    const isWhite = color.toLowerCase() === "#ffffff";
    return (
        <button
            type="button"
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            title={color}
            aria-label={color}
            style={{
                width: size,
                height: size,
                borderRadius: "50%",
                background: color,
                border: isWhite
                    ? "1.5px solid var(--toolbar-separator)"
                    : "1.5px solid transparent",
                outline: active ? `2.5px solid ${isWhite ? "#000" : color}` : "none",
                outlineOffset: 2.5,
                cursor: "pointer",
                flexShrink: 0,
                transition: "outline 0.1s, transform 0.1s",
                transform: active ? "scale(1.18)" : "scale(1)",
            }}
        />
    );
}

function HexInput({
    value,
    onChange,
}: {
    value: string;
    onChange: (v: string) => void;
}) {
    const [local, setLocal] = useState(value);
    useEffect(() => setLocal(value), [value]);

    const commit = () => {
        const v = local.startsWith("#") ? local : `#${local}`;
        if (/^#[0-9a-fA-F]{3,8}$/.test(v)) onChange(v);
        else setLocal(value);
    };

    return (
        <div
            className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5"
            style={{
                background: "var(--toolbar-hover-bg)",
                border: "1px solid var(--toolbar-separator)",
            }}
        >
            <div
                className="size-3.5 rounded-full shrink-0"
                style={{ background: value, border: "1px solid var(--toolbar-separator)" }}
            />
            <input
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                onBlur={commit}
                onKeyDown={(e) => { if (e.key === "Enter") commit(); }}
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                className="w-20 bg-transparent text-[11px] font-mono outline-none"
                style={{ color: "var(--color-foreground)" }}
                spellCheck={false}
            />
        </div>
    );
}

function Stepper({
    value, min, max, step = 1, unit = "", onChange,
}: {
    value: number; min: number; max: number; step?: number; unit?: string;
    onChange: (v: number) => void;
}) {
    return (
        <div
            className="flex items-center rounded-lg overflow-hidden"
            style={{
                border: "1px solid var(--toolbar-separator)",
                background: "var(--toolbar-hover-bg)",
            }}
        >
            <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onChange(Math.max(min, value - step)); }}
                className="flex items-center justify-center w-7 h-7 transition-opacity hover:opacity-50"
                style={{ color: "var(--color-foreground)" }}
            >
                <Minus className="size-2.5" strokeWidth={2} />
            </button>
            <span
                className="w-9 text-center text-[11px] font-medium tabular-nums select-none"
                style={{ color: "var(--color-foreground)" }}
            >
                {value}{unit}
            </span>
            <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onChange(Math.min(max, value + step)); }}
                className="flex items-center justify-center w-7 h-7 transition-opacity hover:opacity-50"
                style={{ color: "var(--color-foreground)" }}
            >
                <Plus className="size-2.5" strokeWidth={2} />
            </button>
        </div>
    );
}

function InlineSelect<T extends string>({
    value,
    options,
    onChange,
}: {
    value: T;
    options: { value: T; label: string }[];
    onChange: (v: T) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (!ref.current?.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [open]);

    const current = options.find((o) => o.value === value) ?? options[0];

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[12px] font-medium w-full transition-colors"
                style={{
                    background: "var(--toolbar-hover-bg)",
                    border: "1px solid var(--toolbar-separator)",
                    color: "var(--color-foreground)",
                }}
            >
                <span className="flex-1 text-left">{current.label}</span>
                <ChevronDown
                    className="size-3 opacity-60 shrink-0 transition-transform duration-150"
                    style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>
            {open && (
                <div
                    className="absolute top-full left-0 mt-1 z-[9999] rounded-xl overflow-hidden py-1"
                    style={{
                        background: "var(--toolbar-bg)",
                        border: "1px solid var(--toolbar-border)",
                        boxShadow: "var(--toolbar-shadow)",
                        backdropFilter: "blur(20px) saturate(180%)",
                        WebkitBackdropFilter: "blur(20px) saturate(180%)",
                        minWidth: "100%",
                    }}
                >
                    {options.map((opt) => {
                        const isActive = opt.value === value;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                                className="flex items-center justify-between w-full px-3 py-1.5 text-[12px] transition-colors"
                                style={{
                                    background: isActive ? "var(--toolbar-active-bg)" : "transparent",
                                    color: isActive ? "var(--toolbar-active-fg)" : "var(--color-foreground)",
                                }}
                                onMouseEnter={(e) => {
                                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "var(--toolbar-hover-bg)";
                                }}
                                onMouseLeave={(e) => {
                                    if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                                }}
                            >
                                {opt.label}
                                {isActive && <Check className="size-3" strokeWidth={2.5} />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ── Section label ── */
function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
    return (
        <div className="flex items-center gap-1.5 mb-2.5">
            <Icon className="size-3 shrink-0" strokeWidth={2} style={{ opacity: 0.4, color: "var(--color-foreground)" }} />
            <span
                className="text-[10px] font-semibold uppercase tracking-widest"
                style={{ opacity: 0.4, color: "var(--color-foreground)" }}
            >
                {label}
            </span>
        </div>
    );
}

/* ── Divider ── */
function Divider() {
    return <div style={{ height: 1, background: "var(--toolbar-separator)", margin: "0 12px" }} />;
}

/* ─────────────────────────────────────────────────────────────── */
/* Main NodeView                                                   */
/* ─────────────────────────────────────────────────────────────── */

export function ButtonNodeView({ node, updateAttributes, selected }: NodeViewProps) {
    const attrs = node.attrs as ButtonAttrs;
    const [panelOpen, setPanelOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const update = useCallback(
        (patch: Partial<ButtonAttrs>) => updateAttributes(patch),
        [updateAttributes]
    );

    // Compute live visual style
    const isOutline = attrs.variant === "outline";
    const resolvedBg = isOutline ? "transparent" : attrs.bg;
    const resolvedBorder = isOutline
        ? `2px solid ${attrs.bg}`
        : `${attrs.borderWidth}px solid ${attrs.borderColor}`;
    const resolvedText = isOutline ? attrs.bg : attrs.textColor;

    if (!attrs.visible) {
        return (
            <NodeViewWrapper
                className="button-node-wrapper button-node-hidden"
                data-drag-handle
            >
                <div
                    className="flex items-center gap-2 py-1.5 px-3 rounded-lg my-1"
                    style={{
                        border: "1px dashed var(--toolbar-separator)",
                        opacity: 0.5,
                    }}
                    contentEditable={false}
                >
                    <EyeOff className="size-3.5 shrink-0" style={{ color: "var(--color-muted-foreground)" }} strokeWidth={1.75} />
                    <span className="text-[12px] font-medium" style={{ color: "var(--color-muted-foreground)" }}>
                        Button hidden — &ldquo;{attrs.label}&rdquo;
                    </span>
                    <button
                        type="button"
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); update({ visible: true }); }}
                        className="ml-auto flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-medium transition-colors"
                        style={{
                            background: "var(--toolbar-hover-bg)",
                            border: "1px solid var(--toolbar-separator)",
                            color: "var(--color-foreground)",
                        }}
                    >
                        <Eye className="size-3" strokeWidth={2} />
                        Show
                    </button>
                </div>
            </NodeViewWrapper>
        );
    }

    return (
        <NodeViewWrapper
            ref={wrapperRef}
            className="button-node-wrapper"
            data-drag-handle
        >
            {/* Preview row */}
            <div
                className={cn("flex items-center gap-2.5 py-1.5", ALIGN_MAP_FLEX[attrs.align] ?? "justify-start")}
                contentEditable={false}
            >
                {/* Rendered button */}
                <button
                    type="button"
                    className={cn(
                        "button-node-el font-medium leading-none",
                        SIZE_MAP_PREVIEW[attrs.size] ?? SIZE_MAP_PREVIEW.md,
                        selected && "ring-2 ring-offset-2 ring-primary/40"
                    )}
                    style={{
                        background: resolvedBg,
                        color: resolvedText,
                        borderRadius: attrs.borderRadius,
                        border: resolvedBorder,
                    }}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setPanelOpen((v) => !v); }}
                >
                    {attrs.label}
                </button>

                {/* Edit chip — always visible when panel open, otherwise show on wrapper hover */}
                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => { e.stopPropagation(); setPanelOpen((v) => !v); }}
                    className={cn(
                        "edit-chip flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium transition-all duration-150",
                        panelOpen ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                    )}
                    style={{
                        background: panelOpen ? "var(--toolbar-active-bg)" : "var(--toolbar-hover-bg)",
                        color: panelOpen ? "var(--toolbar-active-fg)" : "var(--color-muted-foreground)",
                        border: "1px solid var(--toolbar-separator)",
                    }}
                >
                    <Settings2 className="size-3" strokeWidth={2} />
                    Edit
                </button>
            </div>
            {/* ── Settings panel ── */}
            {panelOpen && (
                <div
                    className="button-editor-panel"
                    contentEditable={false}
                    onMouseDown={(e) => e.stopPropagation()}
                    onClick={(e) => e.stopPropagation()}
                    ref={(el) => {
                        if (!el) return;
                        // Clamp to screen bounds on the left side
                        const rect = el.getBoundingClientRect();
                        if (rect.left < 10) {
                            const offset = 10 - rect.left;
                            el.style.transform = `translateX(${offset}px)`;
                        } else {
                            el.style.transform = 'none';
                        }
                    }}
                    style={{
                        background: "var(--toolbar-bg)",
                        border: "1px solid var(--toolbar-border)",
                        boxShadow: "var(--toolbar-shadow)",
                        backdropFilter: "blur(24px) saturate(180%)",
                        WebkitBackdropFilter: "blur(24px) saturate(180%)",
                        position: "absolute",
                        zIndex: 100,
                    }}
                >
                    {/* Header */}
                    <div
                        className="flex items-center justify-between px-3 py-2.5"
                        style={{ borderBottom: "1px solid var(--toolbar-separator)" }}
                    >
                        <span className="text-[12px] font-semibold" style={{ color: "var(--color-foreground)" }}>
                            Button settings
                        </span>
                        <button
                            type="button"
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => { e.stopPropagation(); setPanelOpen(false); }}
                            className="flex items-center justify-center size-5 rounded-full transition-colors"
                            style={{ color: "var(--color-muted-foreground)" }}
                            onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.background = "var(--toolbar-hover-bg)"}
                            onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.background = "transparent"}
                        >
                            <X className="size-3" strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Label */}
                    <div className="button-editor-section">
                        <SectionLabel icon={Type} label="Label" />
                        <input
                            type="text"
                            value={attrs.label}
                            onChange={(e) => update({ label: e.target.value })}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Button text"
                            className="button-editor-input"
                            style={{
                                background: "var(--toolbar-hover-bg)",
                                border: "1px solid var(--toolbar-separator)",
                                color: "var(--color-foreground)",
                            }}
                        />
                    </div>

                    <Divider />

                    {/* URL */}
                    <div className="button-editor-section">
                        <SectionLabel icon={Link} label="URL" />
                        <input
                            type="url"
                            value={attrs.href}
                            onChange={(e) => update({ href: e.target.value })}
                            onMouseDown={(e) => e.stopPropagation()}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="https://example.com"
                            className="button-editor-input"
                            style={{
                                background: "var(--toolbar-hover-bg)",
                                border: "1px solid var(--toolbar-separator)",
                                color: "var(--color-foreground)",
                            }}
                        />
                    </div>

                    <Divider />

                    {/* Variant + Size row */}
                    <div className="button-editor-section">
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <SectionLabel icon={Square} label="Style" />
                                <InlineSelect<ButtonAttrs["variant"]>
                                    value={attrs.variant}
                                    options={[
                                        { value: "filled", label: "Filled" },
                                        { value: "outline", label: "Outline" },
                                    ]}
                                    onChange={(v) => update({ variant: v })}
                                />
                            </div>
                            <div>
                                <SectionLabel icon={Maximize2} label="Size" />
                                <InlineSelect<ButtonAttrs["size"]>
                                    value={attrs.size}
                                    options={SIZE_OPTIONS}
                                    onChange={(v) => update({ size: v })}
                                />
                            </div>
                        </div>
                    </div>

                    <Divider />

                    {/* Alignment */}
                    <div className="button-editor-section">
                        <SectionLabel icon={AlignLeft} label="Alignment" />
                        <div className="flex gap-1">
                            {(
                                [
                                    { value: "left", icon: AlignLeft },
                                    { value: "center", icon: AlignCenter },
                                    { value: "right", icon: AlignRight },
                                ] as const
                            ).map(({ value, icon: Icon }) => {
                                const isActive = attrs.align === value;
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        onMouseDown={(e) => e.stopPropagation()}
                                        onClick={(e) => { e.stopPropagation(); update({ align: value }); }}
                                        className="flex-1 flex items-center justify-center h-8 rounded-lg transition-colors"
                                        style={{
                                            background: isActive ? "var(--toolbar-active-bg)" : "var(--toolbar-hover-bg)",
                                            color: isActive ? "var(--toolbar-active-fg)" : "var(--color-foreground)",
                                            border: `1px solid ${isActive ? "transparent" : "var(--toolbar-separator)"}`,
                                        }}
                                    >
                                        <Icon className="size-3.5" strokeWidth={2} />
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <Divider />

                    {/* Background color — hidden in outline mode */}
                    {!isOutline && (
                        <>
                            <div className="button-editor-section">
                                <SectionLabel icon={Palette} label="Button Color" />
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {BG_SWATCHES.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={attrs.bg === c}
                                            onClick={() => update({ bg: c })}
                                        />
                                    ))}
                                </div>
                                <HexInput value={attrs.bg} onChange={(v) => update({ bg: v })} />
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* In outline mode, bg swatch = border/text color */}
                    {isOutline && (
                        <>
                            <div className="button-editor-section">
                                <SectionLabel icon={Palette} label="Accent Color" />
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {BG_SWATCHES.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={attrs.bg === c}
                                            onClick={() => update({ bg: c })}
                                        />
                                    ))}
                                </div>
                                <HexInput value={attrs.bg} onChange={(v) => update({ bg: v })} />
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Text color — only in filled mode */}
                    {!isOutline && (
                        <>
                            <div className="button-editor-section">
                                <SectionLabel icon={Type} label="Text Color" />
                                <div className="flex flex-wrap gap-1.5 mb-2">
                                    {TEXT_SWATCHES.map((c) => (
                                        <ColorSwatch
                                            key={c}
                                            color={c}
                                            active={attrs.textColor === c}
                                            onClick={() => update({ textColor: c })}
                                        />
                                    ))}
                                </div>
                                <HexInput value={attrs.textColor} onChange={(v) => update({ textColor: v })} />
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Border — only in filled mode */}
                    {!isOutline && (
                        <>
                            <div className="button-editor-section">
                                <SectionLabel icon={Square} label="Border" />
                                <div className="flex flex-col gap-2.5">
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>Radius</span>
                                        <Stepper value={attrs.borderRadius} min={0} max={50} step={2} unit="px" onChange={(v) => update({ borderRadius: v })} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>Width</span>
                                        <Stepper value={attrs.borderWidth} min={0} max={6} unit="px" onChange={(v) => update({ borderWidth: v })} />
                                    </div>
                                    {attrs.borderWidth > 0 && (
                                        <div className="flex flex-col gap-2">
                                            <span className="text-[11px]" style={{ color: "var(--color-muted-foreground)" }}>Border Color</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {BG_SWATCHES.map((c) => (
                                                    <ColorSwatch key={c} color={c} size={18} active={attrs.borderColor === c} onClick={() => update({ borderColor: c })} />
                                                ))}
                                            </div>
                                            <HexInput value={attrs.borderColor} onChange={(v) => update({ borderColor: v })} />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <Divider />
                        </>
                    )}

                    {/* Visibility */}
                    <div className="button-editor-section">
                        <div className="flex items-center justify-between">
                            <SectionLabel icon={Eye} label="Visibility" />
                            <button
                                type="button"
                                onMouseDown={(e) => e.stopPropagation()}
                                onClick={(e) => { e.stopPropagation(); update({ visible: !attrs.visible }); }}
                                className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-colors"
                                style={{
                                    background: attrs.visible ? "var(--toolbar-active-bg)" : "var(--toolbar-hover-bg)",
                                    color: attrs.visible ? "var(--toolbar-active-fg)" : "var(--color-muted-foreground)",
                                    border: "1px solid var(--toolbar-separator)",
                                    marginBottom: "0.5rem",
                                }}
                            >
                                {attrs.visible ? (
                                    <><Eye className="size-3" strokeWidth={2} /> Visible</>
                                ) : (
                                    <><EyeOff className="size-3" strokeWidth={2} /> Hidden</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}
