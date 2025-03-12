"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ComponentType } from '@/types/core'
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent'
import { Component, GripHorizontal } from "lucide-react"
import { useDrag } from "react-dnd"
import type { DragItem } from '@/types/core'
import { cn } from "@/lib/utils"
import { useEditor } from "@/contexts/EditorContext"

export function ComponentsTab() {
    return (
        <div className="p-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">组件库</h3>
                    <p className="text-sm text-muted-foreground">拖拽组件到画布或点击添加</p>
                </div>

                <ScrollArea className="h-[calc(100vh-240px)]">
                    <div className="grid grid-cols-1 gap-3 pr-4">
                        {/* 显示所有组件 */}
                        {Object.entries(COMPONENT_TEMPLATES).map(([type, template]) => (
                            <ComponentCard
                                key={type}
                                type={type as ComponentType}
                                title={template.label}
                                description={template.description || ''}
                                icon={template.icon}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

interface ComponentCardProps {
    type: ComponentType
    title: string
    description: string
    icon: React.ReactNode | string
}

function ComponentCard({ type, title, description, icon }: ComponentCardProps) {

    const { addComponent } = useEditor();

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TOOL',
        item: {
            type: type,
            isToolItem: true,
            id: `temp-${type}-${Date.now()}` // 添加临时ID
        } as DragItem,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return (
        <Card
            className={cn(
                "overflow-hidden border border-gray-200 transition-all duration-200",
                isDragging ? "opacity-50 scale-95 border-blue-300 shadow-md" : "hover:border-blue-200 hover:shadow-sm"
            )}
        >
            <div
                ref={drag as unknown as React.RefObject<HTMLDivElement>}
                className="cursor-grab active:cursor-grabbing"
                onClick={() => {
                    console.log('点击了', type)
                    addComponent(type)
                }}
            >
                <div className="flex items-center p-3 group">
                    {/* 组件图标 */}
                    <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-md bg-blue-50 text-blue-600 mr-3">
                        {typeof icon === 'string' ?
                            <span className="text-lg">{icon}</span> :
                            <Component className="h-4 w-4" />
                        }
                    </div>

                    {/* 标题和描述 */}
                    <div className="flex-grow min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">{title}</h4>
                        <p className="text-xs text-gray-500 truncate">{description}</p>
                    </div>

                    {/* 拖拽指示器 */}
                    <div className="flex-shrink-0 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripHorizontal className="h-4 w-4" />
                    </div>
                </div>
            </div>
        </Card>
    )
} 