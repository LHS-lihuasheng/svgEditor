/**
 * @description 编辑器上下文
 * 简化的编辑器上下文提供者，整合所有功能
 */
import React, { createContext, useContext } from 'react';
import { useEditor } from './useEditor';
import type { BaseComponent, ComponentType, DragItem } from '@/types/core';

// 编辑器上下文类型
interface EditorContextType {
    // 状态
    components: BaseComponent[];
    selectedComponent: BaseComponent | null;

    // 基础操作
    updateComponents: (updater: (draft: BaseComponent[]) => void) => void;
    findComponentById: (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null];
    generateUniqueId: (type: ComponentType) => string;

    // 组件树操作
    addComponent: (type: ComponentType) => void;
    updateComponent: (updated: BaseComponent) => void;
    deleteComponent: (id: string) => void;

    // 组件属性操作
    updateComponentStyle: (componentId: string, styleProp: string, value: any) => void;
    updateComponentAttribute: (componentId: string, attrKey: string, value: any) => void;
    duplicateComponent: (componentId: string) => void;

    // 拖放操作
    handleDrop: (item: DragItem, targetId: string | null) => void;
    editorDrop: any;

    // 选择操作
    selectComponent: (id: string) => void;
    clearSelection: () => void;
    selectNextComponent: () => void;
    selectPrevComponent: () => void;
}

const EditorContext = createContext<EditorContextType | null>(null);

export function EditorProvider({ children }: { children: React.ReactNode }) {
    const editor = useEditor();

    return (
        <EditorContext.Provider value={editor}>
            {children}
        </EditorContext.Provider>
    );
}

/**
 * @description 使用编辑器上下文
 */
export function useEditorContext() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditorContext必须在EditorProvider内部使用');
    }
    return context;
} 