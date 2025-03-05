/**
 * @description 组件树上下文
 * 提供组件树的状态管理和操作
 */
import React, { createContext, useContext, useState } from 'react';
import type { BaseComponent, DragItem } from '@/types/core';

interface ComponentTreeContextType {
  dragItem: DragItem | null;
  setDragItem: (item: DragItem | null) => void;
  dragOverId: string | null;
  setDragOverId: (id: string | null) => void;
  dropPosition: 'before' | 'after' | 'nested' | null;
  setDropPosition: (position: 'before' | 'after' | 'nested' | null) => void;
}

const ComponentTreeContext = createContext<ComponentTreeContextType | null>(null);

export function ComponentTreeProvider({ children }: { children: React.ReactNode }) {
  const [dragItem, setDragItem] = useState<DragItem | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<'before' | 'after' | 'nested' | null>(null);

  return (
    <ComponentTreeContext.Provider
      value={{
        dragItem,
        setDragItem,
        dragOverId,
        setDragOverId,
        dropPosition,
        setDropPosition
      }}
    >
      {children}
    </ComponentTreeContext.Provider>
  );
}

export function useComponentTree() {
  const context = useContext(ComponentTreeContext);
  if (!context) {
    throw new Error('useComponentTree must be used within a ComponentTreeProvider');
  }
  return context;
} 