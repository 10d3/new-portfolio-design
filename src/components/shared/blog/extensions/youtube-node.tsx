"use client";

import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper, type NodeViewProps } from "@tiptap/react";
import { useRef, useState, useCallback } from "react";
import { Youtube, Link, X } from "lucide-react";

/* ── URL helpers ────────────────────────────────────────────── */

function parseYouTubeId(url: string): string | null {
    if (!url) return null;
    // already an id (11 chars, alphanumeric + _ -)
    if (/^[A-Za-z0-9_-]{11}$/.test(url.trim())) return url.trim();

    try {
        const u = new URL(url);
        // youtu.be/ID
        if (u.hostname === "youtu.be") {
            return u.pathname.slice(1).split("?")[0] || null;
        }
        // youtube.com/watch?v=ID
        const v = u.searchParams.get("v");
        if (v) return v;
        // youtube.com/embed/ID
        const embedMatch = u.pathname.match(/\/embed\/([A-Za-z0-9_-]{11})/);
        if (embedMatch) return embedMatch[1];
        // youtube.com/shorts/ID
        const shortsMatch = u.pathname.match(/\/shorts\/([A-Za-z0-9_-]{11})/);
        if (shortsMatch) return shortsMatch[1];
    } catch {
        // not a URL — try regex fallback
    }

    const regex =
        /(?:youtube\.com\/(?:[^/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([A-Za-z0-9_-]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function toEmbedUrl(src: string, startAt = 0): string {
    const id = parseYouTubeId(src);
    if (!id) return "";
    let url = `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    if (startAt > 0) url += `&start=${startAt}`;
    return url;
}

/* ── NodeView component ─────────────────────────────────────── */

function YouTubeNodeView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
    const { src, caption, startAt } = node.attrs as {
        src: string;
        caption: string;
        startAt: number;
    };

    const embedUrl = src ? toEmbedUrl(src, startAt) : "";
    const [inputValue, setInputValue] = useState(src ?? "");
    const [error, setError] = useState("");
    const inputRef = useRef<HTMLInputElement>(null);

    const stopAll = useCallback((e: React.SyntheticEvent) => {
        e.stopPropagation();
    }, []);

    const handleSubmit = useCallback(
        (e: React.FormEvent) => {
            e.preventDefault();
            e.stopPropagation();
            const id = parseYouTubeId(inputValue.trim());
            if (!id) {
                setError("Couldn't find a valid YouTube video. Paste a full URL or a video ID.");
                return;
            }
            setError("");
            updateAttributes({ src: inputValue.trim() });
        },
        [inputValue, updateAttributes]
    );

    const handleReset = useCallback(
        (e: React.MouseEvent) => {
            e.stopPropagation();
            updateAttributes({ src: "" });
            setInputValue("");
            setError("");
            setTimeout(() => inputRef.current?.focus(), 50);
        },
        [updateAttributes]
    );

    return (
        <NodeViewWrapper
            className="youtube-node-wrapper"
            data-selected={selected}
            contentEditable={false}
        >
            {/* ── URL input state ── */}
            {!embedUrl ? (
                <div
                    className="youtube-input-panel"
                    onMouseDown={stopAll}
                    onClick={stopAll}
                >
                    <div className="youtube-input-icon">
                        <Youtube className="size-5" strokeWidth={1.5} />
                    </div>
                    <p className="youtube-input-label">Embed a YouTube video</p>
                    <form onSubmit={handleSubmit} className="youtube-input-form">
                        <div className="youtube-input-row">
                            <span className="youtube-input-prefix">
                                <Link className="size-3.5" strokeWidth={1.75} />
                            </span>
                            <input
                                ref={inputRef}
                                autoFocus
                                type="text"
                                value={inputValue}
                                onChange={(e) => {
                                    setInputValue(e.target.value);
                                    setError("");
                                }}
                                onMouseDown={stopAll}
                                onClick={stopAll}
                                onKeyDown={(e) => e.stopPropagation()}
                                placeholder="Paste YouTube URL or video ID…"
                                className="youtube-input-field"
                            />
                            <button
                                type="submit"
                                className="youtube-input-submit"
                                onMouseDown={stopAll}
                            >
                                Embed
                            </button>
                        </div>
                        {error && <p className="youtube-input-error">{error}</p>}
                    </form>
                    <button
                        type="button"
                        className="youtube-delete-btn"
                        onMouseDown={stopAll}
                        onClick={(e) => {
                            e.stopPropagation();
                            deleteNode();
                        }}
                        aria-label="Remove video block"
                    >
                        <X className="size-3.5" strokeWidth={2} />
                        Remove
                    </button>
                </div>
            ) : (
                /* ── Embed state ── */
                <div className="youtube-embed-wrapper" onMouseDown={stopAll} onClick={stopAll}>
                    {/* selection ring */}
                    <div className={`youtube-embed-ring${selected ? " youtube-embed-ring--selected" : ""}`}>
                        <div className="youtube-aspect-box">
                            <iframe
                                src={embedUrl}
                                title={caption || "YouTube video"}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                allowFullScreen
                                className="youtube-iframe"
                                loading="lazy"
                            />
                        </div>
                    </div>

                    {/* caption input */}
                    <input
                        type="text"
                        value={caption}
                        onChange={(e) => updateAttributes({ caption: e.target.value })}
                        onMouseDown={stopAll}
                        onClick={stopAll}
                        onKeyDown={(e) => e.stopPropagation()}
                        placeholder="Add a caption…"
                        className="youtube-caption-input"
                    />

                    {/* controls row */}
                    <div className="youtube-controls" onMouseDown={stopAll} onClick={stopAll}>
                        <button
                            type="button"
                            className="youtube-control-btn"
                            onMouseDown={stopAll}
                            onClick={handleReset}
                        >
                            <Link className="size-3" strokeWidth={1.75} />
                            Change URL
                        </button>
                        <button
                            type="button"
                            className="youtube-control-btn youtube-control-btn--danger"
                            onMouseDown={stopAll}
                            onClick={(e) => {
                                e.stopPropagation();
                                deleteNode();
                            }}
                        >
                            <X className="size-3" strokeWidth={2} />
                            Remove
                        </button>
                    </div>
                </div>
            )}
        </NodeViewWrapper>
    );
}

/* ── Tiptap Node definition ─────────────────────────────────── */

export const YouTubeNode = Node.create({
    name: "youtubeNode",
    group: "block",
    atom: true,
    draggable: true,
    selectable: true,

    addAttributes() {
        return {
            src: { default: "" },
            caption: { default: "" },
            startAt: { default: 0 },
        };
    },

    parseHTML() {
        return [{ tag: "div[data-youtube-node]" }];
    },

    renderHTML({ HTMLAttributes }) {
        return ["div", mergeAttributes(HTMLAttributes, { "data-youtube-node": "" })];
    },

    addNodeView() {
        return ReactNodeViewRenderer(YouTubeNodeView);
    },
});
