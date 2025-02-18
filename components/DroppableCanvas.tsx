import { useDroppable } from "@dnd-kit/core"
import type { Component } from "@/types/svg-editor"

interface DroppableCanvasProps {
  children: React.ReactNode
  onDrop: (type: Component['type'], position: { x: number; y: number }) => void
}

export function DroppableCanvas({ children, onDrop }: DroppableCanvasProps) {
  const { setNodeRef } = useDroppable({
    id: 'canvas',
  })

  return (
    <div 
      ref={setNodeRef}
      className="w-full h-full relative bg-gray-50"
      style={{
        minHeight: '100%',
        overflow: 'auto'
      }}
    >
      {children}
    </div>
  )
} 