"use client"

import { useDrag, useDrop } from 'react-dnd'
import type { Component, DragItem } from '@/types/atomicComponent'
import { COMPONENT_TEMPLATES } from '@/types/atomicComponent'
import { Image, LucideCode, LucideRefreshCw, Trash, ImagePlus } from 'lucide-react'
import { useRef, useState } from 'react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Button } from "@/components/ui/button"
import { generateCode } from '@/utils/code-generator'
import { useAssets } from '@/contexts/AssetContext'

interface ComponentTreeProps {
  components: Component[]
  selectedId?: string
  level?: number
  onSelect: (component: Component) => void
  onDrop: (item: DragItem, targetId: string | null) => void
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void
  onUpdate: (updated: Component) => void
  onDelete: (id: string) => void
}

export function ComponentTree({
  components,
  selectedId,
  level = 0,
  onSelect,
  onDrop,
  onMove,
  onUpdate,
  onDelete,
}: ComponentTreeProps) {
  // 添加类型检查，过滤掉无效的组件
  const validComponents = components.filter((component): component is Component => {
    if (!component || typeof component !== 'object') {
      console.warn('Invalid component found:', component)
      return false
    }
    return true
  })

  const { shiftFirstSelectedImage } = useAssets();

  const handleAddImages = (componentId: string) => {
    const selectedImage = shiftFirstSelectedImage();

    if (selectedImage && componentId) {
      // 获取要更新的组件
      const componentToUpdate = components.find(comp => comp.id === componentId);

      if (componentToUpdate) {
        // 创建组件的副本
        const updatedComponent = JSON.parse(JSON.stringify(componentToUpdate));

        // 确保style对象存在
        if (!updatedComponent.style) {
          updatedComponent.style = {};
        }

        // 设置背景图片
        updatedComponent.style.backgroundImage = `url('${selectedImage.relativePath}')`;

        // 更新viewBox以匹配图片尺寸
        updatedComponent.viewBox = {
          ...updatedComponent.viewBox,
          width: selectedImage.dimensions.width,
          height: selectedImage.dimensions.height
        };

        // 更新组件
        onUpdate(updatedComponent);
      }
    }
  };

  return (
    <div
      className="w-full h-full relative"
      style={{
        minHeight: 'inherit' // 继承父容器高度
      }}
    >
      <div className="space-y-2">
        {validComponents.map((component, index) => (
          <ComponentTreeItem
            key={component.id}
            component={component}
            isSelected={selectedId ? component.id === selectedId : false}
            level={level}
            index={index}
            parentId={null}
            selectedId={selectedId}
            onSelect={onSelect}
            onDrop={onDrop}
            onMove={onMove}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddImages={handleAddImages}
          />
        ))}
      </div>
    </div>
  )
}

function ComponentTreeItem({
  component,
  isSelected,
  level,
  index,
  parentId,
  selectedId,
  onSelect,
  onDrop,
  onMove,
  onUpdate,
  onDelete,
  onAddImages
}: {
  component: Component
  isSelected: boolean
  level: number
  index: number
  parentId: string | null
  selectedId?: string
  onSelect: (component: Component) => void
  onDrop: (item: DragItem, targetId: string | null) => void
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void
  onUpdate: (updated: Component) => void
  onDelete: (id: string) => void
  onAddImages?: (targetId: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)  // 添加删除确认状态
  const [showCodePreview, setShowCodePreview] = useState(false)

  const [{ isDragging }, drag] = useDrag({
    type: 'COMPONENT',
    item: {
      id: component.id,
      type: component.type,
      index,
      parentId
    },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    })
  })

  const [{ isOver, isOverCurrent, dropPosition }, drop] = useDrop({
    accept: ['TOOL', 'COMPONENT'],
    hover: (item: DragItem, monitor) => {
      if (!ref.current) return
      if (!item.isToolItem && item.id === component.id) return

      // 计算鼠标位置相对于组件的位置
      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      // 确定放置位置
      const hoverThreshold = 0.1; // 上下区域阈值
      const relativePosition = hoverClientY / (hoverBoundingRect.bottom - hoverBoundingRect.top);

      if (relativePosition < hoverThreshold) {
        item.dropPosition = 'before'
      } else if (relativePosition > (1 - hoverThreshold)) {
        item.dropPosition = 'after'
      } else {
        // 禁止将组件嵌套到自己或自己的子组件中
        if (!isDescendant(component, item.id)) {
          item.dropPosition = 'nested'
        } else {
          item.dropPosition = 'after'
        }
      }
    },

    drop: (item: DragItem, monitor) => {
      if (monitor.didDrop()) return

      // 确保设置了 dropPosition
      const finalItem = { ...item };
      if (!finalItem.dropPosition) {
        finalItem.dropPosition = 'after' // 默认值
      }

      onDrop(finalItem, component.id)
      return { handled: true }
    },

    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      dropPosition: (monitor.getItem() as DragItem)?.dropPosition
    })
  })

  // 添加检查组件是否是另一个组件的后代的辅助函数
  const isDescendant = (targetComponent: Component, sourceId: string | undefined): boolean => {
    if (!sourceId) return false
    if (!targetComponent.children) return false

    return targetComponent.children.some(child =>
      child.id === sourceId || isDescendant(child, sourceId)
    )
  }

  // 计算拖放指示器的位置和样式
  const getDropIndicatorStyle = () => {
    if (!isOverCurrent || !dropPosition) return null

    // 直接使用既定的dropPosition来确定样式
    switch (dropPosition) {
      case 'before':
        return 'before';
      case 'after':
        return 'after';
      case 'nested':
        return 'nested';
      default:
        return null;
    }
  }

  const dropIndicatorStyle = getDropIndicatorStyle()

  drag(drop(ref))

  const template = COMPONENT_TEMPLATES[component.type] || {
    icon: '📦',
    label: component.type
  }

  // 确保组件内容区域的渲染也有类型检查
  const renderChildren = () => {
    if (!component.children) return null

    const validChildren = component.children.filter((child): child is Component => {
      if (!child || typeof child !== 'object') {
        console.warn('Invalid child component found:', child)
        return false
      }
      return true
    })

    if (validChildren.length === 0) {
      return (
        <div className="text-gray-400 text-sm text-center py-2">
          拖拽组件到这里
        </div>
      )
    }

    return (
      <div className="space-y-2">
        {validChildren.map((child, childIndex) => (
          <ComponentTreeItem
            key={child.id}
            component={child}
            isSelected={selectedId ? child.id === selectedId : false}
            level={level + 1}
            index={childIndex}
            parentId={component.id}  // 传递当前组件ID作为父ID
            selectedId={selectedId}
            onSelect={onSelect}
            onDrop={onDrop}
            onMove={onMove}
            onUpdate={onUpdate}
            onDelete={onDelete}
            onAddImages={onAddImages}
          />
        ))}
      </div>
    )
  }

  // 修改删除处理函数
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()  // 防止触发选中事件
    setShowDeleteAlert(true)
  }

  // 处理代码预览
  const handleCodePreview = (e: React.MouseEvent) => {
    e.stopPropagation()  // 防止触发选中事件
    setShowCodePreview(true)
  }

  return (
    <div style={{ marginLeft: level * 16 }}>
      <div
        ref={ref}
        className={`
          border border-dashed rounded relative
          ${isDragging ? 'opacity-50' : ''}
          ${isOver ? 'border-blue-300' : 'border-gray-200'}
          ${isOverCurrent ? 'transform transition-transform duration-200' : ''}
          hover:border-blue-300 transition-colors duration-200
        `}
      >
        {/* 组件标题栏 */}
        <div
          className={`
            flex items-center h-8 px-3 border-b border-dashed
            ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
            cursor-pointer transition-colors duration-200
          `}
          onClick={() => onSelect(component)}
        >
          <span className="text-sm text-blue-600 mr-2">{index + 1}</span>
          <span className="mr-2">{template.icon}</span>
          <span className="font-medium">{template.label}</span>
          <div className="flex-1" />
          <button
            className="p-1 hover:text-blue-600 transition-colors duration-200"
            onClick={handleCodePreview}
            title="查看代码"
          >
            <LucideCode className="h-4 w-4" />
          </button>
          <button className="p-1 hover:text-blue-600">
            <LucideRefreshCw className="h-4 w-4" />
          </button>
          <button
            className="p-1 hover:text-red-600 transition-colors duration-200"
            onClick={handleDelete}
            title="删除组件"
          >
            <Trash className="h-4 w-4" />
          </button>
          {/* 只在 SVG 容器上显示添加图片按钮 */}
          {component.type === 'svg' && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onAddImages?.(component.id)
              }}
              className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ImagePlus className="h-4 w-4 mr-1" />
            </Button>
          )}
        </div>

        {/* 组件内容区 - 添加 component-content 类名 */}
        <div className="component-content p-4">
          {renderChildren()}
        </div>

        {/* 拖放指示器 */}
        {isOverCurrent && dropPosition && (
          <>
            {/* 上方插入线 */}
            <div className={`
              absolute -top-px left-0 right-0 h-[2px]
              ${getDropIndicatorStyle() === 'before' ? 'bg-blue-500 scale-y-100' : 'bg-transparent scale-y-0'}
              transition-all duration-200 transform origin-center
            `} />

            {/* 下方插入线 */}
            <div className={`
              absolute -bottom-px left-0 right-0 h-[2px]
              ${getDropIndicatorStyle() === 'after' ? 'bg-blue-500 scale-y-100' : 'bg-transparent scale-y-0'}
              transition-all duration-200 transform origin-center
            `} />

            {/* 嵌套指示框 */}
            <div className={`
              absolute inset-[1px] border-2 rounded pointer-events-none
              ${getDropIndicatorStyle() === 'nested'
                ? 'border-blue-500 opacity-100 scale-100'
                : 'border-transparent opacity-0 scale-95'
              }
              transition-all duration-200 transform
            `} />
          </>
        )}

        {/* 删除确认对话框 */}
        <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>
                确定要删除 {template.label} 组件吗？此操作不可撤销。
                {component.children && component.children.length > 0 && (
                  <p className="mt-2 text-yellow-600">
                    注意：删除此组件将同时删除其包含的 {component.children.length} 个子组件。
                  </p>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-500 hover:bg-red-600"
                onClick={() => {
                  onDelete(component.id)
                  setShowDeleteAlert(false)
                }}
              >
                删除
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* 代码预览对话框 */}
        <Dialog open={showCodePreview} onOpenChange={setShowCodePreview}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                <div className="flex items-center">
                  <span className="mr-2">{template.icon}</span>
                  <span>{template.label} 组件代码</span>
                </div>
              </DialogTitle>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <pre className="p-4 bg-gray-50 rounded-lg">
                <code className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                  {generateCode(component)}
                </code>
              </pre>
            </ScrollArea>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCodePreview(false)}
              >
                关闭
              </Button>
              <Button
                variant="default"
                size="sm"
                onClick={() => {
                  setShowCodePreview(false)
                  setIsCodeEditorOpen(true)
                }}
              >
                编辑代码
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
} 