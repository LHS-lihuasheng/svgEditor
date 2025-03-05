"use client"

import { useDrop } from 'react-dnd'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { generateCode } from "@/utils/code-generator"
import { SideBarMenu } from "./sideBarMenu/sideBarMenu"
import { EditorArea } from "./EditorArea"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Parameters } from "./Parameters/index"
import { PanelProvider } from '@/contexts/PanelContext'
import { useAssets } from '@/contexts/AssetContext'
import type { BaseComponent, DragItem } from '@/types/core'
import { useEditor } from '@/contexts/EditorContext/index'
import { EditorProvider } from '@/contexts/EditorContext/index'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'


/**
 * @description SVG编辑器的顶层容器组件，提供所有必要的上下文
 * @returns {JSX.Element} 带有所有必要上下文的SVG编辑器组件
 */
export default function SVGEditorContainer() {
  return (
    <DndProvider backend={HTML5Backend}>
      <EditorProvider>
        <PanelProvider>
          <TooltipProvider>
            <SVGEditor />
          </TooltipProvider>
        </PanelProvider>
      </EditorProvider>
    </DndProvider>
  )
}

/**
 * @description SVG编辑器的主要组件，处理编辑器的核心功能
 * @returns {JSX.Element} SVG编辑器的用户界面
 */
export function SVGEditor() {
  const {
    components,
    showCodePreview,
    setShowCodePreview,
    selectedComponent,
    handleDrop,
    updateComponent,
    addComponent
  } = useEditor()
  const { shiftFirstSelectedImage } = useAssets()

  /**
   * @description 处理拖放操作
   */
  const [, drop] = useDrop<DragItem, void, any>(() => ({
    accept: ['TOOL', 'COMPONENT'],
    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return;

      const editorElement = document.getElementById('editor-area');
      if (!editorElement) return;

      const editorRect = editorElement.getBoundingClientRect();
      const offset = monitor.getClientOffset();
      if (!offset) return;

      const x = offset.x - editorRect.left;
      const y = offset.y - editorRect.top;

      const targetElement = document.elementFromPoint(offset.x, offset.y);
      const targetComponentId = targetElement?.closest('[data-component-id]')?.getAttribute('data-component-id') || null;

      const updatedItem: DragItem = {
        ...item,
        x,
        y
      };

      handleDrop(updatedItem, targetComponentId);
    }
  }))

  /**
   * @description 处理向组件添加图片的功能
   * @param {string} componentId - 目标组件的唯一标识符
   */
  const handleAddImages = (componentId: string) => {
    const selectedImage = shiftFirstSelectedImage()

    if (selectedImage && componentId) {
      /**
       * @description 递归查找特定ID的组件
       * @param {BaseComponent[]} comps - 要搜索的组件数组
       * @param {string} id - 要查找的组件ID
       * @returns {BaseComponent|undefined} 找到的组件或undefined
       */
      const findComponent = (comps: BaseComponent[], id: string): BaseComponent | undefined => {
        for (const comp of comps) {
          if (comp.id === id) return comp
          if (comp.children) {
            const found = findComponent(comp.children, id)
            if (found) return found
          }
        }
        return undefined
      }

      const targetComponent = findComponent(components, componentId)

      if (targetComponent) {
        // 创建组件的副本
        const updatedComponent = JSON.parse(JSON.stringify(targetComponent))

        // 确保style对象存在
        if (!updatedComponent.style) {
          updatedComponent.style = {}
        }

        // 设置背景图片
        updatedComponent.style.backgroundImage = `url('${selectedImage.relativePath}')`

        // 更新viewBox以匹配图片尺寸
        updatedComponent.viewBox = {
          ...updatedComponent.viewBox,
          width: selectedImage.dimensions.width,
          height: selectedImage.dimensions.height
        }

        // 更新组件
        updateComponent(updatedComponent)
      }
    }
  }

  return (
    <div className="h-full flex bg-gray-50">
      <SideBarMenu onAddComponent={addComponent} selectedComponent={selectedComponent} />
      <EditorArea
        dropRef={drop as unknown as React.RefObject<HTMLDivElement>}
        onAddImages={handleAddImages}
      />
      <Parameters selectedComponent={selectedComponent} />

      {/* 代码预览对话框 */}
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