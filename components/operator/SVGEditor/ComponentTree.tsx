"use client"

import { useDrag, useDrop, DropTargetMonitor } from 'react-dnd'
import type { BaseComponent, DragItem, ComponentType } from '@/types/atomicComponents/index'
import { COMPONENT_TEMPLATES } from '@/types/atomicComponents/index'
import { Image, LucideCode, LucideRefreshCw, Trash, ImagePlus, PlusIcon } from 'lucide-react'
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
import { useEditor } from '@/contexts/EditorContext'

interface ComponentTreeProps {
  components: BaseComponent[]
  selectedId?: string
  level?: number
  onSelect: (component: BaseComponent) => void
  onDrop: (item: DragItem, targetId: string | null) => void
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void
  onUpdate: (updated: BaseComponent) => void
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
  const validComponents = components.filter((component): component is BaseComponent => {
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

  // 组件树项渲染
  function renderComponent(component: BaseComponent, level: number) {
    const isContainer = component.type === 'svgPic'
    const hasChildren = component.children && component.children.length > 0;

    return (
      <div className="component-item" style={{ paddingLeft: `${level * 8}px` }}>
        <div className="component-header">
          <span>{COMPONENT_TEMPLATES[component.type].label}</span>

          {/* 组件操作按钮 */}
          <div className="component-actions">
            {/* 编辑按钮 */}
            {/* 删除按钮 */}

            {/* 只在容器组件上显示添加子组件按钮 */}
            {isContainer && (
              <Button
                onClick={() => showAddChildMenu(component.id)}
                className="add-child-button"
              >
                <PlusIcon />
              </Button>
            )}
          </div>
        </div>

        {/* 子组件列表 */}
        {hasChildren && (
          <div className="component-children">
            {component.children!.map(child => renderComponent(child, level + 1))}
          </div>
        )}
      </div>
    );
  }

  const showAddChildMenu = (componentId: string) => {
    // 确保findComponentById和addComponent可用
    const { findComponentById, addComponent } = useEditor();

    // 获取组件类型
    const [targetComponent] = findComponentById(components, componentId);
    if (!targetComponent) return;

    // 找出模板允许的子组件类型
    const template = COMPONENT_TEMPLATES[targetComponent.type];
    const allowedChildren = template?.allowedChildren || [];

    if (allowedChildren.length === 0) {
      alert('此组件不允许添加子组件');
      return;
    }

    // 简化版：直接添加第一个允许的子组件类型
    const childType = allowedChildren[0] as ComponentType;
    addComponent(childType);
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
  component: BaseComponent
  isSelected: boolean
  level: number
  index: number
  parentId: string | null
  selectedId?: string
  onSelect: (component: BaseComponent) => void
  onDrop: (item: DragItem, targetId: string | null) => void
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void
  onUpdate: (updated: BaseComponent) => void
  onDelete: (id: string) => void
  onAddImages?: (targetId: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [isCodeEditorOpen, setIsCodeEditorOpen] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)  // 添加删除确认状态
  const [showCodePreview, setShowCodePreview] = useState(false)
  const [previewComponent, setPreviewComponent] = useState<BaseComponent | null>(null)

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


  // 检查组件是否为目标的后代（防止循环嵌套）
  const isDescendant = (parent: BaseComponent, childId: string): boolean => {
    if (!parent.children) return false;

    return parent.children.some(child =>
      child.id === childId || isDescendant(child, childId)
    );
  };

  // 获取放置位置（前、后、内部）
  const getDropPosition = (monitor: DropTargetMonitor): 'before' | 'after' | 'nested' => {
    const clientOffset = monitor.getClientOffset();

    if (!clientOffset || !ref.current) {
      return 'after';
    }

    const hoverBoundingRect = ref.current.getBoundingClientRect();
    const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

    // 计算鼠标位置相对于组件的位置
    const hoverClientY = clientOffset.y - hoverBoundingRect.top;

    // 计算相对鼠标位置与组件中心的距离（百分比）
    const relativePosition = Math.abs(hoverClientY - hoverMiddleY) / hoverMiddleY;

    // 如果鼠标位置非常接近中心（20%范围内），视为嵌套放置
    if (relativePosition < 0.2) {
      return 'nested';
    }

    // 否则根据鼠标在组件上方还是下方决定放置位置
    return hoverClientY < hoverMiddleY ? 'before' : 'after';
  };

  const [{ isOver, isOverCurrent, dropPosition }, drop] = useDrop(() => ({
    // 接受所有组件类型
    accept: Object.keys(COMPONENT_TEMPLATES),

    // 判断是否可以放置
    canDrop: (item: DragItem) => {
      // 检查是否允许嵌套
      if (component && item.type) {
        const template = COMPONENT_TEMPLATES[component.type];

        // 1. 检查目标组件是否允许此类型的子组件
        if (dropPosition === 'nested' &&
          (!template.allowedChildren ||
            !template.allowedChildren.includes(item.type))) {
          return false;
        }

        // 2. 防止循环嵌套
        if (dropPosition === 'nested' &&
          item.id &&
          isDescendant(component, item.id)) {
          return false;
        }
      }

      return true;
    },

    // 处理悬停事件
    hover: (item, monitor) => {
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

    // 处理放置事件
    drop: (item, monitor) => {
      if (monitor.didDrop()) {
        // 已被子组件处理
        return;
      }

      if (item.isToolItem) {
        // 添加新组件
        onDrop(item, component.id);
      } else {
        // 移动现有组件
        onMove(item.index!, index, component.id);
      }

      return { id: component.id };
    },

    // 收集属性
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      isOverCurrent: monitor.isOver({ shallow: true }),
      dropPosition: getDropPosition(monitor)
    })
  }), [component.id, index, onDrop, onMove]);


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
    if (!component.children || component.children.length === 0) {
      return null;
    }

    return (
      <div className="ml-4 pl-2 border-l border-gray-200">
        <ComponentTree
          components={component.children}
          selectedId={selectedId}
          level={level + 1}
          onSelect={onSelect}
          onDrop={onDrop}
          onMove={onMove}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      </div>
    );
  };

  // 修改删除处理函数
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()  // 防止触发选中事件
    setShowDeleteAlert(true)
  }

  // 处理代码预览
  const handleCodePreview = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowCodePreview(true);
    setPreviewComponent(component);
  };

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
          {component.type === 'svgPic' && (
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
        {showCodePreview && (
          <Dialog open={showCodePreview} onOpenChange={setShowCodePreview}>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>组件代码</DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <pre className="p-4 bg-gray-50 rounded-lg">
                  <code className="text-sm text-gray-700 whitespace-pre-wrap break-all">
                    {generateCode(component)}
                  </code>
                </pre>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
} 