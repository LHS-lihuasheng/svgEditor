/**
 * @description 组件选择钩子
 * 管理组件选择状态和相关操作
 */
import { useCallback } from 'react';
import { useEditor } from './index';
import type { BaseComponent } from '@/types/core';

export function useComponentSelection() {
  const { 
    components, 
    selectedComponent, 
    setSelectedComponent,
    findComponentById
  } = useEditor();

  /**
   * @description 选择组件
   */
  const selectComponent = useCallback((id: string) => {
    const [component] = findComponentById(components, id);
    if (component) {
      setSelectedComponent(component);
    }
  }, [components, findComponentById, setSelectedComponent]);

  /**
   * @description 选择下一个组件
   */
  const selectNextComponent = useCallback(() => {
    if (!selectedComponent || !components.length) return;
    
    // 展平组件树以获取所有组件
    const flattenComponents = (comps: BaseComponent[]): BaseComponent[] => {
      return comps.reduce<BaseComponent[]>((acc, comp) => {
        acc.push(comp);
        if (comp.children && comp.children.length) {
          acc.push(...flattenComponents(comp.children));
        }
        return acc;
      }, []);
    };

    const allComponents = flattenComponents(components);
    const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);
    
    if (currentIndex !== -1 && currentIndex < allComponents.length - 1) {
      setSelectedComponent(allComponents[currentIndex + 1]);
    }
  }, [components, selectedComponent, setSelectedComponent]);

  /**
   * @description 选择上一个组件
   */
  const selectPrevComponent = useCallback(() => {
    if (!selectedComponent || !components.length) return;
    
    // 展平组件树以获取所有组件
    const flattenComponents = (comps: BaseComponent[]): BaseComponent[] => {
      return comps.reduce<BaseComponent[]>((acc, comp) => {
        acc.push(comp);
        if (comp.children && comp.children.length) {
          acc.push(...flattenComponents(comp.children));
        }
        return acc;
      }, []);
    };

    const allComponents = flattenComponents(components);
    const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);
    
    if (currentIndex > 0) {
      setSelectedComponent(allComponents[currentIndex - 1]);
    }
  }, [components, selectedComponent, setSelectedComponent]);

  /**
   * @description 清除选择
   */
  const clearSelection = useCallback(() => {
    setSelectedComponent(null);
  }, [setSelectedComponent]);

  return {
    selectComponent,
    selectNextComponent,
    selectPrevComponent,
    clearSelection
  };
} 