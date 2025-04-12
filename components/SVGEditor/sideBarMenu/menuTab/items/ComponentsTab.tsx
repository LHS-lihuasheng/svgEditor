"use client"

import { Card } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { COMPONENT_TEMPLATES } from '@/types/templateStorage'
import { GripHorizontal, Trash2 } from "lucide-react"
import { useDrag } from "react-dnd"
import type { DragItem } from '@/types/drag'
import { Tabs, TabsContent, TabsList, TabsTrigger, } from "@/components/ui/tabs"
import { COMPONENT_CATEGORIES, categoryDisplayNames } from "@/types/component"
import { cn } from "@/lib/utils"
import { useEditor } from "@/contexts/EditorContext"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { BaseComponentTemplate } from '@/types/component'
import { useEffect, useState } from "react"
import { listCustomTemplates, deleteCustomTemplate } from "@/utils/indexedDBUtils"
import { toast } from "sonner"

export function ComponentsTab() {
    const [customTemplates, setCustomTemplates] = useState<BaseComponentTemplate[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 加载自定义模板
    useEffect(() => {
        const loadCustomTemplates = async () => {
            setIsLoading(true);
            try {
                const templates = await listCustomTemplates();
                // 转换数据格式以匹配 BaseComponentTemplate
                const formattedTemplates = templates.map(template => ({
                    templateName: template.templateName,
                    icon: template.icon || "📄", // 使用默认图标如果未提供
                    category: template.category || "packedTemplate", // 默认分类
                    description: template.description || "",
                    component: template.component,
                    id: template.id // 添加id属性用于删除
                }));
                
                setCustomTemplates(formattedTemplates);
            } catch (error) {
                console.error("加载自定义模板失败:", error);
                toast.error("加载自定义模板失败");
            } finally {
                setIsLoading(false);
            }
        };

        loadCustomTemplates();
    }, []);

    // 删除自定义模板
    const handleDeleteTemplate = async (id: number, templateName: string) => {
        if (!window.confirm(`确定要删除模板 "${templateName}" 吗？`)) {
            return;
        }
        
        try {
            await deleteCustomTemplate(id);
            setCustomTemplates(prev => prev.filter(t => (t as any).id !== id));
            toast.success(`模板 "${templateName}" 已删除`);
        } catch (error) {
            console.error("删除模板失败:", error);
            toast.error("删除模板失败");
        }
    };

    // 合并内置模板和自定义模板
    const allTemplates = [
        ...COMPONENT_TEMPLATES,
        ...customTemplates
    ];

    return (
        <div className="p-4">
            <div className="space-y-4">
                <div className="space-y-1">
                    <h3 className="inline-block text-lg font-semibold mr-4">组件库</h3>
                    <p className="inline-block text-sm text-muted-foreground">拖拽组件到画布或点击添加</p>
                    {isLoading && <p className="text-xs text-muted-foreground">加载中...</p>}
                </div>
                <Tabs defaultValue="basic">
                    <TabsList>
                        {COMPONENT_CATEGORIES.map(category => (
                            <TabsTrigger key={category} value={category}>
                                {categoryDisplayNames[category]}
                            </TabsTrigger>
                        ))}
                    </TabsList>
                    <ScrollArea className="h-[calc(100vh-200px)]">
                        {COMPONENT_CATEGORIES.map(category => (
                            <TabsContent key={category} value={category}>
                                <div className="grid grid-cols-1 gap-3 pr-4">
                                    {allTemplates.filter(template => template.category === category).map(template => (
                                        <ComponentCard
                                            key={(template as any).id || template.templateName}
                                            template={template}
                                            isCustom={(template as any).id !== undefined}
                                            onDelete={handleDeleteTemplate}
                                        />
                                    ))}
                                </div>
                            </TabsContent>
                        ))}
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    )
}

interface ComponentCardProps {
    template: BaseComponentTemplate;
    isCustom?: boolean;
    onDelete?: (id: number, templateName: string) => void;
}

function ComponentCard({ template, isCustom, onDelete }: ComponentCardProps) {
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

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation(); // 阻止事件冒泡
        if (onDelete && isCustom && (template as any).id) {
            onDelete((template as any).id, template.templateName);
        }
    };

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
                                <div className="flex-shrink-0 mr-2 text-gray-400">{template.icon}</div>
                                <div className="flex-grow min-w-0">
                                    <h4 className="text-sm font-medium text-gray-900 truncate">{template.templateName}</h4>
                                </div>

                                {/* 自定义模板删除按钮 */}
                                {isCustom && onDelete && (
                                    <button
                                        onClick={handleDelete}
                                        className="flex-shrink-0 ml-1 text-gray-400 hover:text-red-500 transition-colors"
                                        title="删除模板"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                )}

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