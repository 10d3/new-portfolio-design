"use client"

import type { IconType } from "react-icons"
import {
    SidebarGroup,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "@/components/ui/sidebar"
import { usePathname, useRouter } from "next/navigation"

export function NavMain({
    items,
}: {
    items: {
        title: string
        url: string
        icon?: IconType
    }[]
}) {
    const router = useRouter()
    const pathname = usePathname()
    return (
        <SidebarGroup>
            <SidebarGroupContent className="flex flex-col gap-2">
                <SidebarMenu>
                    {items.map((item) => {
                        const active = item.url === "/" || item.url === "/super" ? pathname === item.url : pathname.startsWith(item.url)
                        return (
                            <SidebarMenuItem key={item.title}>
                                <SidebarMenuButton isActive={active} onClick={() => { router.push(item.url) }} tooltip={item.title}>
                                    {/* <Link href={item.url}> */}
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                    {/* </Link> */}
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        )
                    })}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}
