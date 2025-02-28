"use client"

import { useState } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import type { Component } from "@/types/atomicComponent"
import { ComponentsTab } from "./tab/items/ComponentsTab"
import { AssetsTab } from "./tab/items/AssetsTab"
import { ParametersTab } from "./tab/items/ParametersTab"
import { NavBar } from "./tab/Nav"

interface SideBarMenuProps {
    isOpen: boolean
    onToggle: () => void
    onAddComponent: (type: Component['type'], position: { x: number; y: number }) => void
}

export function SideBarMenu({ isOpen, onToggle, onAddComponent }: SideBarMenuProps) {
    const [activeTab, setActiveTab] = useState<'components' | 'assets' | 'parameters'>('components')


    return (
        <div
            className={cn(
                "fixed top-[57px] left-0 bottom-0 bg-white shadow-lg transition-[width] duration-300 ease-in-out z-10",
                isOpen ? "w-72" : "w-12"
            )}
        >
            <div className="h-full flex">
                {/* 导航栏 */}
                <NavBar
                    activeTab={activeTab}
                    onTabChange={setActiveTab}
                    isOpen={isOpen}
                    onToggle={onToggle}
                />

                {/* 内容区 */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    <ScrollArea className="flex-1">
                        {activeTab === 'components' ? (
                            <ComponentsTab onAddComponent={onAddComponent} />
                        ) : activeTab === 'parameters' ? (
                            <ParametersTab />
                        ) : (
                            <AssetsTab />
                        )}
                    </ScrollArea>
                </div>
            </div>
        </div>
    )
} 