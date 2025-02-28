import { DraggableToolItem } from "./DraggableToolItem"
import type { Component } from '@/types/atomicComponent'

interface ToolbarProps {
  onAddComponent: (type: Component['type'], position: { x: number; y: number }) => void
}

export function Toolbar({ onAddComponent }: ToolbarProps) {
  const tools = [
    {
      type: 'section' as const,
      label: '零高盒子',
      icon: '📦'
    },
    {
      type: 'svg' as const,
      label: 'SVG图片',
      icon: '🖼️'
    },
    {
      type: 'foreignObject' as const,
      label: 'FO容器',
      icon: '📝'
    },
    {
      type: 'hotspot' as const,
      label: '热区',
      icon: '🎯'
    }
  ]

  return (
    <div className="space-y-4">
      {tools.map(tool => (
        <DraggableToolItem
          key={tool.type}
          type={tool.type}
          label={tool.label}
          icon={tool.icon}
        />
      ))}
    </div>
  )
} 