"use client"

import { cn } from "@/lib/utils"
import type { Component } from "@/types/atomicComponent"
import { useMenuBar } from "@/contexts/MenuBarContext"
import { NavBar } from "./menuNav"
import { MenuTab } from "./menuTab/index"

interface SideBarMenuProps {
    onAddComponent: (type: Component['type'], position: { x: number; y: number }) => void
    selectedComponent: Component | null
    onUpdateComponent?: (component: Component) => void
}

export function SideBarMenu({ onAddComponent, selectedComponent, onUpdateComponent }: SideBarMenuProps) {
    const { isMenuBarOpen } = useMenuBar()

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
                    selectedComponent={selectedComponent}
                    onUpdateComponent={onUpdateComponent}
                />
            </div>
        </div>
    )
} 