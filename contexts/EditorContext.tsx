import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useImmerReducer } from 'use-immer';
import { useDrop } from 'react-dnd';
import { generateComponentId } from '@/utils/component';
import type { BaseComponent, DragItem } from '@/types';
import type { TEMPLATE } from '@/types/templateStorage';
import { COMPONENT_TEMPLATES } from '@/types/templateStorage';

// 定义状态类型
interface EditorState {
    components: BaseComponent[];
    selectedComponentId: string | null;
}

// 定义 Action 类型
type EditorAction =
    | { type: 'SELECT_COMPONENT'; payload: { id: string } }
    | { type: 'RESET_COMPONENTS' }
    | { type: 'CLEAR_SELECTION' }
    | { type: 'SELECT_ADJACENT_COMPONENT'; payload: { direction: 'next' | 'prev' } }
    | { type: 'ADD_COMPONENT'; payload: { TEMPLATE: TEMPLATE } }
    | { type: 'UPDATE_COMPONENT'; payload: { component: BaseComponent } }
    | { type: 'DELETE_COMPONENT'; payload: { id: string } }
    | { type: 'UPDATE_COMPONENT_STYLE'; payload: { id: string; property: string; value: any } }
    | { type: 'UPDATE_COMPONENT_ATTRIBUTE'; payload: { id: string; property: string; value: any } }
    | { type: 'DUPLICATE_COMPONENT'; payload: { id: string } }
    | { type: 'HANDLE_DROP'; payload: { item: DragItem; targetId: string | null } };

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
    findComponentById: (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null, number];

    // 组件树操作
    addComponent: (type: TEMPLATE) => void;
    updateComponent: (updated: BaseComponent) => void;
    deleteComponent: (id: string) => void;
    resetComponents: () => void;
    // 组件属性操作
    updateComponentStyle: (componentId: string, styleProp: string, value: any) => void;
    updateComponentAttribute: (componentId: string, attrKey: string, value: any) => void;
    duplicateComponent: (componentId: string) => void;

    // 拖放操作
    handleDrop: (item: DragItem, targetId: string | null) => void;
    editorDrop: any;
}

const EditorContext = createContext<EditorContextType | null>(null);

/**
 * reducer 函数处理状态更新
 */
function editorReducer(draft: EditorState, action: EditorAction) {
    const findComponentById = (
        componentTree: BaseComponent[],
        componentId: string
    ): [BaseComponent | null, BaseComponent[] | null, number] => {
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
    };

    const flattenComponentTree = (tree: BaseComponent[]): BaseComponent[] => {
        if (!Array.isArray(tree)) return [];

        return tree.reduce<BaseComponent[]>((acc, comp) => {
            acc.push(comp);
            if (Array.isArray(comp.children) && comp.children.length > 0) {
                acc.push(...flattenComponentTree(comp.children));
            }
            return acc;
        }, []);
    };

    const createComponent = (type: TEMPLATE): BaseComponent => {
        const template = COMPONENT_TEMPLATES[type];
        return {
            id: generateComponentId(type),
            type,
            children: [],
            ...(JSON.parse(JSON.stringify(template.defaultProperties)))
        } as BaseComponent;
    };

    switch (action.type) {
        case 'SELECT_COMPONENT': {
            draft.selectedComponentId = action.payload.id;
            break;
        }

        case 'CLEAR_SELECTION': {
            draft.selectedComponentId = null;
            break;
        }

        case 'RESET_COMPONENTS': {
            draft.components.splice(0, draft.components.length);
            draft.selectedComponentId = null;
            break;
        }

        case 'SELECT_ADJACENT_COMPONENT': {
            if (!draft.selectedComponentId) return;

            const allComponents = flattenComponentTree(draft.components);
            const currentIndex = allComponents.findIndex(c => c.id === draft.selectedComponentId);

            if (action.payload.direction === 'next' && currentIndex !== -1 && currentIndex < allComponents.length - 1) {
                draft.selectedComponentId = allComponents[currentIndex + 1].id;
            } else if (action.payload.direction === 'prev' && currentIndex > 0) {
                draft.selectedComponentId = allComponents[currentIndex - 1].id;
            }
            break;
        }

        case 'ADD_COMPONENT': {
            const newComponent = createComponent(action.payload.TEMPLATE);

            if (draft.selectedComponentId === null) {
                if (!draft.components.length) {
                    draft.components.push(newComponent);
                    draft.selectedComponentId = newComponent.id;
                } else {
                    draft.components.push(newComponent);
                }
            } else {
                const [selectedComponent] = findComponentById(draft.components, draft.selectedComponentId);
                if (selectedComponent) {
                    if (!selectedComponent.children) {
                        selectedComponent.children = [];
                    }
                    selectedComponent.children.push(newComponent);
                }
            }

            break;
        }

        case 'UPDATE_COMPONENT': {
            const [component, parentArray, index] = findComponentById(draft.components, action.payload.component.id);
            if (component && parentArray && index !== -1) {
                parentArray[index] = action.payload.component;
            }
            break;
        }

        case 'DELETE_COMPONENT': {
            const [component, parentArray, index] = findComponentById(draft.components, action.payload.id);
            if (component && parentArray && index !== -1) {
                parentArray.splice(index, 1);
                draft.selectedComponentId = null;
            }
            break;
        }

        case 'UPDATE_COMPONENT_STYLE': {
            const [component] = findComponentById(draft.components, action.payload.id);
            if (component) {
                if (!component.style) component.style = {};
                component.style[action.payload.property] = action.payload.value;
            }
            break;
        }

        case 'UPDATE_COMPONENT_ATTRIBUTE': {
            const [component] = findComponentById(draft.components, action.payload.id);
            if (component) {
                if (!component.attributes) component.attributes = {};
                component.attributes[action.payload.property] = action.payload.value;
            }
            break;
        }

        case 'DUPLICATE_COMPONENT': {
            const [component, parentArray, index] = findComponentById(draft.components, action.payload.id);
            if (component && parentArray && index !== -1) {
                const duplicate = JSON.parse(JSON.stringify(component));
                duplicate.id = generateComponentId(duplicate.type);

                const updateChildrenIds = (children: BaseComponent[]) => {
                    if (!children) return;
                    for (const child of children) {
                        child.id = generateComponentId(child.type);
                        if (child.children?.length) {
                            updateChildrenIds(child.children);
                        }
                    }
                };

                if (duplicate.children?.length) {
                    updateChildrenIds(duplicate.children);
                }

                parentArray.splice(index + 1, 0, duplicate);
                draft.selectedComponentId = duplicate.id;
            }
            break;
        }

        case 'HANDLE_DROP': {
            const { item, targetId } = action.payload;

            if (item.isToolItem) {
                const newComponent = createComponent(item.type);

                if (!targetId) {
                    draft.components.push(newComponent);
                    return;
                }

                const [target, parentArray, index] = findComponentById(draft.components, targetId);
                if (!target || !parentArray) {
                    draft.components.push(newComponent);
                    return;
                }

                const position = item.dropPosition || 'after';
                if (position === 'nested') {
                    if (!target.children) target.children = [];
                    target.children.push(newComponent);
                } else if (position === 'before') {
                    parentArray.splice(index, 0, newComponent);
                } else {
                    parentArray.splice(index + 1, 0, newComponent);
                }
            } else {
                const [source, sourceParent, sourceIndex] = findComponentById(draft.components, item.id);
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
                    draft.components.push(componentToMove);
                    return;
                }

                const [target, targetParent, targetIndex] = findComponentById(draft.components, targetId);
                if (!target || !targetParent) {
                    draft.components.push(componentToMove);
                    return;
                }

                const position = item.dropPosition || 'after';
                if (position === 'nested') {
                    if (!target.children) target.children = [];
                    target.children.push(componentToMove);
                } else if (position === 'before') {
                    targetParent.splice(targetIndex, 0, componentToMove);
                } else {
                    targetParent.splice(targetIndex + 1, 0, componentToMove);
                }
            }
            break;
        }
    }
}

/**
 * 编辑器上下文提供者
 */
export function EditorProvider({ children }: { children: React.ReactNode }) {
    const initialState: EditorState = {
        components: [],
        selectedComponentId: null
    };

    const [state, dispatch] = useImmerReducer(editorReducer, initialState);

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

    const selectedComponent = useMemo(() => {
        if (!state.selectedComponentId) return null;
        const [component] = findComponentById(state.components, state.selectedComponentId);
        return component;
    }, [state.components, state.selectedComponentId]);

    const selectComponent = useCallback((id: string) => {
        dispatch({ type: 'SELECT_COMPONENT', payload: { id } });
    }, [dispatch]);

    const clearSelection = useCallback(() => {
        dispatch({ type: 'CLEAR_SELECTION' });
    }, [dispatch]);

    const resetComponents = useCallback(() => {
        dispatch({ type: 'RESET_COMPONENTS' });
    }, [dispatch]);

    const selectNextComponent = useCallback(() => {
        dispatch({ type: 'SELECT_ADJACENT_COMPONENT', payload: { direction: 'next' } });
    }, [dispatch]);

    const selectPrevComponent = useCallback(() => {
        dispatch({ type: 'SELECT_ADJACENT_COMPONENT', payload: { direction: 'prev' } });
    }, [dispatch]);

    const addComponent = useCallback((type: TEMPLATE) => {
        dispatch({ type: 'ADD_COMPONENT', payload: { TEMPLATE: type } });
    }, [dispatch]);

    const updateComponent = useCallback((updated: BaseComponent) => {
        dispatch({ type: 'UPDATE_COMPONENT', payload: { component: updated } });
    }, [dispatch]);

    const deleteComponent = useCallback((id: string) => {
        dispatch({ type: 'DELETE_COMPONENT', payload: { id } });
    }, [dispatch]);

    const updateComponentStyle = useCallback((componentId: string, styleProp: string, value: any) => {
        dispatch({
            type: 'UPDATE_COMPONENT_STYLE',
            payload: { id: componentId, property: styleProp, value }
        });
    }, [dispatch]);

    const updateComponentAttribute = useCallback((componentId: string, attrKey: string, value: any) => {
        dispatch({
            type: 'UPDATE_COMPONENT_ATTRIBUTE',
            payload: { id: componentId, property: attrKey, value }
        });
    }, [dispatch]);

    const duplicateComponent = useCallback((componentId: string) => {
        dispatch({ type: 'DUPLICATE_COMPONENT', payload: { id: componentId } });
    }, [dispatch]);

    const handleDrop = useCallback((item: DragItem, targetId: string | null) => {
        dispatch({ type: 'HANDLE_DROP', payload: { item, targetId } });
    }, [dispatch]);

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

    const contextValue: EditorContextType = {
        components: state.components,
        selectedComponent,

        selectComponent,
        clearSelection,
        selectNextComponent,
        selectPrevComponent,

        findComponentById,

        addComponent,
        updateComponent,
        deleteComponent,
        resetComponents,

        updateComponentStyle,
        updateComponentAttribute,
        duplicateComponent,

        handleDrop,
        editorDrop,
    };

    return (
        <EditorContext.Provider value={contextValue}>
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