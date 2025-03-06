/**
 * @description 组件树项
 * 渲染单个组件和其子组件
 */
import { useMemo, useState } from 'react';
import { Image, LucideCode, LucideRefreshCw, Trash, ImagePlus, PlusIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { getComponentTemplate } from '@/components/SVGEditor/atomicComponent';
import { useDragDrop } from '@/hooks/useDragDrop';
import { isDescendantOf } from '@/utils/component';
import type { BaseComponent, DragItem } from '@/types/core';
import { DragIndicator } from './DragIndicator';

interface ComponentTreeItemProps {
  component: BaseComponent;
  isSelected: boolean;
  level: number;
  index: number;
  parentId: string | null;
  selectedId?: string;
  onSelect: (component: BaseComponent) => void;
  onDrop: (item: DragItem, targetId: string | null) => void;
  onMove: (dragIndex: number, hoverIndex: number, parentId: string | null) => void;
  onUpdate: (updated: BaseComponent) => void;
  onDelete: (id: string) => void;
  onAddImages?: (targetId: string) => void;
}

export function ComponentTreeItem({
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
}: ComponentTreeItemProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // 获取组件模板信息
  const template = getComponentTemplate(component.type);

  // 拖放逻辑
  const { ref, isDragging, isOver, isOverCurrent, dropPosition } = useDragDrop({
    component,
    index,
    parentId,
    onDrop,
    onMove,
    isDescendant: isDescendantOf
  });

  /**
   * @description 处理删除组件
   */
  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteDialog(true);
  };

  /**
   * @description 处理确认删除
   */
  const handleConfirmDelete = () => {
    onDelete(component.id);
    setShowDeleteDialog(false);
  };

  /**
   * @description 处理取消删除
   */
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
  };

  /**
   * @description 渲染子组件
   */
  const renderChildren = () => {
    if (!component.children || component.children.length === 0) {
      return null;
    }

    if (!isExpanded) {
      return (
        <div className="text-sm text-gray-500 pl-4 py-1">
          已收起 ({component.children.length} 个子组件)
        </div>
      );
    }

    return (
      <div className="pl-4 pt-2 space-y-2">
        {component.children.map((child, childIndex) => (
          <ComponentTreeItem
            key={child.id}
            component={child}
            isSelected={child.id === selectedId}
            level={level + 1}
            index={childIndex}
            parentId={component.id}
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
    );
  };

  return (
    <div
      ref={ref}
      data-component-id={component.id}
      className={`
        border border-dashed rounded relative
        ${isDragging ? 'opacity-50 bg-gray-50' : ''}
        ${isOver ? 'border-blue-300 bg-blue-50/30' : 'border-gray-200'}
        ${isOverCurrent ? 'transform transition-transform duration-200' : ''}
        hover:border-blue-300 transition-colors duration-200
        ${isSelected ? 'ring-1 ring-blue-300' : ''}
      `}
    >
      {/* 组件标题栏 */}
      <div
        className={`
          flex items-center h-9 px-3 border-b border-dashed
          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
          cursor-pointer transition-colors duration-200
        `}
        onClick={() => onSelect(component)}
      >
        <span className="text-sm text-blue-600 mr-2">{index + 1}</span>
        <span className="mr-2">{template.icon}</span>
        <span className="font-medium">{template.label}</span>

        {/* 将所有操作按钮放在一个容器中，并应用ml-auto确保它们始终在右侧 */}
        <div className="ml-auto flex items-center">
          {/* 扩展/收缩按钮 - 只在有子组件时显示 */}
          {(component.children && component.children.length > 0) && (
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                e.stopPropagation();
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          {/* 删除按钮 */}
          <button
            className="p-1 hover:text-red-600 transition-colors duration-200"
            onClick={handleDelete}
            title="删除组件"
          >
            <Trash className="h-4 w-4" />
          </button>

          {/* 只在 SVG 容器上显示添加图片按钮 */}
          {component.type === 'svgPic' && onAddImages && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onAddImages(component.id);
              }}
              className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ImagePlus className="h-4 w-4 mr-1" />
            </Button>
          )}
        </div>
      </div>

      {/* 组件内容区 */}
      <div className="component-content p-4">
        {renderChildren()}
      </div>

      {/* 拖放指示器 */}
      <DragIndicator isOver={isOverCurrent} position={dropPosition} />

      {/* 删除确认对话框 */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认删除组件</AlertDialogTitle>
            <AlertDialogDescription>
              此操作将删除组件"{template.label}"及其所有子组件，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelDelete}>取消</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} className="bg-red-600 hover:bg-red-700">
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 