/**
 * @description 组件拖放操作钩子
 * 处理组件的拖放和移动逻辑
 */
import { useCallback } from 'react';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import type { BaseComponent, ComponentType, DragItem, DropPosition } from '@/types/core';

type UpdateComponentsFunction = (updater: (draft: BaseComponent[]) => void) => void;
type FindComponentFunction = (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null];
type GenerateIdFunction = (type: ComponentType) => string;

export function useComponentDragDrop(
  updateComponents: UpdateComponentsFunction,
  findComponentById: FindComponentFunction,
  generateUniqueId: GenerateIdFunction
) {
  /**
   * @description 处理组件移动
   */
  const moveComponent = useCallback((dragIndex: number, hoverIndex: number, parentId: string | null) => {
    updateComponents(draft => {
      if (!parentId) {
        // 顶层组件移动
        const [removed] = draft.splice(dragIndex, 1);
        draft.splice(hoverIndex, 0, removed);
        return;
      }

      // 子组件移动
      const findAndUpdate = (items: BaseComponent[]) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === parentId) {
            if (items[i].children) {
              const [removed] = items[i].children.splice(dragIndex, 1);
              items[i].children.splice(hoverIndex, 0, removed);
            }
            return true;
          }

          if (items[i].children && items[i].children.length > 0) {
            if (findAndUpdate(items[i].children)) {
              return true;
            }
          }
        }
        return false;
      };

      findAndUpdate(draft);
    });
  }, [updateComponents]);

  /**
   * @description 处理拖放操作
   */
  const handleDrop = useCallback((item: DragItem, targetId: string | null) => {
    if (!item.type) return;

    updateComponents(draft => {
      if (item.isToolItem) {
        // 创建新组件逻辑...
        const template = COMPONENT_TEMPLATES[item.type as keyof typeof COMPONENT_TEMPLATES];
        if (!template) return;

        const newComponent: BaseComponent = {
          id: generateUniqueId(item.type),
          type: item.type,
          children: [],
          ...(template.defaultProperties || {})
        } as BaseComponent;

        // 设置位置逻辑...

        // 添加到目标位置
        if (!targetId) {
          draft.push(newComponent);
        } else {
          insertComponent(draft, targetId, newComponent, item.dropPosition || 'after');
        }
      } else {
        // 移动现有组件逻辑...
        let movedComponent: BaseComponent | null = null;

        // 找到并移除要移动的组件
        const removeComp = (items: BaseComponent[]) => {
          for (let i = 0; i < items.length; i++) {
            if (items[i].id === item.id) {
              movedComponent = JSON.parse(JSON.stringify(items[i]));
              items.splice(i, 1);
              return true;
            }

            if (items[i].children && items[i].children.length > 0) {
              if (removeComp(items[i].children)) {
                return true;
              }
            }
          }
          return false;
        };

        removeComp(draft);

        // 如果成功找到并移除组件，添加到新位置
        if (movedComponent) {
          if (!targetId) {
            draft.push(movedComponent);
          } else {
            insertComponent(draft, targetId, movedComponent, item.dropPosition || 'after');
          }
        }
      }
    });
  }, [generateUniqueId, updateComponents]);

  /**
   * @description 在组件树中插入组件（内部辅助函数）
   */
  const insertComponent = (
    items: BaseComponent[],
    targetId: string,
    componentToInsert: BaseComponent,
    position: DropPosition
  ): boolean => {
    for (let i = 0; i < items.length; i++) {
      if (items[i].id === targetId) {
        if (position === 'nested') {
          // 添加为子组件
          if (!items[i].children) items[i].children = [];
          items[i].children.push(componentToInsert);
        } else if (position === 'before') {
          // 在当前组件前插入
          items.splice(i, 0, componentToInsert);
        } else {
          // 在当前组件后插入
          items.splice(i + 1, 0, componentToInsert);
        }
        return true;
      }

      // 递归处理子组件
      if (items[i].children && items[i].children.length > 0) {
        if (insertComponent(items[i].children, targetId, componentToInsert, position)) {
          return true;
        }
      }
    }
    return false;
  };

  return {
    handleDrop,
    moveComponent
  };
} 