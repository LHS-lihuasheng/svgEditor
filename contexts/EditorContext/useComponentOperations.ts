/**
 * @description 组件操作钩子
 * 提供组件的通用操作方法
 */
import { useCallback } from 'react';
import { useEditor } from './index';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import type { BaseComponent, ComponentType } from '@/types/core';

export function useComponentOperations() {
  const {
    components,
    findComponentById,
    updateComponent,
    setComponents
  } = useEditor();

  /**
   * @description 添加子组件
   */
  const addChildComponent = useCallback((parentId: string, childType: ComponentType) => {
    const [parent] = findComponentById(components, parentId);
    if (!parent) return;

    const childTemplate = COMPONENT_TEMPLATES[childType];
    const childId = `${childType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const childComponent: BaseComponent = {
      id: childId,
      type: childType,
      children: [],
      ...(childTemplate?.defaultProperties || {})
    };

    // 将操作交给updateComponent处理
    updateComponent({
      ...parent,
      children: [...(Array.isArray(parent.children) ? parent.children : []), childComponent]
    });
  }, [components, findComponentById, updateComponent]);

  /**
   * @description 更新组件样式
   */
  const updateComponentStyle = useCallback((
    componentId: string,
    styleProp: string,
    value: any
  ) => {
    const [component] = findComponentById(components, componentId);
    if (!component) return;

    updateComponent({
      ...component,
      style: {
        ...(component.style || {}),
        [styleProp]: value
      }
    });
  }, [components, findComponentById, updateComponent]);

  /**
   * @description 更新组件属性
   */
  const updateComponentAttribute = useCallback((
    componentId: string,
    attrKey: string,
    value: any
  ) => {
    const [component] = findComponentById(components, componentId);
    if (!component) return;

    updateComponent({
      ...component,
      attributes: {
        ...(component.attributes || {}),
        [attrKey]: value
      }
    });
  }, [components, findComponentById, updateComponent]);

  /**
   * @description 复制组件
   * 完成了未实现的逻辑，利用immer来更新组件树
   */
  const duplicateComponent = useCallback((componentId: string) => {
    const [component, parentArray] = findComponentById(components, componentId);
    if (!component || !parentArray) return;

    // 创建深拷贝
    const clone = JSON.parse(JSON.stringify(component));

    // 为克隆的组件及其所有子组件分配新ID
    const assignNewIds = (comp: BaseComponent): BaseComponent => {
      const newComp = {
        ...comp,
        id: `${comp.type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`
      };

      if (newComp.children && newComp.children.length > 0) {
        newComp.children = newComp.children.map(assignNewIds);
      }

      return newComp;
    };

    const duplicated = assignNewIds(clone);

    // 使用setComponents (其实是updateComponents)更新状态
    setComponents(draft => {
      // 递归查找并更新父数组
      const findAndUpdate = (items: BaseComponent[]) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === componentId) {
            // 在当前组件后插入复制的组件
            items.splice(i + 1, 0, duplicated);
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
  }, [components, findComponentById, setComponents]);

  return {
    addChildComponent,
    updateComponentStyle,
    updateComponentAttribute,
    duplicateComponent
  };
} 