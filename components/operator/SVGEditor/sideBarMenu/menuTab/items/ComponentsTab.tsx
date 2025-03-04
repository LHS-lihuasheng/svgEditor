"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import type { DragItem } from "@/types/atomicComponent"
import { COMPONENT_TEMPLATES } from "@/types/atomicComponent"
import { Paintbrush, Component, Box } from "lucide-react"
import { useDrag } from "react-dnd"

interface ComponentsTabProps {
    onAddComponent: (type: "svg", position: { x: number, y: number }) => void
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
                        {/* 只显示SVG组件 */}
                        <ComponentCard
                            type="svg"
                            title={COMPONENT_TEMPLATES.svg.label}
                            description={COMPONENT_TEMPLATES.svg.description || ''}
                            icon={COMPONENT_TEMPLATES.svg.icon}
                            onAdd={(type) => onAddComponent(type, { x: 100, y: 100 })}
                        />
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

interface ComponentCardProps {
    type: "svg"
    title: string
    description: string
    icon: React.ReactNode | string
    onAdd: (type: "svg") => void
}

function ComponentCard({ type, title, description, icon, onAdd }: ComponentCardProps) {
    // 修复 defaultSize 和 drag ref 的错误
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TOOL',
        item: {
            type,
            isToolItem: true,
            // 修复 defaultSize 错误，默认提供一个尺寸
            size: { width: 100, height: 100 }
        } as DragItem,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return (
        <Card className={`overflow-hidden ${isDragging ? 'opacity-50' : ''}`}>
            {/* 修复 drag ref 类型错误，使用回调方式 */}
            <div ref={(node) => drag(node)} className="cursor-grab">
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