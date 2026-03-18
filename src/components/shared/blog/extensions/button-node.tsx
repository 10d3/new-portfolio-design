import { Node, mergeAttributes, ReactNodeViewRenderer } from "@tiptap/react";

export interface ButtonAttrs {
    label: string;
    href: string;
    bg: string;
    textColor: string;
    borderRadius: number;
    borderWidth: number;
    borderColor: string;
    size: "sm" | "md" | "lg";
    variant: "filled" | "outline";
    align: "left" | "center" | "right";
    visible: boolean;
}

const SIZE_MAP: Record<string, { padding: string; fontSize: string }> = {
    sm: { padding: "6px 14px", fontSize: "13px" },
    md: { padding: "9px 22px", fontSize: "15px" },
    lg: { padding: "12px 30px", fontSize: "17px" },
};

const ALIGN_MAP: Record<string, string> = {
    left: "flex-start",
    center: "center",
    right: "flex-end",
};

export const ButtonNode = Node.create({
    name: "buttonNode",
    group: "block",
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
        return {
            label: { default: "Click me" },
            href: { default: "" },
            bg: { default: "#007AFF" },
            textColor: { default: "#ffffff" },
            borderRadius: { default: 10 },
            borderWidth: { default: 0 },
            borderColor: { default: "#007AFF" },
            size: { default: "md" },
            variant: { default: "filled" },
            align: { default: "left" },
            visible: { default: true },
        };
    },

    parseHTML() {
        return [{ tag: 'div[data-type="button-node"]' }];
    },

    addNodeView() {
        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const { ButtonNodeView } = require("../toolbars/button-editor");
        return ReactNodeViewRenderer(ButtonNodeView);
    },

    renderHTML({ HTMLAttributes, node }) {
        const {
            label, href, bg, textColor, borderRadius, borderWidth,
            borderColor, size, variant, align, visible,
        } = node.attrs as ButtonAttrs;

        if (!visible) {
            return [
                "div",
                mergeAttributes(HTMLAttributes, {
                    "data-type": "button-node",
                    class: "button-node-wrapper button-node-hidden",
                    style: "display:none",
                }),
            ];
        }

        const { padding, fontSize } = SIZE_MAP[size] ?? SIZE_MAP.md;
        const resolvedBg = variant === "outline" ? "transparent" : bg;
        const resolvedBorder = `${variant === "outline" ? 2 : borderWidth}px solid ${variant === "outline" ? bg : borderColor}`;
        const resolvedText = variant === "outline" ? bg : textColor;

        return [
            "div",
            mergeAttributes(HTMLAttributes, {
                "data-type": "button-node",
                class: "button-node-wrapper",
                style: `display:flex;justify-content:${ALIGN_MAP[align] ?? "flex-start"}`,
            }),
            [
                href ? "a" : "button",
                {
                    ...(href ? { href, target: "_blank", rel: "noopener noreferrer" } : { type: "button" }),
                    class: "button-node-el",
                    style: [
                        `background:${resolvedBg}`,
                        `color:${resolvedText}`,
                        `border-radius:${borderRadius}px`,
                        `border:${resolvedBorder}`,
                        `padding:${padding}`,
                        `font-size:${fontSize}`,
                    ].join(";"),
                },
                label,
            ],
        ];
    },
});
