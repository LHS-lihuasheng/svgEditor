"use client"

import { Button } from "@/components/ui/button"
import { LucideRefreshCw, LucideEye, Settings, LucideCode, Image } from "lucide-react"
import { ComponentTree } from "./ComponentTree"
import { useMenuBar } from "@/contexts/MenuBarContext"
import { cn } from "@/lib/utils"
import { useEditor } from '@/contexts/EditorContext'
import { useParametersPanel } from "@/contexts/ParametersPanelContext"

interface EditorAreaProps {
  dropRef: React.RefObject<HTMLDivElement>
  onAddImages?: (componentId: string) => void
}

export function EditorArea({ dropRef, onAddImages }: EditorAreaProps) {
  const { isMenuBarOpen } = useMenuBar()
  const { isPanelOpen } = useParametersPanel()
  const {
    components,
    selectedComponent,
    setSelectedComponent,
    handleDrop,
    moveComponent,
    updateComponent,
    deleteComponent,
    setShowCodePreview
  } = useEditor()

  return (
    <div className={cn(
      "flex-1 transition-all duration-300 ml-96 mr-96",
    )}>
      <div className="h-full flex">
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
                onClick={() => setShowCodePreview(true)}
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
              minHeight: '80vh'
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
                onSelect={(component) => setSelectedComponent(component)}
                onDrop={(item) => handleDrop(item, null)}
                onMove={(dragIndex, hoverIndex, parentId) => moveComponent(dragIndex, hoverIndex, parentId)}
                onUpdate={(component) => updateComponent(component)}
                onDelete={(id) => deleteComponent(id)}
                onAddImages={onAddImages}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 