/**
 * @description 组件树项
 * 渲染单个组件和其子组件
 */
import { useState, useCallback, useEffect } from 'react';
import { Trash, ImagePlus, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { useDragDrop } from '@/hooks/useDragDrop';
import { isDescendantOf } from '@/utils/component';
import type { BaseComponent } from '@/types/core';
import { DragIndicator } from './DragIndicator';
import { useEditor } from '@/contexts/EditorContext';
import { useAssets } from '@/contexts/AssetContext';

interface ComponentTreeItemProps {
  component: BaseComponent;
  level: number;
  index: number;
  parentId: string | null;
}

export function ComponentTreeItem({
  component,
  level,
  index,
  parentId,
}: ComponentTreeItemProps) {
  const { updateComponent, selectedComponent, selectComponent, handleDrop, deleteComponent, clearSelection, selectPrevComponent, duplicateComponent } = useEditor();
  const { shiftFirstSelectedImage } = useAssets();
  const [isExpanded, setIsExpanded] = useState(true);
  const [name, setName] = useState('');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isSelected = selectedComponent?.id === component.id;

  const template = COMPONENT_TEMPLATES[component.type];

  // 拖放逻辑
  const { ref, isDragging, isOver, isOverCurrent, dropPosition } = useDragDrop({
    component,
    index,
    parentId,
    onDrop: handleDrop,
    isDescendant: isDescendantOf
  });

  // 添加背景图名称处理逻辑
  useEffect(() => {
    if (component.style?.backgroundImage) {
      const bgImage = component.style.backgroundImage;
      // 提取最后一个/后的所有内容，并移除单引号和右括号
      const fileName = bgImage.split('/').pop()?.replace(/[')]/g, '') || '';
      setName(fileName);
    } else {
      setName('');
    }
  }, [component.style?.backgroundImage]);

  /**
   * @description 处理向组件添加图片的功能
   */
  const handleAddImages = useCallback(() => {
    const selectedImage = shiftFirstSelectedImage();
    if (!selectedImage) return;

    const updatedComponent = JSON.parse(JSON.stringify(component));

    if (!updatedComponent.style) {
      updatedComponent.style = {};
    }

    updatedComponent.style.backgroundImage = `url('${selectedImage.relativePath}')`;

    updatedComponent.viewBox = {
      ...updatedComponent.viewBox,
      width: selectedImage.dimensions.width,
      height: selectedImage.dimensions.height
    };

    setName(selectedImage.name);

    updateComponent(updatedComponent);
  }, [component, updateComponent, shiftFirstSelectedImage]);

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
            level={level + 1}
            index={childIndex}
            parentId={component.id}
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
      onClick={(e) => {
        e.stopPropagation();
        if (selectedComponent && selectedComponent.id === component.id) {
          clearSelection();
        } else {
          selectPrevComponent();
          selectComponent(component.id);
        }
      }}
    >
      {/* 组件标题栏 */}
      <div
        className={`
          flex items-center h-9 px-3 border-b border-dashed
          ${isSelected ? 'bg-blue-50' : 'hover:bg-gray-50'}
          cursor-pointer transition-colors duration-200
        `}
      >
        <span className="text-sm text-blue-600 mr-2">{index + 1}</span>
        <span className="mr-2">{template?.icon}</span>
        <span className="font-medium">
          {template?.label}
          {component.style?.backgroundImage && name && `-${name}`}
        </span>

        <div className="ml-auto flex items-center">
          {/* 扩展/收缩按钮 */}
          {(component.children && component.children.length > 0) && (
            <button
              className="p-1 hover:bg-gray-100 rounded"
              onClick={(e) => {
                setIsExpanded(!isExpanded);
              }}
            >
              {isExpanded ? '−' : '+'}
            </button>
          )}

          {/* 添加图片按钮 */}
          {(component.type === 'svgPic' || component.type === 'svgSeamlessPic') && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleAddImages();
              }}
              className="h-7 px-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            >
              <ImagePlus className="h-4 w-4 mr-1" />
            </Button>
          )}

          {/* 复制按钮 */}
          <button
            className="p-1 hover:text-blue-600 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              duplicateComponent(component.id);
            }}
            title="复制组件"
          >
            <Copy
              className="h-4 w-4"
            />
          </button>

          {/* 删除按钮 */}
          <button
            className="p-1 hover:text-red-600 transition-colors duration-200"
            onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(true);
            }}
            title="删除组件"
          >
            <Trash
              className="h-4 w-4"
            />
          </button>

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
              此操作将删除组件"{template?.label}"及其所有子组件，此操作无法撤销。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={(e) => {
              e.stopPropagation();
              setShowDeleteDialog(false);
            }}>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.stopPropagation();
                // 删除前清除背景图关联的名称
                setName('');
                deleteComponent(component.id);
                setShowDeleteDialog(false);
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 