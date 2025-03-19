/**
 * @description 编辑器上下文
 * 整合了编辑器的状态管理和操作
 */
import React, { createContext, useContext, useCallback, useState, useEffect } from 'react';
import { useImmer } from 'use-immer';
import { useDrop } from 'react-dnd';
import { generateComponentId } from '@/utils/component';
import type { BaseComponent, ComponentType, DragItem } from '@/types/core';
import { COMPONENT_TEMPLATES } from '@/types/core/atomicComponent';

type EditorContextType = {
    // 状态
    components: BaseComponent[];
    selectedComponent: BaseComponent | null;

    // 选择操作
    selectComponent: (id: string) => void;
    clearSelection: () => void;
    selectNextComponent: () => void;
    selectPrevComponent: () => void;

    // 基础操作
    updateComponents: (updater: (draft: BaseComponent[]) => void) => void;
    findComponentById: (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null, number];

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
}

// 创建上下文
const EditorContext = createContext<EditorContextType | null>(null);

/**
 * 编辑器核心钩子
 */
function useEditorCore() {
    // 核心状态
    const [components, updateComponents] = useImmer<BaseComponent[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);

    // ========== 基础工具函数 ==========

    /**
     * 查找组件及其父数组和索引
     */
    const findComponentById = useCallback(
        (componentTree: BaseComponent[], componentId: string): [BaseComponent | null, BaseComponent[] | null, number] => {
            for (let i = 0; i < componentTree.length; i++) {
                if (componentTree[i].id === componentId) {
                    return [componentTree[i], componentTree, i];
                }

                if (componentTree[i].children?.length > 0) {
                    const result = findComponentById(componentTree[i].children, componentId);
                    if (result[0]) return result;
                }
            }
            return [null, null, -1];
        },
        []
    );

    /**
     * 展平组件树
     */
    const flattenComponentTree = useCallback((tree: BaseComponent[]): BaseComponent[] => {
        if (!Array.isArray(tree)) return [];

        return tree.reduce<BaseComponent[]>((acc, comp) => {
            acc.push(comp);
            if (Array.isArray(comp.children) && comp.children.length > 0) {
                acc.push(...flattenComponentTree(comp.children));
            }
            return acc;
        }, []);
    }, []);

    /**
     * 创建新组件
     */
    const createComponent = useCallback((type: ComponentType): BaseComponent => {
        const template = COMPONENT_TEMPLATES[type as keyof typeof COMPONENT_TEMPLATES];
        return {
            id: generateComponentId(type),
            type,
            children: [],
            ...(template?.defaultProperties || {})
        } as BaseComponent;
    }, []);

    // ========== 选择操作 ==========

    /**
     * 选择组件
     */
    const selectComponent = useCallback((id: string) => {
        const [component] = findComponentById(components, id);
        if (component) setSelectedComponent(component);
    }, [components, findComponentById]);

    /**
     * 清除选择
     */
    const clearSelection = useCallback(() => {
        setSelectedComponent(null);
    }, []);

    /**
     * 选择下一个/上一个组件
     */
    const selectAdjacentComponent = useCallback((direction: 'next' | 'prev') => {
        if (!selectedComponent || !components.length) return;

        const allComponents = flattenComponentTree(components);
        const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);

        if (direction === 'next' && currentIndex !== -1 && currentIndex < allComponents.length - 1) {
            setSelectedComponent(allComponents[currentIndex + 1]);
        } else if (direction === 'prev' && currentIndex > 0) {
            setSelectedComponent(allComponents[currentIndex - 1]);
        }
    }, [components, selectedComponent, flattenComponentTree]);

    const selectNextComponent = useCallback(() => selectAdjacentComponent('next'), [selectAdjacentComponent]);
    const selectPrevComponent = useCallback(() => selectAdjacentComponent('prev'), [selectAdjacentComponent]);

    // 当组件树更新时，更新选中组件
    useEffect(() => {
        if (selectedComponent) {
            const [updated] = findComponentById(components, selectedComponent.id);
            if (updated) {
                setSelectedComponent(updated);
            } else {
                setSelectedComponent(null);
            }
        }
    }, [components, selectedComponent?.id, findComponentById]);

    // ========== 组件操作 ==========

    /**
     * 添加组件
     */
    const addComponent = useCallback((type: ComponentType) => {
        let newComponent: BaseComponent | null = null;

        updateComponents(draft => {
            newComponent = createComponent(type);

            if (selectedComponent) {
                const [target] = findComponentById(draft, selectedComponent.id);
                if (target) {
                    if (!target.children) {
                        target.children = [];
                    }
                    target.children.push(newComponent);
                    return;
                }
            }

            draft.push(newComponent);
        });
    }, [updateComponents, createComponent, findComponentById, selectedComponent]);

    // 内部辅助函数，不暴露给外部使用
    const updateComponentField = useCallback((
        componentId: string,
        fieldUpdater: (component: BaseComponent) => void
    ) => {
        updateComponents(draft => {
            const [component] = findComponentById(draft, componentId);
            if (component) {
                fieldUpdater(component);
            }
        });
    }, [updateComponents, findComponentById]);

    /**
     * 更新整个组件
     */
    const updateComponent = useCallback((updated: BaseComponent) => {
        updateComponentField(updated.id, (component) => {
            Object.assign(component, updated);
        });
    }, [updateComponentField]);

    /**
     * 更新组件样式
     */
    const updateComponentStyle = useCallback((componentId: string, styleProp: string, value: any) => {
        updateComponentField(componentId, (component) => {
            component.style = {
                ...(component.style || {}),
                [styleProp]: value
            };
        });
    }, [updateComponentField]);

    /**
     * 更新组件属性
     */
    const updateComponentAttribute = useCallback((componentId: string, attrKey: string, value: any) => {
        updateComponentField(componentId, (component) => {
            component.attributes = {
                ...(component.attributes || {}),
                [attrKey]: value
            };
        });
    }, [updateComponentField]);

    /**
     * 删除组件
     */
    const deleteComponent = useCallback((id: string) => {
        updateComponents(draft => {
            const [component, parentArray, index] = findComponentById(draft, id);
            if (component && parentArray && index !== -1) {
                parentArray.splice(index, 1);
            }
        });
    }, [updateComponents, findComponentById]);

    /**
     * 复制组件
     */
    const duplicateComponent = useCallback((componentId: string) => {
        updateComponents(draft => {
            const [component, parentArray, index] = findComponentById(draft, componentId);
            if (!component || !parentArray || index === -1) return;

            const clone = JSON.parse(JSON.stringify(component));

            const assignNewIds = (comp: BaseComponent): BaseComponent => {
                const newId = generateComponentId(comp.type as ComponentType);
                const newComp = { ...comp, id: newId };

                if (newComp.children && newComp.children.length > 0) {
                    newComp.children = newComp.children.map(assignNewIds);
                }

                return newComp;
            };

            parentArray.splice(index + 1, 0, assignNewIds(clone));
        });
    }, [updateComponents, findComponentById]);

    /**
     * 处理组件拖放
     */
    const handleDrop = useCallback((draggedItem: DragItem, targetId: string | null) => {
        updateComponents(draft => {
            if (draggedItem.isToolItem) {
                const newComponent = createComponent(draggedItem.type);

                if (!targetId) {
                    draft.push(newComponent);
                    return;
                }

                const [target, parentArray, index] = findComponentById(draft, targetId);
                if (!target || !parentArray) {
                    draft.push(newComponent);
                    return;
                }

                const position = draggedItem.dropPosition || 'after';
                if (position === 'nested') {
                    if (!target.children) target.children = [];
                    target.children.push(newComponent);
                } else if (position === 'before') {
                    parentArray.splice(index, 0, newComponent);
                } else {
                    parentArray.splice(index + 1, 0, newComponent);
                }
            } else {
                const [source, sourceParent, sourceIndex] = findComponentById(draft, draggedItem.id);
                if (!source || !sourceParent || sourceIndex === -1) return;

                // 避免拖到自身的子组件中
                if (targetId) {
                    const isDescendant = (parent: BaseComponent, childId: string): boolean => {
                        if (!parent.children) return false;
                        return parent.children.some(child =>
                            child.id === childId || isDescendant(child, childId)
                        );
                    };

                    if (isDescendant(source, targetId)) return;
                }

                const componentToMove = JSON.parse(JSON.stringify(source));
                sourceParent.splice(sourceIndex, 1);

                if (!targetId) {
                    draft.push(componentToMove);
                    return;
                }

                const [target, targetParent, targetIndex] = findComponentById(draft, targetId);
                if (!target || !targetParent) {
                    draft.push(componentToMove);
                    return;
                }

                const position = draggedItem.dropPosition || 'after';
                if (position === 'nested') {
                    if (!target.children) target.children = [];
                    target.children.push(componentToMove);
                } else if (position === 'before') {
                    targetParent.splice(targetIndex, 0, componentToMove);
                } else {
                    targetParent.splice(targetIndex + 1, 0, componentToMove);
                }
            }
        });
    }, [updateComponents, createComponent, findComponentById]);

    /**
     * 编辑器区域拖放
     */
    const editorDrop = useDrop<DragItem, void, any>(() => ({
        accept: ['TOOL', 'COMPONENT'],
        drop: (item: DragItem, monitor) => {
            if (monitor.didDrop()) return;

            const editorElement = document.getElementById('editor-area');
            if (!editorElement) return;

            const editorRect = editorElement.getBoundingClientRect();
            const offset = monitor.getClientOffset();
            if (!offset) return;

            const x = offset.x - editorRect.left;
            const y = offset.y - editorRect.top;

            const updatedItem = { ...item, x, y };
            const targetElement = document.elementFromPoint(offset.x, offset.y);
            const targetComponentId = targetElement?.closest('[data-component-id]')?.getAttribute('data-component-id') || null;

            handleDrop(updatedItem, targetComponentId);
        }
    }))[1];

    return {
        components,
        selectedComponent,

        selectComponent,
        clearSelection,
        selectNextComponent,
        selectPrevComponent,

        updateComponents,
        findComponentById,

        addComponent,
        updateComponent,
        deleteComponent,

        updateComponentStyle,
        updateComponentAttribute,
        duplicateComponent,

        handleDrop,
        editorDrop,
    };
}

/**
 * 编辑器上下文提供者
 */
export function EditorProvider({ children }: { children: React.ReactNode }) {
    const editorFeatures = useEditorCore();

    return (
        <EditorContext.Provider value={editorFeatures}>
            {children}
        </EditorContext.Provider>
    );
}

/**
 * 使用编辑器上下文的钩子
 */
export function useEditor() {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error('useEditor 必须在 EditorProvider 内部使用');
    }
    return context;
} 