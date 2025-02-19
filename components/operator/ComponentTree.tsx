"use client"

import { useDrag, useDrop } from 'react-dnd'
import type { Component, DragItem } from '@/types/svg-editor'
import { COMPONENT_TEMPLATES } from '@/types/svg-editor'
import { Image, LucideCode, LucideRefreshCw, Trash } from 'lucide-react'
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
  onDelete
}: ComponentTreeProps) {
  // 添加类型检查，过滤掉无效的组件
  const validComponents = components.filter((component): component is Component => {
    if (!component || typeof component !== 'object') {
      console.warn('Invalid component found:', component)
      return false
    }
    return true
  })

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
  onDelete
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

      const componentRect = ref.current.getBoundingClientRect()
      const contentRect = ref.current.querySelector('.component-content')?.getBoundingClientRect()
      if (!contentRect || !componentRect) return

      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      // 计算相对于整个组件的位置（包括标题栏）
      const hoverClientY = clientOffset.y - componentRect.top
      const componentHeight = componentRect.height

      // 扩大标题栏和边缘的响应区域
      const headerHeight = 32 // 标题栏高度
      const edgeSize = 20    // 边缘响应区域大小

      // 判断拖拽位置
      if (hoverClientY < headerHeight + edgeSize) {
        // 上方区域（包括标题栏），作为同级
        item.dropPosition = 'before'
      } else if (hoverClientY > componentHeight - edgeSize) {
        // 下方边缘，作为同级
        item.dropPosition = 'after'
      } else if (
        // 检查是否在左侧边缘
        clientOffset.x < componentRect.left + edgeSize ||
        // 或右侧边缘
        clientOffset.x > componentRect.right - edgeSize
      ) {
        // 在侧边拖动时，优先作为同级
        item.dropPosition = 'after'
      } else {
        // 中间区域，尝试嵌套
        if (!isDescendant(component, item.id)) {
          item.dropPosition = 'nested'
        } else {
          item.dropPosition = 'after'
        }
      }
    },
    drop: (item: DragItem, monitor) => {
      if (!ref.current) return
      if (!item.isToolItem && item.id === component.id) return
      if (monitor.didDrop()) return

      const componentRect = ref.current.getBoundingClientRect()
      const contentRect = ref.current.querySelector('.component-content')?.getBoundingClientRect()
      if (!contentRect || !componentRect) return

      const clientOffset = monitor.getClientOffset()
      if (!clientOffset) return

      const hoverClientY = clientOffset.y - componentRect.top
      const componentHeight = componentRect.height
      const headerHeight = 32
      const edgeSize = 20

      // 使用与 hover 相同的逻辑处理放置
      if (hoverClientY < headerHeight + edgeSize) {
        // 放在当前组件前面
        if (!item.isToolItem && item.index !== undefined) {
          onMove(item.index, index, parentId)
        } else {
          onDrop(item, parentId)
        }
      } else if (hoverClientY > componentHeight - edgeSize) {
        // 放在当前组件后面
        if (!item.isToolItem && item.index !== undefined) {
          onMove(item.index, index + 1, parentId)
        } else {
          onDrop(item, parentId)
        }
      } else if (
        clientOffset.x < componentRect.left + edgeSize ||
        clientOffset.x > componentRect.right - edgeSize
      ) {
        // 侧边放置，作为同级
        if (!item.isToolItem && item.index !== undefined) {
          onMove(item.index, index + 1, parentId)
        } else {
          onDrop(item, parentId)
        }
      } else {
        // 中间区域，尝试嵌套
        if (!isDescendant(component, item.id)) {
          onDrop(item, component.id)
        } else {
          // 如果不能嵌套，则放在后面
          if (!item.isToolItem && item.index !== undefined) {
            onMove(item.index, index + 1, parentId)
          } else {
            onDrop(item, parentId)
          }
        }
      }
    },
    collect: monitor => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      dropPosition: monitor.getClientOffset()
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

    const contentRect = ref.current?.querySelector('.component-content')?.getBoundingClientRect()
    if (!contentRect) return null

    const hoverClientY = dropPosition.y - contentRect.top

    if (hoverClientY < 10) {
      return 'before'
    } else if (hoverClientY > contentRect.height - 10) {
      return 'nested'
    } else {
      return 'after'
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
                  {component.code || COMPONENT_TEMPLATES[component.type]?.code || ''}
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