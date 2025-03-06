/**
 * @description 组件拖放操作钩子
 * 处理组件的拖放和移动逻辑
 */
import { useCallback } from 'react';
import { COMPONENT_TEMPLATES } from '@/components/SVGEditor/atomicComponent';
import type { BaseComponent, ComponentType, DragItem, DropPosition } from '@/types/core';

type SetComponentsFunction = React.Dispatch<React.SetStateAction<BaseComponent[]>>;
type FindComponentFunction = (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null];
type GenerateIdFunction = (type: ComponentType) => string;
type RemoveComponentFunction = (components: BaseComponent[], id: string) => BaseComponent[];

export function useComponentDragDrop(
  setComponents: SetComponentsFunction,
  findComponentById: FindComponentFunction,
  generateUniqueId: GenerateIdFunction,
  removeComponentById: RemoveComponentFunction
) {
  /**
   * @description 处理组件移动
   */
  const moveComponent = useCallback((dragIndex: number, hoverIndex: number, parentId: string | null) => {
    setComponents(prev => {
      // 如果是顶层组件
      if (!parentId) {
        const result = [...prev];
        const [removed] = result.splice(dragIndex, 1);
        result.splice(hoverIndex, 0, removed);
        return result;
      }

      // 如果是子组件，需要找到父组件
      const [parentComponent] = findComponentById(prev, parentId);
      if (!parentComponent || !parentComponent.children) return prev;

      const updatedChildren = [...parentComponent.children];
      const [removed] = updatedChildren.splice(dragIndex, 1);
      updatedChildren.splice(hoverIndex, 0, removed);

      // 更新父组件的children
      return prev.map(comp => {
        if (comp.id === parentId) {
          return { ...comp, children: updatedChildren };
        }
        return comp;
      });
    });
  }, [setComponents, findComponentById]);

  /**
   * @description 处理拖放操作
   */
  const handleDrop = useCallback((item: DragItem, targetId: string | null) => {
    // 确保项目有类型
    if (!item.type) return;

    // 检查是新组件还是移动现有组件
    if (item.isToolItem) {
      setComponents(prev => {
        // 创建新组件
        const template = COMPONENT_TEMPLATES[item.type as keyof typeof COMPONENT_TEMPLATES];
        if (!template) return prev;

        const newComponent: BaseComponent = {
          id: generateUniqueId(item.type),
          type: item.type,
          children: [],
          ...(template.defaultProperties || {})
        } as BaseComponent;

        // 设置位置（如果有）
        if (item.x !== undefined && item.y !== undefined) {
          if (!newComponent.style) {
            newComponent.style = {};
          }
          newComponent.style.position = 'absolute';
          newComponent.style.left = `${item.x}px`;
          newComponent.style.top = `${item.y}px`;
        }

        // 如果没有目标，添加到根
        if (!targetId) {
          return [...prev, newComponent];
        }

        // 如果有目标，添加为子组件或在目标前后
        return updateComponentTree(
          prev,
          targetId,
          newComponent,
          item.dropPosition || 'after'
        );
      });
    } else {
      // 移动现有组件
      setComponents(prev => {
        // 查找要移动的组件
        const [movedComponent] = findComponentById(prev, item.id as string);
        if (!movedComponent) return prev;

        // 创建组件的深拷贝
        const componentToMove: BaseComponent = JSON.parse(JSON.stringify(movedComponent));

        // 防止将组件移动到自身
        if (targetId === item.id) return prev;

        // 先移除组件
        const newComponents = removeComponentById(prev, item.id as string);

        // 然后将其添加到新位置
        if (!targetId) {
          return [...newComponents, componentToMove];
        } else {
          return updateComponentTree(
            newComponents,
            targetId,
            componentToMove,
            item.dropPosition || 'after'
          );
        }
      });
    }
  }, [findComponentById, generateUniqueId, removeComponentById, setComponents]);

  /**
   * @description 更新组件树（处理嵌套结构）
   */
  const updateComponentTree = useCallback((
    components: BaseComponent[],
    targetId: string,
    movedComponent: BaseComponent,
    dropPosition: DropPosition = 'after'
  ): BaseComponent[] => {
    if (!Array.isArray(components)) return [];

    const processed = components.map(comp => {
      if (comp.id === targetId) {
        if (dropPosition === 'nested') {
          // 添加为子组件
          return {
            ...comp,
            children: [...(Array.isArray(comp.children) ? comp.children : []), movedComponent]
          };
        } else if (dropPosition === 'before') {
          // 在当前组件前插入
          return [movedComponent, comp];
        } else {
          // 在当前组件后插入
          return [comp, movedComponent];
        }
      }

      // 递归处理子组件
      if (Array.isArray(comp.children) && comp.children.length > 0) {
        return {
          ...comp,
          children: updateComponentTree(comp.children, targetId, movedComponent, dropPosition)
        };
      }

      return comp;
    });

    // 展平可能的数组嵌套
    const flattened = processed.reduce<BaseComponent[]>((acc, curr) => {
      if (Array.isArray(curr)) {
        return [...acc, ...curr];
      }
      return [...acc, curr as BaseComponent];
    }, []);

    return flattened;
  }, []);

  return {
    handleDrop,
    moveComponent,
    updateComponentTree
  };
} 