"use client";

import { useState, useRef } from "react";
import type { Variable } from "./variable-suggestion";
import { cn } from "@/lib/utils";
import { Plus, Trash2, Braces, ChevronRight, Pencil, Check, X } from "lucide-react";

interface VariablesPanelProps {
    variables: Variable[];
    onAdd: (v: Omit<Variable, "id">) => void;
    onUpdate: (id: string, patch: Partial<Variable>) => void;
    onDelete: (id: string) => void;
    onInsert?: (v: Variable) => void; // optional: insert directly into editor
}

interface EditingState {
    id: string;
    field: "label" | "name" | "fallback" | "example";
    value: string;
}

export function VariablesPanel({ variables, onAdd, onUpdate, onDelete, onInsert }: VariablesPanelProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [editing, setEditing] = useState<EditingState | null>(null);
    const [addingNew, setAddingNew] = useState(false);
    const [newLabel, setNewLabel] = useState("");
    const [newFallback, setNewFallback] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const startEdit = (id: string, field: EditingState["field"], current: string) => {
        setEditing({ id, field, value: current });
    };

    const commitEdit = () => {
        if (!editing) return;
        let { value } = editing;
        if (editing.field === "name") {
            value = value.trim().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "");
            if (!value) { setEditing(null); return; }
        }
        onUpdate(editing.id, { [editing.field]: value });
        setEditing(null);
    };

    const cancelEdit = () => setEditing(null);

    const handleAddNew = () => {
        const labelTrimmed = newLabel.trim();
        if (!labelTrimmed) return;
        const name = labelTrimmed.replace(/\s+(.)/g, (_, c) => c.toUpperCase()).replace(/\s/g, "").replace(/[^a-zA-Z0-9_]/g, "");
        onAdd({
            name,
            label: labelTrimmed,
            fallback: newFallback.trim(),
            example: "",
        });
        setNewLabel("");
        setNewFallback("");
        setAddingNew(false);
    };

    return (
        <aside
            className={cn(
                "variables-panel",
                collapsed && "variables-panel--collapsed"
            )}
            style={{
                background: "var(--toolbar-bg)",
                backdropFilter: "blur(20px) saturate(180%)",
                WebkitBackdropFilter: "blur(20px) saturate(180%)",
                borderLeft: "1px solid var(--toolbar-border)",
            }}
        >
            {/* Header */}
            <div className="variables-panel-header">
                <button
                    type="button"
                    onClick={() => setCollapsed((v) => !v)}
                    className="variables-panel-title-btn"
                    aria-expanded={!collapsed}
                    aria-label="Toggle variables panel"
                >
                    <ChevronRight
                        className="variables-panel-chevron"
                        style={{ transform: collapsed ? "rotate(0deg)" : "rotate(90deg)" }}
                        strokeWidth={2}
                    />
                    <Braces className="size-3.5 shrink-0" strokeWidth={2} />
                    {!collapsed && <span>Variables</span>}
                </button>

                {!collapsed && (
                    <button
                        type="button"
                        onClick={() => { setAddingNew(true); setTimeout(() => inputRef.current?.focus(), 0); }}
                        className="variables-panel-add-btn"
                        title="Add variable"
                    >
                        <Plus className="size-3.5" strokeWidth={2.5} />
                    </button>
                )}
            </div>

            {!collapsed && (
                <div className="variables-panel-body">
                    {/* Add new form */}
                    {addingNew && (
                        <div className="variables-new-form">
                            <div className="variables-new-form-row">
                                <input
                                    ref={inputRef}
                                    value={newLabel}
                                    onChange={(e) => setNewLabel(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddNew();
                                        if (e.key === "Escape") { setAddingNew(false); setNewLabel(""); setNewFallback(""); }
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder="Label, e.g. First Name"
                                    className="variables-new-input"
                                    style={{
                                        background: "var(--toolbar-hover-bg)",
                                        border: "1px solid var(--toolbar-separator)",
                                        color: "var(--color-foreground)",
                                    }}
                                />
                            </div>
                            <div className="variables-new-form-row">
                                <input
                                    value={newFallback}
                                    onChange={(e) => setNewFallback(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddNew();
                                        if (e.key === "Escape") { setAddingNew(false); }
                                        e.stopPropagation();
                                    }}
                                    onClick={(e) => e.stopPropagation()}
                                    onMouseDown={(e) => e.stopPropagation()}
                                    placeholder="Fallback (optional)"
                                    className="variables-new-input"
                                    style={{
                                        background: "var(--toolbar-hover-bg)",
                                        border: "1px solid var(--toolbar-separator)",
                                        color: "var(--color-foreground)",
                                    }}
                                />
                            </div>
                            <div className="variables-new-form-actions">
                                <button
                                    type="button"
                                    onClick={handleAddNew}
                                    className="variables-action-btn variables-action-btn--primary"
                                >
                                    <Check className="size-3" strokeWidth={2.5} />
                                    Add
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setAddingNew(false); setNewLabel(""); setNewFallback(""); }}
                                    className="variables-action-btn"
                                >
                                    <X className="size-3" strokeWidth={2} />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Variable list */}
                    <div className="variables-list" role="list">
                        {variables.length === 0 && !addingNew && (
                            <div className="variables-empty">
                                No variables yet.
                                <button
                                    type="button"
                                    onClick={() => { setAddingNew(true); setTimeout(() => inputRef.current?.focus(), 0); }}
                                    className="variables-empty-link"
                                >
                                    Add one
                                </button>
                            </div>
                        )}

                        {variables.map((v) => (
                            <div key={v.id} className="variable-row" role="listitem">
                                {/* Chip preview — click inserts into editor */}
                                <button
                                    type="button"
                                    onClick={() => onInsert?.(v)}
                                    className="var-chip-preview"
                                    title={onInsert ? `Insert {{${v.name}}} into editor` : undefined}
                                >
                                    <span className="var-chip-brace">{"{{"}</span>
                                    <span className="var-chip-name">{v.name}</span>
                                    <span className="var-chip-brace">{"}}"}</span>
                                </button>

                                {/* Details */}
                                <div className="variable-row-details">
                                    {/* Label */}
                                    {editing?.id === v.id && editing.field === "label" ? (
                                        <input
                                            autoFocus
                                            value={editing.value}
                                            onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                            onBlur={commitEdit}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") commitEdit();
                                                if (e.key === "Escape") cancelEdit();
                                                e.stopPropagation();
                                            }}
                                            onClick={(e) => e.stopPropagation()}
                                            onMouseDown={(e) => e.stopPropagation()}
                                            className="variable-inline-input"
                                            style={{
                                                background: "var(--toolbar-hover-bg)",
                                                border: "1px solid var(--color-primary)",
                                                color: "var(--color-foreground)",
                                            }}
                                        />
                                    ) : (
                                        <button
                                            type="button"
                                            className="variable-row-label"
                                            onClick={() => startEdit(v.id, "label", v.label)}
                                            title="Click to rename label"
                                        >
                                            {v.label}
                                            <Pencil className="size-2.5 opacity-0 group-hover:opacity-100 ml-1 shrink-0" strokeWidth={2} />
                                        </button>
                                    )}

                                    {/* Fallback */}
                                    <div className="variable-row-meta">
                                        <span className="variable-row-meta-key">Fallback:</span>
                                        {editing?.id === v.id && editing.field === "fallback" ? (
                                            <input
                                                autoFocus
                                                value={editing.value}
                                                onChange={(e) => setEditing({ ...editing, value: e.target.value })}
                                                onBlur={commitEdit}
                                                onKeyDown={(e) => {
                                                    if (e.key === "Enter") commitEdit();
                                                    if (e.key === "Escape") cancelEdit();
                                                    e.stopPropagation();
                                                }}
                                                onClick={(e) => e.stopPropagation()}
                                                onMouseDown={(e) => e.stopPropagation()}
                                                className="variable-inline-input variable-inline-input--sm"
                                                style={{
                                                    background: "var(--toolbar-hover-bg)",
                                                    border: "1px solid var(--color-primary)",
                                                    color: "var(--color-foreground)",
                                                }}
                                            />
                                        ) : (
                                            <button
                                                type="button"
                                                className="variable-row-meta-value"
                                                onClick={() => startEdit(v.id, "fallback", v.fallback)}
                                                title="Click to edit fallback"
                                            >
                                                {v.fallback || <span className="opacity-35">none</span>}
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Delete */}
                                <button
                                    type="button"
                                    onClick={() => onDelete(v.id)}
                                    className="variable-delete-btn"
                                    title={`Delete {{${v.name}}}`}
                                    aria-label={`Delete ${v.label}`}
                                >
                                    <Trash2 className="size-3" strokeWidth={2} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Footer hint */}
                    {variables.length > 0 && (
                        <p className="variables-footer-hint">
                            Type <code>{"{{"}name{"}}"}</code> in the editor or click a variable to insert it.
                        </p>
                    )}
                </div>
            )}
        </aside>
    );
}
