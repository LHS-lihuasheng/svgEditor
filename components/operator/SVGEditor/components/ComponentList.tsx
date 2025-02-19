"use client"

import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Toolbar } from "../../Toolbar"
import type { Component } from "@/types/svg-editor"

interface ComponentListProps {
    isOpen: boolean
    onToggle: () => void
    onAddComponent: (type: Component['type'], position: { x: number; y: number }) => void
}

export function ComponentList({ isOpen, onToggle, onAddComponent }: ComponentListProps) {
    return (
        <div
            className={cn(
                "fixed top-[57px] left-0 bottom-0 bg-white shadow-lg transition-transform duration-300 z-10",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}
            style={{ width: '280px' }}
        >
            <div className="h-full flex flex-col">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-gray-700">组件库</h3>
                </div>
                <ScrollArea className="flex-1 p-4">
                    <Toolbar onAddComponent={onAddComponent} />
                </ScrollArea>
            </div>

            {/* 展开/收起按钮 */}
            <button
                className="absolute -right-8 top-1/2 -translate-y-1/2 bg-white shadow-md rounded-r-lg p-1.5 hover:bg-gray-50"
                onClick={onToggle}
            >
                {isOpen ? (
                    <ChevronLeft className="h-5 w-5 text-gray-600" />
                ) : (
                    <ChevronRight className="h-5 w-5 text-gray-600" />
                )}
            </button>
        </div>
    )
} 