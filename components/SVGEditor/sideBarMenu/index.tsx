"use client"

import { cn } from "@/lib/utils"
import type { BaseComponent, ComponentType } from "@/types/core"
import { usePanel } from "@/contexts/PanelContext"
import { NavBar } from "./menuNav"
import { MenuTab } from "./menuTab/menuTab"

interface SideBarMenuProps {
    onAddComponent: (type: ComponentType) => void
    selectedComponent: BaseComponent | null
    onUpdateComponent?: (component: BaseComponent) => void
}

export function SideBarMenu({ onAddComponent }: SideBarMenuProps) {
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
                    onAddComponent={onAddComponent}
                />
            </div>
        </div>
    )
} 