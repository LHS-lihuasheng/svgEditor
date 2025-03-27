/**
 * @description 组件树项
 * 渲染单个组件和其子组件
 */
import { useState, useCallback } from 'react';
import { Trash, ImagePlus, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useDragDrop } from '@/hooks/useDragDrop';
import { isDescendantOf } from '@/utils/component';
import type { BaseComponent } from '@/types';
import { DragIndicator } from './DragIndicator';
import { useEditor } from '@/contexts/EditorContext';
import { useAssets } from '@/contexts/AssetContext';

interface ComponentTreeItemProps {
  component: BaseComponent;
  level: number;
  index: number;
  onDeleteRequest: (component: BaseComponent) => void;
}

export function ComponentTreeItem({
  component,
  level,
  index,
  onDeleteRequest
}: ComponentTreeItemProps) {
  const { updateComponent, selectedComponent, selectComponent, handleDrop, clearSelection, selectPrevComponent, duplicateComponent } = useEditor();
  const { shiftFirstSelectedImage } = useAssets();
  const [isExpanded, setIsExpanded] = useState(true);

  const isSelected = selectedComponent?.id === component.id;

  // 拖放逻辑
  const { ref, isDragging, isOver, isOverCurrent, dropPosition } = useDragDrop({
    component,
    onDrop: handleDrop,
    isDescendant: isDescendantOf
  });

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

    updatedComponent.attributes.viewBox = {
      ...updatedComponent.attributes.viewBox,
      width: 1080.0,
      height: Number((selectedImage.dimensions.height / selectedImage.dimensions.width * 1080.0).toFixed(2))
    };

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
            onDeleteRequest={onDeleteRequest}
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
        <span className={`mr-2 ${'text-gray-700'}`}>
          <span className="font-bold text-sm">{component.type}</span>
          {component.attributes?.id && (
            <span className="text-blue-500 text-xs">{`#${component.attributes.id}`}</span>
          )}
          {component.style?.backgroundImage && (
            <span className="italic text-gray-600 text-xs">
              {`(${component.style.backgroundImage.split('/').pop()?.replace(/[')]/g, '')})`}
            </span>
          )}
        </span>

        <div className="ml-auto flex items-center">
          {/* 扩展/收缩按钮 */}
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

          {/* 添加图片按钮 */}
          {(component.type === 'svg') && (
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
              onDeleteRequest(component);
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
    </div>
  );
} 