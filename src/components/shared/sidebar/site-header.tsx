"use client"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import React from "react";

export function SiteHeader() {
    const pathname = usePathname();
    const segments = pathname.split("/").filter(Boolean);

    const formatSegment = (segment: string) => {
        return segment
            .split("-")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    };

    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />

                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href={`/`}>Super Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>

                        {/* Since /super acts as the base, we ignore the first segment if it is 'super' */}
                        {segments.filter(s => s !== 'super').map((segment, index) => {
                            const filteredSegments = segments.filter(s => s !== 'super');
                            const isLast = index === filteredSegments.length - 1;
                            const href = `/${filteredSegments.slice(0, index + 1).join("/")}`;

                            return (
                                <React.Fragment key={segment}>
                                    <BreadcrumbSeparator />
                                    <BreadcrumbItem>
                                        {isLast ? (
                                            <BreadcrumbPage>{formatSegment(segment)}</BreadcrumbPage>
                                        ) : (
                                            <BreadcrumbLink href={href}>
                                                {formatSegment(segment)}
                                            </BreadcrumbLink>
                                        )}
                                    </BreadcrumbItem>
                                </React.Fragment>
                            );
                        })}
                    </BreadcrumbList>
                </Breadcrumb>

                {/* <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" asChild size="sm" className="hidden sm:flex">
                        <a
                            href="https://github.com/shadcn-ui/ui/tree/main/apps/v4/app/(examples)/dashboard"
                            rel="noopener noreferrer"
                            target="_blank"
                            className="dark:text-foreground"
                        >
                            GitHub
                        </a>
                    </Button>
                </div> */}
            </div>
        </header>
    )
}
