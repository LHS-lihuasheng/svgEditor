/**
 * @description 组件操作钩子
 * 提供组件的通用操作方法
 */
import { useCallback } from 'react';
import { useEditor } from './index';
import { getComponentTemplate } from '@/components/templates';
import type { BaseComponent, ComponentType } from '@/types/core';

export function useComponentOperations() {
  const { 
    components,
    findComponentById, 
    updateComponent, 
    addComponent,
    deleteComponent
  } = useEditor();

  /**
   * @description 添加子组件
   */
  const addChildComponent = useCallback((parentId: string, childType: ComponentType) => {
    const [parent] = findComponentById(components, parentId);
    if (!parent) return;

    // 验证是否允许添加子组件
    const template = getComponentTemplate(parent.type);
    const allowedChildren = template?.allowedChildren || [];
    
    if (!allowedChildren.includes(childType)) {
      console.warn(`Cannot add ${childType} to ${parent.type}`);
      return;
    }

    // 创建子组件
    const childTemplate = getComponentTemplate(childType);
    const childId = `${childType}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const childComponent: BaseComponent = {
      id: childId,
      type: childType,
      children: [],
      ...(childTemplate.defaultProperties || {})
    };

    // 更新父组件
    const updatedParent = { 
      ...parent,
      children: [...(parent.children || []), childComponent]
    };

    updateComponent(updatedParent);
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

    const updatedComponent = { ...component };
    
    if (!updatedComponent.style) {
      updatedComponent.style = {};
    }

    updatedComponent.style = {
      ...updatedComponent.style,
      [styleProp]: value
    };

    updateComponent(updatedComponent);
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

    const updatedComponent = { ...component };
    
    if (!updatedComponent.attributes) {
      updatedComponent.attributes = {};
    }

    updatedComponent.attributes = {
      ...updatedComponent.attributes,
      [attrKey]: value
    };

    updateComponent(updatedComponent);
  }, [components, findComponentById, updateComponent]);

  /**
   * @description 复制组件
   */
  const duplicateComponent = useCallback((componentId: string) => {
    const [component] = findComponentById(components, componentId);
    if (!component) return;
    
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
    
    // 找出父数组并添加复制的组件
    const [, parentArray] = findComponentById(components, componentId);
    
    if (parentArray) {
      const index = parentArray.findIndex(c => c.id === componentId);
      if (index !== -1) {
        const updatedArray = [...parentArray];
        updatedArray.splice(index + 1, 0, duplicated);
        
        // 更新父组件
        const parentId = parentArray.find(c => c.id === componentId)?.id;
        if (parentId) {
          // 需要再实现这部分逻辑
        }
      }
    }
  }, [components, findComponentById]);

  return {
    addChildComponent,
    updateComponentStyle,
    updateComponentAttribute,
    duplicateComponent
  };
} 