"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { COMPONENT_TEMPLATES } from '@/types/templateStorage'
import { GripHorizontal } from "lucide-react"
import { useDrag } from "react-dnd"
import type { DragItem } from '@/types/drag'
import { cn } from "@/lib/utils"
import { useEditor } from "@/contexts/EditorContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BaseComponentTemplate } from '@/types/component'
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
                        {COMPONENT_TEMPLATES.map(template => (
                            <ComponentCard
                                key={template.templateName}
                                template={template}
                            />
                        ))}
                    </div>
                </ScrollArea>
            </div>
        </div>
    )
}

interface ComponentCardProps {
    template: BaseComponentTemplate
}

function ComponentCard({ template }: ComponentCardProps) {

    const { addComponent } = useEditor();

    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'TEMPLATE',
        item: {
            component: template.component
        } as DragItem,
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }))

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card
                        className={cn(
                            "overflow-hidden border border-gray-200 transition-all duration-200",
                            isDragging ? "opacity-50 scale-95 border-blue-300 shadow-md" : "hover:border-blue-200 hover:shadow-sm"
                        )}
                    >
                        <div
                            ref={drag as unknown as React.RefObject<HTMLDivElement>}
                            className="cursor-grab active:cursor-grabbing"
                            onClick={() => addComponent(template.component)}
                        >
                            <div className="flex items-center p-3 group">

                                <div className="flex-grow min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">{template.templateName}</h4>
                                </div>

                                {/* 拖拽提示器 */}
                                <div className="flex-shrink-0 ml-2 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <GripHorizontal className="h-4 w-4" />
                                </div>
                            </div>
                        </div>
                    </Card>
                </TooltipTrigger>
                <TooltipContent>
                    <p className="text-xs text-gray-500 truncate">{template.description}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    )
} 