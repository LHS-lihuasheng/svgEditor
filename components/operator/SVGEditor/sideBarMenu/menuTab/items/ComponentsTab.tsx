"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { ComponentType, BaseComponent } from "@/types/atomicComponents/index"
import { COMPONENT_TEMPLATES } from "@/types/atomicComponents/index"
import { Paintbrush, Component, Box } from "lucide-react"
import { useDrag } from "react-dnd"
import type { DragItem } from "@/types/atomicComponents/baseComponent"

interface ComponentsTabProps {
    onAddComponent: (type: ComponentType) => void
}

export function ComponentsTab({ onAddComponent }: ComponentsTabProps) {
    return (
        <div className="p-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="text-lg font-semibold">组件库</h3>
                    <p className="text-sm text-muted-foreground">拖拽组件到画布或点击添加</p>
                </div>

                <ScrollArea className="h-[calc(100vh-240px)]">
                    <div className="grid grid-cols-1 gap-4 pr-4">
                        {/* 显示所有组件 */}
                        {Object.entries(COMPONENT_TEMPLATES).map(([type, template]) => (
                            <ComponentCard
                                key={type}
                                type={type as ComponentType}
                                title={template.label}
                                description={template.description || ''}
                                icon={template.icon}
                                onAdd={(type) => onAddComponent(type)}
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
    onAdd: (type: ComponentType) => void
}

function ComponentCard({ type, title, description, icon, onAdd }: ComponentCardProps) {
    // 修复 defaultSize 和 drag ref 的错误
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TOOL',
        item: {
            type,
            isToolItem: true,
            id: `temp-${Date.now()}` // 添加临时ID
        } as DragItem,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return (
        <Card className={`overflow-hidden ${isDragging ? 'opacity-50' : ''}`}>
            <div
                ref={drag as React.RefObject<HTMLDivElement>}
                className="cursor-grab"
            >
                <CardHeader className="p-3">
                    <CardTitle className="text-md flex items-center">
                        <span className="mr-2">{typeof icon === 'string' ? icon : <Component className="h-4 w-4" />}</span>
                        {title}
                    </CardTitle>
                    <CardDescription className="text-xs">{description}</CardDescription>
                </CardHeader>
                <CardContent className="p-3 pt-0">
                    <div className="bg-slate-100 rounded-md p-2 text-center min-h-[60px] flex items-center justify-center">
                        <Box className="h-8 w-8 text-slate-400" />
                    </div>
                </CardContent>
            </div>
        </Card>
    )
} 