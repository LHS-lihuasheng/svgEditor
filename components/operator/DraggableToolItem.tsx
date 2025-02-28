import { useDrag } from 'react-dnd'
import { Button } from "@/components/ui/button"
import type { Component } from "@/types/atomicComponent"
import { COMPONENT_TEMPLATES } from '@/types/atomicComponent'

interface DraggableToolItemProps {
  type: Component['type']
  label: string
  icon: string
}

export function DraggableToolItem({ type, label, icon }: DraggableToolItemProps) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'TOOL',
    item: {
      type,
      isToolItem: true,
      id: `temp-${Date.now()}`,
      size: { width: 100, height: 100 },
      index: -1
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    })
  }))

  const template = COMPONENT_TEMPLATES[type]

  return (
    <Button
      ref={drag}
      variant="outline"
      className={`
        w-full justify-start 
        transition-all duration-200
        ${isDragging ? 'opacity-50 scale-95' : 'hover:scale-[1.02]'}
      `}
    >
      <span className="mr-2">{template?.icon || icon}</span>
      <span>{template?.label || label}</span>
    </Button>
  )
} 