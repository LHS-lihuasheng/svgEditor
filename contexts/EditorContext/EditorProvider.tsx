/**
 * @description 编辑器上下文提供者
 * 管理SVG编辑器的核心状态和操作，负责：
 * 1. 组件树的管理（添加、删除、更新、选择组件）
 * 2. 拖拽功能的支持
 * 3. 代码预览的切换
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { Draft } from 'immer';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';
import { useComponentTree } from './useComponentTree';
import { useComponentDragDrop } from './useComponentDragDrop';
import type {
  BaseComponent,
  ComponentType,
  DragItem,
} from '@/types/core';

/**
 * 编辑器上下文类型定义
 * 包含编辑器的所有状态和操作方法
 */
interface EditorContextType {
  // 核心状态
  components: BaseComponent[];          // 当前编辑器中的所有组件
  selectedComponent: BaseComponent | null;  // 当前选中的组件

  // 状态操作方法
  updateComponents: (draft: Draft<BaseComponent[]>) => void;  // 设置组件列表
  setSelectedComponent: (component: BaseComponent | null) => void;      // 设置选中组件
  updateComponent: (updated: BaseComponent) => void;                   // 更新特定组件
  addComponent: (type: ComponentType) => void;                        // 添加新组件
  deleteComponent: (id: string) => void;                             // 删除特定组件
  moveComponent: (dragIndex: number, hoverIndex: number, parentId: string | null) => void;  // 移动组件位置
  handleDrop: (item: DragItem, targetId: string | null) => void;     // 处理拖放完成事件

  // 工具方法
  findComponentById: (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null];  // 通过ID查找组件
  generateUniqueId: (type: ComponentType) => string;                 // 生成唯一组件ID
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {

  const [components, updateComponents] = useImmer<BaseComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);

  // 引入组件树操作钩子，提供组件树的基本操作功能
  const {
    findComponentById,     // 通过ID查找组件
    updateComponent,       // 更新组件属性
    deleteComponent,       // 删除组件
    generateUniqueId,      // 生成唯一ID
  } = useComponentTree(updateComponents);

  // 引入拖放操作钩子，提供拖拽相关功能
  const {
    handleDrop,           // 处理拖放完成事件
    moveComponent,        // 移动组件在列表中的位置
  } = useComponentDragDrop(
    updateComponents,
    generateUniqueId,
  );

  /**
   * 当组件列表更新时，同步更新选中组件的最新状态
   * 确保UI显示的是组件的最新状态
   */
  useEffect(() => {
    if (selectedComponent) {
      const [updated] = findComponentById(components, selectedComponent.id);
      if (updated) {
        setSelectedComponent(updated);
      }
    }
  }, [components, selectedComponent?.id, findComponentById]);

  /**
   * @description 添加新组件到编辑器
   * @param {ComponentType} type - 要添加的组件类型
   * 会根据组件类型获取默认模板，并生成一个带有唯一ID的新组件
   */
  const addComponent = useCallback((type: ComponentType) => {
    updateComponents(draft => {
      const template = COMPONENT_TEMPLATES[type as keyof typeof COMPONENT_TEMPLATES];
      const newComponent: BaseComponent = {
        id: generateUniqueId(type),
        type,
        children: [],
        ...(template.defaultProperties || {})
      } as BaseComponent;

      draft.push(newComponent);
    });
  }, [updateComponents, generateUniqueId]);

  // 构建上下文值，使用useMemo优化性能，避免不必要的重渲染
  const contextValue = useMemo<EditorContextType>(() => ({
    components,
    selectedComponent,

    updateComponents,
    setSelectedComponent,
    updateComponent,
    addComponent,
    deleteComponent,
    moveComponent,
    handleDrop,

    findComponentById,
    generateUniqueId
  }), [
    components,
    selectedComponent,
    updateComponent,
    addComponent,
    deleteComponent,
    moveComponent,
    handleDrop,
    findComponentById,
    generateUniqueId
  ]);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
}

/**
 * @description 使用编辑器上下文的自定义Hook
 * @returns {EditorContextType} 编辑器上下文内容
 * @throws {Error} 如果在EditorProvider外部使用则抛出错误
 */
export function useEditor(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor必须在EditorProvider内部使用');
  }
  return context;
} 