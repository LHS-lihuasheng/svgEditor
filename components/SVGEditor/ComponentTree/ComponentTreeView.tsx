/**
 * @description 组件树视图组件
 * 负责渲染组件树的整体结构
 */
import { useCallback } from 'react';
import { ComponentTreeItem } from './ComponentTreeItem';
import { useAssets } from '@/contexts/AssetContext';
import type { ComponentTreeProps } from './index';
import type { BaseComponent } from '@/types/core';

export function ComponentTreeView({
  components,
  selectedId,
  level = 0,
  onSelect,
  onDrop,
  onMove,
  onUpdate,
  onDelete,
  onAddImages
}: ComponentTreeProps) {
  // 添加类型检查，过滤掉无效的组件
  const validComponents = components.filter((component): component is BaseComponent => {
    if (!component || typeof component !== 'object') {
      console.warn('Invalid component found:', component);
      return false;
    }
    return true;
  });

  const { shiftFirstSelectedImage } = useAssets();

  /**
   * @description 处理向组件添加图片的功能
   * @param {string} componentId - 目标组件的ID
   */
  const handleAddImages = useCallback((componentId: string) => {
    if (!onAddImages) return;
    
    const selectedImage = shiftFirstSelectedImage();
    if (!selectedImage) return;

    // 获取要更新的组件
    const componentToUpdate = components.find(comp => comp.id === componentId);
    if (!componentToUpdate) return;

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
  }, [components, onUpdate, shiftFirstSelectedImage, onAddImages]);

  return (
    <div className="space-y-2">
      {validComponents.map((component, index) => (
        <ComponentTreeItem
          key={component.id}
          component={component}
          isSelected={component.id === selectedId}
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
  );
} 