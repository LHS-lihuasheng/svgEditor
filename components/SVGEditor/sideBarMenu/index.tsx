"use client"

import { cn } from "@/lib/utils"
import { usePanel } from "@/contexts/PanelContext"
import { NavBar } from "./menuNav"
import { MenuTab } from "./menuTab/menuTab"


export function SideBarMenu() {
    const { isMenuBarOpen } = usePanel()

    return (    
        <div
            className={cn(
                "fixed top-[57px] left-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
                isMenuBarOpen ? "w-96" : "w-12"
            )}
        >
            <div className="h-full flex">
                {/* 按钮导航 */}
                <NavBar />

                {/* Tab内容区 */}
                <MenuTab
                />
            </div>
        </div>
    )
} 