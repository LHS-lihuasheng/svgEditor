/**
 * @description 组件选择钩子
 * 管理组件选择状态和相关操作，包括：
 * 1. 选择指定组件
 * 2. 选择下一个/上一个组件（顺序导航）
 * 3. 清除选择状态
 */
import { useCallback } from 'react';
import { useEditor } from './index';
import type { BaseComponent } from '@/types/core';

/**
 * @description 组件选择钩子函数
 * 提供组件选择的相关功能
 * @returns {Object} 返回组件选择操作函数集合
 */
export function useComponentSelection() {
  // 从编辑器上下文获取必要的状态和方法
  const {
    components,               // 当前组件树
    selectedComponent,        // 当前选中的组件
    setSelectedComponent,     // 设置选中组件的函数
    findComponentById         // 通过ID查找组件的函数
  } = useEditor();

  /**
   * @description 选择指定ID的组件
   * @param {string} id - 要选择的组件ID
   */
  const selectComponent = useCallback((id: string) => {

    const [component] = findComponentById(components, id);
    
    if (component) {
      setSelectedComponent(component);
    }
  }, [components, findComponentById, setSelectedComponent]);

  /**
   * @description 内部辅助函数 - 展平组件树
   */
  const flattenComponents = useCallback((comps: BaseComponent[]): BaseComponent[] => {
    if (!Array.isArray(comps)) return [];

    return comps.reduce<BaseComponent[]>((acc, comp) => {
      acc.push(comp);
      if (Array.isArray(comp.children) && comp.children.length > 0) {
        acc.push(...flattenComponents(comp.children));
      }
      return acc;
    }, []);
  }, []);

  /**
   * @description 选择下一个组件
   * 将当前选中组件切换到平铺组件列表中的下一个组件
   */
  const selectNextComponent = useCallback(() => {
    if (!selectedComponent || !components.length) return;

    const allComponents = flattenComponents(components);
    const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);

    if (currentIndex !== -1 && currentIndex < allComponents.length - 1) {
      setSelectedComponent(allComponents[currentIndex + 1]);
    }
  }, [components, selectedComponent, setSelectedComponent, flattenComponents]);

  /**
   * @description 选择上一个组件
   * 将当前选中组件切换到平铺组件列表中的上一个组件
   */
  const selectPrevComponent = useCallback(() => {
    if (!selectedComponent || !components.length) return;

    const allComponents = flattenComponents(components);
    const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);

    if (currentIndex > 0) {
      setSelectedComponent(allComponents[currentIndex - 1]);
    }
  }, [components, selectedComponent, setSelectedComponent, flattenComponents]);

  /**
   * @description 清除当前选择
   * 将当前选中组件状态设置为null
   */
  const clearSelection = useCallback(() => {
    setSelectedComponent(null);
  }, [setSelectedComponent]);

  // 返回所有组件选择操作函数
  return {
    selectComponent,       // 选择指定组件
    selectNextComponent,   // 选择下一个组件
    selectPrevComponent,   // 选择上一个组件
    clearSelection         // 清除选择
  };
} 