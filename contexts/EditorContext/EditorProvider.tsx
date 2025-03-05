/**
 * @description 编辑器上下文提供者
 * 管理SVG编辑器的核心状态和操作
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { COMPONENT_TEMPLATES } from '@/components/templates';
import { useComponentTree } from './useComponentTree';
import { useComponentDragDrop } from './useComponentDragDrop';
import type { 
  BaseComponent, 
  ComponentType, 
  DragItem 
} from '@/types/core';

// 编辑器上下文类型
interface EditorContextType {
  // 状态
  components: BaseComponent[];
  selectedComponent: BaseComponent | null;
  showCodePreview: boolean;

  // 操作
  setComponents: React.Dispatch<React.SetStateAction<BaseComponent[]>>;
  setSelectedComponent: (component: BaseComponent | null) => void;
  updateComponent: (updated: BaseComponent) => void;
  addComponent: (type: ComponentType) => void;
  deleteComponent: (id: string) => void;
  moveComponent: (dragIndex: number, hoverIndex: number, parentId: string | null) => void;
  setShowCodePreview: (show: boolean) => void;
  handleDrop: (item: DragItem, targetId: string | null) => void;

  // 辅助方法
  findComponentById: (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null];
  generateUniqueId: (type: ComponentType) => string;
}

// 创建上下文
const EditorContext = createContext<EditorContextType | null>(null);

/**
 * @description 编辑器上下文提供者组件
 */
export function EditorProvider({ children }: { children: React.ReactNode }) {
  // 基础状态
  const [components, setComponents] = useState<BaseComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);
  const [showCodePreview, setShowCodePreview] = useState(false);

  // 引入组件树操作钩子
  const { 
    findComponentById, 
    updateComponent, 
    deleteComponent, 
    generateUniqueId,
    removeComponentById
  } = useComponentTree(setComponents);

  // 引入拖放操作钩子
  const {
    handleDrop,
    moveComponent,
    updateComponentTree
  } = useComponentDragDrop(
    setComponents, 
    findComponentById, 
    generateUniqueId,
    removeComponentById
  );

  // 当组件列表更新时，更新选中组件
  useEffect(() => {
    if (selectedComponent) {
      const [updated] = findComponentById(components, selectedComponent.id);
      if (updated) {
        setSelectedComponent(updated);
      }
    }
  }, [components, selectedComponent?.id, findComponentById]);

  /**
   * @description 添加新组件
   */
  const addComponent = useCallback((type: ComponentType) => {
    setComponents(prev => {
      const template = COMPONENT_TEMPLATES[type as keyof typeof COMPONENT_TEMPLATES];
      
      const newComponent: BaseComponent = {
        id: generateUniqueId(type),
        type,
        children: [],
        ...(template.defaultProperties || {})
      } as BaseComponent;
      
      return [...prev, newComponent];
    });
  }, [generateUniqueId]);

  // 构建上下文值
  const contextValue = useMemo<EditorContextType>(() => ({
    // 状态
    components,
    selectedComponent,
    showCodePreview,

    // 操作方法
    setComponents,
    setSelectedComponent,
    updateComponent,
    addComponent,
    deleteComponent,
    moveComponent,
    setShowCodePreview,
    handleDrop,

    // 辅助方法
    findComponentById,
    generateUniqueId
  }), [
    components,
    selectedComponent,
    showCodePreview,
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
 * @description 使用编辑器上下文的钩子
 */
export function useEditor(): EditorContextType {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor必须在EditorProvider内部使用');
  }
  return context;
} 