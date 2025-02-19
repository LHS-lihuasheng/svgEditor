"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { GripVertical, Maximize2, Minimize2, Image } from "lucide-react"

export function FloatPanel() {
  // 状态管理
  const [isExpanded, setIsExpanded] = useState(false)
  const [position, setPosition] = useState({ x: 20, y: 80 })
  const [size, setSize] = useState({
    width: 280,
    height: 40
  })

  // DOM引用和拖拽状态
  const panelRef = useRef<HTMLDivElement>(null)
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0
  })

  // 优化后的拖拽处理
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!(e.target as HTMLElement).closest('.drag-handle')) return
    
    const rect = panelRef.current?.getBoundingClientRect()
    if (!rect) return

    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !panelRef.current) return

    // 实时更新DOM位置
    const deltaX = e.clientX - dragState.current.startX
    const deltaY = e.clientY - dragState.current.startY
    panelRef.current.style.transform = `translate(${deltaX}px, ${deltaY}px)`

    // 使用RAF批量更新状态
    requestAnimationFrame(() => {
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }))
      // 重置transform和起始位置
      if (panelRef.current) {
        panelRef.current.style.transform = 'none'
      }
      dragState.current.startX = e.clientX
      dragState.current.startY = e.clientY
    })
  }, [])

  const handleMouseUp = useCallback(() => {
    dragState.current.isDragging = false
    document.removeEventListener('mousemove', handleMouseMove)
    document.removeEventListener('mouseup', handleMouseUp)
  }, [])

  // 清理事件监听
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // 切换展开/收起
  const toggleSize = useCallback(() => {
    setIsExpanded(prev => {
      const newWidth = !prev ? 600 : 280
      const newHeight = !prev ? 400 : 40
      setSize({ width: newWidth, height: newHeight })
      return !prev
    })
  }, [])

  return (
    <div
      ref={panelRef}
      onMouseDown={handleMouseDown}
      className="fixed bg-background shadow-lg rounded-lg border z-50 transition-all"
      style={{
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        cursor: dragState.current.isDragging ? 'grabbing' : 'auto',
        willChange: 'transform'
      }}
    >
      <div className="h-full flex flex-col">
        {/* 标题栏 */}
        <div className="h-10 border-b flex items-center px-3 gap-2 select-none">
          <GripVertical 
            className="drag-handle h-4 w-4 text-muted-foreground cursor-move"
          />
          <Image className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">素材库</span>
          
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-8 w-8 p-0"
            onClick={toggleSize}
          >
            {isExpanded ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* 内容区 */}
        <div className="flex-1 overflow-hidden p-4">
          {isExpanded && (
            <div className="h-full animate-in fade-in">
              素材库内容区域
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 