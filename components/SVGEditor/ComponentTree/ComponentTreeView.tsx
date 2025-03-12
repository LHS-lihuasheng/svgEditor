/**
 * @description 组件树视图组件
 * 负责渲染组件树的整体结构
 */
import { useCallback } from 'react';
import { ComponentTreeItem } from './ComponentTreeItem';
import { useAssets } from '@/contexts/AssetContext';
import type { ComponentTreeProps } from './index';
import { useEditor } from '@/contexts/EditorContext/index';

export function ComponentTreeView({
  level = 0
}: ComponentTreeProps) {

  const { components, selectedComponent, updateComponent } = useEditor();

  const { shiftFirstSelectedImage } = useAssets();

  /**
   * @description 处理向组件添加图片的功能
   * @param {string} componentId - 目标组件的ID
   */
  const handleAddImages = useCallback((componentId: string) => {
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
    updateComponent(updatedComponent);
  }, [components, updateComponent, shiftFirstSelectedImage]);

  return (
    <div className="space-y-2">
      {components.map((component, index) => (
        <ComponentTreeItem
          key={component.id}
          component={component}
          isSelected={component.id === selectedComponent?.id}
          level={level}
          index={index}
          parentId={null}
          selectedId={selectedComponent?.id}
          onAddImages={handleAddImages}
        />
      ))}
    </div>
  );
} 