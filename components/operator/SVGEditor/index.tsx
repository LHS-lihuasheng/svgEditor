"use client"

import { useDrop } from 'react-dnd'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { generateCode } from "@/utils/code-generator"
import { SideBarMenu } from "./sideBarMenu/index"
import { EditorArea } from "./EditorArea"
import { EditorProvider, useEditor } from '@/contexts/EditorContext'
import { MenuBarProvider } from '@/contexts/MenuBarContext'
import { TooltipProvider } from "@/components/ui/tooltip"
import { Parameters } from "./Parameters"
import { ParametersPanelProvider } from '@/contexts/ParametersPanelContext'

// 编辑器容器组件
export default function SVGEditorContainer() {
  return (
    <EditorProvider>
      <MenuBarProvider>
        <ParametersPanelProvider>
          <TooltipProvider>
            <SVGEditor />
          </TooltipProvider>
        </ParametersPanelProvider>
      </MenuBarProvider>
    </EditorProvider>
  )
}

// 编辑器主要组件
function SVGEditor() {
  const {
    components,
    showCodePreview,
    setShowCodePreview,
    selectedComponent,
    handleDrop
  } = useEditor()

  // 设置拖放区域
  const [, drop] = useDrop<any, void, any>(() => ({
    accept: ['TOOL', 'COMPONENT'],
    drop: (item, monitor) => {
      if (monitor.didDrop()) return

      const editorElement = document.getElementById('editor-area')
      if (!editorElement) return

      const editorRect = editorElement.getBoundingClientRect()
      const offset = monitor.getClientOffset()
      if (!offset) return

      const x = offset.x - editorRect.left
      const y = offset.y - editorRect.top

      if (item.isToolItem) {
        // 重用handleDrop，但传入坐标
        const positionedItem = {
          ...item,
          position: {
            x: Math.max(0, Math.min(x, editorRect.width - 100)),
            y: Math.max(0, Math.min(y, editorRect.height - 100))
          }
        }
        handleDrop(positionedItem, null)
      } else {
        handleDrop(item, null)
      }
    }
  }))

  return (
    <div className="h-full flex bg-gray-50">
      <SideBarMenu onAddComponent={() => { }} selectedComponent={selectedComponent} />
      <EditorArea dropRef={drop as unknown as React.RefObject<HTMLDivElement>} />
      <Parameters selectedComponent={selectedComponent} />

      <Dialog open={showCodePreview} onOpenChange={setShowCodePreview}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>完整代码预览</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh]">
            <pre className="p-4 bg-gray-50 rounded-lg">
              <code className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                {generateCode(components)}
              </code>
            </pre>
          </ScrollArea>
          <div className="flex justify-end">
            <Button
              variant="outline"
              size="sm"
              className="mr-2"
              onClick={() => {
                navigator.clipboard.writeText(generateCode(components))
                  .then(() => alert("代码已复制到剪贴板"))
                  .catch(err => console.error("复制失败:", err))
              }}
            >
              复制代码
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCodePreview(false)}
            >
              关闭
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}