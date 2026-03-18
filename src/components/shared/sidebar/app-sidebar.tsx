"use client"

import * as React from "react"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavUser } from "./nav-user"
import { RiDashboardHorizontalFill } from "react-icons/ri"
import { FaFolderOpen } from "react-icons/fa"
import { BiLogoBlogger } from "react-icons/bi"


interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
    userData?: {
        name: string;
        email: string;
        avatar?: string;
        role?: string; // Role like CASHIER / OWNER ETC...
    };
}

const data = {
    navMain: [
        {
            title: "Overview",
            url: "/dashboard",
            icon: RiDashboardHorizontalFill,
        },
        {
            title: "Projects",
            url: "/dashboard/projects",
            icon: FaFolderOpen,
        },
        {
            title: "Blog",
            url: "/dashboard/blog",
            icon: BiLogoBlogger,
        },
    ],
    navSecondary: [] as { title: string; url: string; icon: React.ComponentType }[],
}

export function AppSidebar({ userData, ...props }: AppSidebarProps) {
    return (
        <Sidebar collapsible="offcanvas" {...props}>
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton
                            asChild
                            className="data-[slot=sidebar-menu-button]:p-1.5!"
                        >
                            <a href="/dashboard">
                                <span className="text-base font-semibold">Portfolio CMS</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={data.navMain} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser user={
                    userData as {
                        name: string;
                        email: string;
                        avatar: string;
                    }
                } />
            </SidebarFooter>
        </Sidebar>
    )
}
