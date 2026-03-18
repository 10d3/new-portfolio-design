/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import { Heading1, Heading2, Heading3, Heading4, Type } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useToolbar } from "./toolbar-provider";

interface HeadingToolbarProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  className?: string;
}

const HeadingToolbar = React.forwardRef<HTMLButtonElement, HeadingToolbarProps>(
  ({ className, onClick, children, ...props }, ref) => {
    const { editor } = useToolbar();

    // Return early if no editor
    if (!editor) {
      return (
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-8 w-8", className)}
          disabled
          ref={ref}
          {...props}
        >
          {children || <Type className="h-4 w-4" />}
        </Button>
      );
    }

    const headings = [
      {
        level: 1 as const,
        icon: Heading1,
        action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
        isActive: editor.isActive("heading", { level: 1 }),
        label: "Heading 1",
        canRun: editor.can().chain().focus().toggleHeading({ level: 1 }).run(),
      },
      {
        level: 2 as const,
        icon: Heading2,
        action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        isActive: editor.isActive("heading", { level: 2 }),
        label: "Heading 2",
        canRun: editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
      },
      {
        level: 3 as const,
        icon: Heading3,
        action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        isActive: editor.isActive("heading", { level: 3 }),
        label: "Heading 3",
        canRun: editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
      },
      {
        level: 4 as const,
        icon: Heading4,
        action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(),
        isActive: editor.isActive("heading", { level: 4 }),
        label: "Heading 4",
        canRun: editor.can().chain().focus().toggleHeading({ level: 4 }).run(),
      },
    ];

    const activeHeading = headings.find((heading) => heading.isActive);
    const Icon = activeHeading ? activeHeading.icon : Type;
    const tooltipText = activeHeading ? activeHeading.label : "Paragraph";

    // Add option to convert to paragraph
    const paragraphOption = {
      level: 0 as const,
      icon: Type,
      action: () => editor.chain().focus().setParagraph().run(),
      // FIX: Correctly check if the paragraph is active
      isActive: editor.isActive("paragraph"),
      label: "Paragraph",
      canRun: editor.can().chain().focus().setParagraph().run(),
    };

    const allOptions = [paragraphOption, ...headings];

    return (
      <TooltipProvider>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(
                    "h-8 w-8",
                    (activeHeading || paragraphOption.isActive) &&
                    "bg-accent text-accent-foreground",
                    className
                  )}
                  ref={ref}
                  {...props}
                >
                  {children || <Icon className="h-4 w-4" />}
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <span>{tooltipText}</span>
            </TooltipContent>
          </Tooltip>

          <DropdownMenuContent align="start" className="w-48">
            {allOptions.map((option) => (
              <DropdownMenuItem
                key={option.level}
                onClick={(e) => {
                  e.preventDefault();
                  option.action();
                  onClick?.(e as unknown as React.MouseEvent<HTMLButtonElement>);
                }}
                className={cn(
                  "flex items-center gap-2",
                  option.isActive && "bg-accent text-accent-foreground"
                )}
                disabled={!option.canRun}
              >
                <option.icon className="h-4 w-4" />
                <span>{option.label}</span>
                {option.isActive && (
                  <div className="ml-auto h-2 w-2 rounded-full bg-current" />
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </TooltipProvider>
    );
  }
);

HeadingToolbar.displayName = "HeadingToolbar";

export { HeadingToolbar };
