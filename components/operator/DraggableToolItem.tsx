import { useDrag } from 'react-dnd'
import { Button } from "@/components/ui/button"
import type { Component, ComponentTemplate } from "@/types/atomicComponent"
import { COMPONENT_TEMPLATES } from '@/types/atomicComponent'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip"

interface DraggableToolItemProps {
  type: Component['type']
  label?: string
  icon?: string
  showDescription?: boolean
}

export function DraggableToolItem({
  type,
  label,
  icon,
  showDescription = false
}: DraggableToolItemProps) {
  const template = COMPONENT_TEMPLATES[type]

  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TOOL',
    item: () => ({
      type,
      isToolItem: true,
      id: `temp-${Date.now()}`,
      size: template?.defaultSize || { width: 100, height: 100 },
      index: -1,
    }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  if (!template) return null

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            ref={drag}
            variant="outline"
            className={`
              w-full justify-start 
              transition-all duration-200
              ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}
            `}
          >
            <span className="mr-2">{typeof template.icon === 'string' ? template.icon : icon}</span>
            <span className="truncate">{template.label || label}</span>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">{template.label || label}</p>
            {template.description && (
              <p className="text-xs text-muted-foreground max-w-[200px]">
                {template.description}
              </p>
            )}
            {template.tags && template.tags.length > 0 && (
              <div className="flex gap-1 flex-wrap">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
} 