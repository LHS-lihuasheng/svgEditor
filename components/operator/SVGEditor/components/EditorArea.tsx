"use client"

import { Button } from "@/components/ui/button"
import { LucideRefreshCw, LucideEye, Settings, LucideCode, Image } from "lucide-react"
import { ComponentTree } from "../../ComponentTree"
import type { Component } from "@/types/svg-editor"

interface EditorAreaProps {
  dropRef: React.RefObject<HTMLDivElement>
  components: Component[]
  selectedComponent: Component | null
  onSelect: (component: Component | null) => void
  onDrop: (item: any, targetId: string | null) => void
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void
  onUpdate: (component: Component) => void
  onDelete: (id: string) => void
  onShowCodePreview: () => void
}

export function EditorArea({
  dropRef,
  components,
  selectedComponent,
  onSelect,
  onDrop,
  onMove,
  onUpdate,
  onDelete,
  onShowCodePreview
}: EditorAreaProps) {
  return (
    <div className="flex-1 flex flex-col bg-white shadow-sm rounded-lg">
      {/* 顶部工具栏 */}
      <div className="h-12 bg-white shadow-sm border-b px-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <LucideRefreshCw className="h-4 w-4 mr-2" />
            重置
          </Button>
          <Button variant="ghost" size="sm">
            <LucideEye className="h-4 w-4 mr-2" />
            预览
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            设置
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={onShowCodePreview}
          >
            <LucideCode className="h-4 w-4 mr-2" />
            获取代码
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div
        ref={dropRef}
        id="editor-area"
        className="flex-1 p-6 relative overflow-auto"
        style={{
          height: 'calc(100vh - 64px)', // 减去顶部导航栏高度
          minHeight: '600px'
        }}
      >
        {components.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
            <Image className="h-12 w-12 mb-4 opacity-50" />
            <p>拖动左侧组件至此以继续添加</p>
          </div>
        ) : (
          <ComponentTree
            components={components}
            selectedId={selectedComponent?.id}
            onSelect={onSelect}
            onDrop={onDrop}
            onMove={onMove}
            onUpdate={onUpdate}
            onDelete={onDelete}
          />
        )}
      </div>
    </div>
  )
} 