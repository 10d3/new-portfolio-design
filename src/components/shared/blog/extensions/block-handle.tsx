/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

"use client";

import type { Editor } from "@tiptap/react";
import { GripVertical, Plus } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { NodeSelection } from "@tiptap/pm/state";

interface BlockHandleProps {
    editor: Editor;
}

interface BlockInfo {
    pos: number;
    node: any;
    dom: HTMLElement;
}

export function BlockHandle({ editor }: BlockHandleProps) {
    const [visible, setVisible] = useState(false);
    const [position, setPosition] = useState({ top: 0 });
    const [hoveredBlock, setHoveredBlock] = useState<BlockInfo | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isHoveringHandle, setIsHoveringHandle] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const dragImageRef = useRef<HTMLDivElement | null>(null);
    const hideTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Find the top-level block node at a given mouse Y position
    const getBlockAtY = useCallback(
        (y: number): BlockInfo | null => {
            if (!editor?.view) return null;

            const editorElement = editor.view.dom;
            let closestBlock: BlockInfo | null = null;
            let closestDist = Infinity;

            // Iterate over top-level child nodes in the document
            editor.state.doc.forEach((node, offset) => {
                const dom = editor.view.nodeDOM(offset);
                if (!(dom instanceof HTMLElement)) return;

                const rect = dom.getBoundingClientRect();
                // Distance from mouse Y to center of block
                const center = rect.top + rect.height / 2;
                const dist = Math.abs(y - center);

                if (dist < closestDist && y >= rect.top - 8 && y <= rect.bottom + 8) {
                    closestDist = dist;
                    closestBlock = { pos: offset, node, dom };
                }
            });

            return closestBlock;
        },
        [editor]
    );

    // Track mouse movement to show/hide the handle
    useEffect(() => {
        if (!editor?.view) return;

        const editorElement = editor.view.dom;
        const parentElement = editorElement.closest(".relative") as HTMLElement;
        if (!parentElement) return;

        const handleMouseMove = (e: MouseEvent) => {
            if (isDragging) return;

            // Cancel any pending hide
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
                hideTimeoutRef.current = null;
            }

            const editorRect = editorElement.getBoundingClientRect();

            // Check if mouse is near the editor
            if (
                e.clientX < editorRect.left - 60 ||
                e.clientX > editorRect.right + 20 ||
                e.clientY < editorRect.top - 5 ||
                e.clientY > editorRect.bottom + 5
            ) {
                setVisible(false);
                setHoveredBlock(null);
                return;
            }

            const block = getBlockAtY(e.clientY);
            if (!block) {
                setVisible(false);
                setHoveredBlock(null);
                return;
            }

            const blockRect = block.dom.getBoundingClientRect();
            const parentRect = parentElement.getBoundingClientRect();

            setPosition({
                top: blockRect.top - parentRect.top + 2,
            });
            setHoveredBlock(block);
            setVisible(true);
        };

        const handleMouseLeave = () => {
            if (!isDragging) {
                // Small delay so moving to the handle doesn't cause flicker
                hideTimeoutRef.current = setTimeout(() => {
                    if (!isHoveringHandle) {
                        setVisible(false);
                        setHoveredBlock(null);
                    }
                }, 150);
            }
        };

        parentElement.addEventListener("mousemove", handleMouseMove);
        parentElement.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            parentElement.removeEventListener("mousemove", handleMouseMove);
            parentElement.removeEventListener("mouseleave", handleMouseLeave);
            if (hideTimeoutRef.current) {
                clearTimeout(hideTimeoutRef.current);
            }
        };
    }, [editor, getBlockAtY, isDragging, isHoveringHandle]);

    // Handle the "+" button click
    const handleAddBlock = useCallback(() => {
        if (!hoveredBlock || !editor) return;

        const { pos, node } = hoveredBlock;
        const endOfBlock = pos + node.nodeSize;

        // Insert a new paragraph after the hovered block
        editor
            .chain()
            .focus()
            .insertContentAt(endOfBlock, { type: "paragraph" })
            .setTextSelection(endOfBlock + 1)
            .run();

        // Open slash commands by inserting "/"
        setTimeout(() => {
            editor.commands.insertContent("/");
        }, 50);
    }, [editor, hoveredBlock]);

    // ─── Drag & Drop ───────────────────────────────────────────────────

    const handleDragStart = useCallback(
        (e: React.DragEvent) => {
            if (!hoveredBlock || !editor) return;

            setIsDragging(true);

            // Create a drag preview
            const preview = document.createElement("div");
            preview.className = "block-drag-preview";
            preview.textContent =
                hoveredBlock.dom.textContent?.substring(0, 60) || "Block";
            document.body.appendChild(preview);
            dragImageRef.current = preview;
            e.dataTransfer.setDragImage(preview, 0, 0);

            // Store the source position in the drag data
            e.dataTransfer.setData(
                "application/block-pos",
                String(hoveredBlock.pos)
            );
            e.dataTransfer.effectAllowed = "move";

            // Select the node visually
            const tr = editor.state.tr;
            tr.setSelection(NodeSelection.create(editor.state.doc, hoveredBlock.pos));
            editor.view.dispatch(tr);
        },
        [editor, hoveredBlock]
    );


    const handleDragEnd = useCallback(() => {
        setIsDragging(false);
        // Remove the drag preview element
        if (dragImageRef.current) {
            dragImageRef.current.remove();
            dragImageRef.current = null;
        }
        // Remove drop indicators
        document
            .querySelectorAll(".block-drop-indicator")
            .forEach((el) => el.remove());
    }, []);

    if (!visible && !isDragging) return null;

    return (
        <div
            ref={containerRef}
            className={cn(
                "block-handle-container",
                (visible || isDragging) && "block-handle-visible"
            )}
            style={{
                top: position.top,
                left: -44,
            }}
            contentEditable={false}
            onMouseEnter={() => {
                setIsHoveringHandle(true);
                if (hideTimeoutRef.current) {
                    clearTimeout(hideTimeoutRef.current);
                    hideTimeoutRef.current = null;
                }
            }}
            onMouseLeave={() => {
                setIsHoveringHandle(false);
                if (!isDragging) {
                    hideTimeoutRef.current = setTimeout(() => {
                        setVisible(false);
                        setHoveredBlock(null);
                    }, 150);
                }
            }}
        >
            <button
                type="button"
                className="block-handle-button block-handle-add"
                onClick={handleAddBlock}
                aria-label="Add block"
            >
                <Plus className="size-3.5" />
            </button>
            <div
                className="block-handle-button block-handle-drag"
                draggable
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                aria-label="Drag to reorder"
            >
                <GripVertical className="size-3.5" />
            </div>
        </div>
    );
}

// ─── Editor Drop Handler (use this alongside <BlockHandle>) ─────────

/**
 * Attach this to the editor wrapper's onDrop to handle block reordering.
 */
export function handleBlockDrop(editor: Editor, e: React.DragEvent) {
    const sourcePosStr = e.dataTransfer.getData("application/block-pos");
    if (!sourcePosStr) return;

    e.preventDefault();

    const sourcePos = parseInt(sourcePosStr, 10);
    const sourceNode = editor.state.doc.nodeAt(sourcePos);
    if (!sourceNode) return;

    // Find target position from drop coordinates
    const coords = { left: e.clientX, top: e.clientY };
    const dropPos = editor.view.posAtCoords(coords);
    if (!dropPos) return;

    // Resolve to top-level block
    const resolved = editor.state.doc.resolve(dropPos.pos);
    let targetBlockPos: number;
    if (resolved.depth === 0) {
        targetBlockPos = dropPos.pos;
    } else {
        targetBlockPos = resolved.before(1);
    }

    const targetNode = editor.state.doc.nodeAt(targetBlockPos);
    if (!targetNode) return;

    // Don't drop onto itself
    if (targetBlockPos === sourcePos) return;

    // Determine whether to insert before or after the target block
    const targetDom = editor.view.nodeDOM(targetBlockPos);
    if (!(targetDom instanceof HTMLElement)) return;

    const targetRect = targetDom.getBoundingClientRect();
    const insertBefore = e.clientY < targetRect.top + targetRect.height / 2;

    // Use a single transaction for the move
    const { tr } = editor.state;
    const sourceSlice = sourceNode.toJSON();
    const sourceSize = sourceNode.nodeSize;

    // Step 1: Delete the source node
    tr.delete(sourcePos, sourcePos + sourceSize);

    // Step 2: Calculate the adjusted target pos after deletion
    let adjustedTargetPos = targetBlockPos;
    if (sourcePos < targetBlockPos) {
        adjustedTargetPos -= sourceSize;
    }

    // Step 3: Find where to insert
    const mappedDoc = tr.doc;
    const resolvedTarget = mappedDoc.resolve(
        Math.min(adjustedTargetPos, mappedDoc.content.size)
    );

    let insertTargetPos: number;
    if (resolvedTarget.depth === 0) {
        insertTargetPos = adjustedTargetPos;
    } else {
        insertTargetPos = resolvedTarget.before(1);
    }

    const nodeAtInsert = mappedDoc.nodeAt(insertTargetPos);
    let finalInsertPos: number;

    if (insertBefore) {
        finalInsertPos = insertTargetPos;
    } else if (nodeAtInsert) {
        finalInsertPos = insertTargetPos + nodeAtInsert.nodeSize;
    } else {
        finalInsertPos = mappedDoc.content.size;
    }

    // Step 4: Insert the node at the new position
    const newNode = editor.state.schema.nodeFromJSON(sourceSlice);
    tr.insert(finalInsertPos, newNode);

    editor.view.dispatch(tr);
}
