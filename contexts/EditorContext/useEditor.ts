/**
 * @description 编辑器核心钩子
 * 整合编辑器的所有操作和状态管理
 */
import { useImmer } from 'use-immer';
import { useDrop } from 'react-dnd';
import { useCallback, useState, useEffect } from 'react';
import { generateComponentId } from '@/utils/component';
import * as TreeOps from '@/utils/componentTreeOperations';
import type { BaseComponent, ComponentType, DragItem } from '@/types/core';

/**
 * @description 编辑器核心钩子，提供所有编辑器功能
 * @returns 编辑器状态和操作方法
 */
export function useEditor() {
    // 核心状态管理
    const [components, updateComponents] = useImmer<BaseComponent[]>([]);
    const [selectedComponent, setSelectedComponent] = useState<BaseComponent | null>(null);

    // ========== 选择相关操作 ==========

    /**
     * @description 选择组件
     */
    const selectComponent = useCallback((id: string) => {
        const [component] = TreeOps.findComponentById(components, id);
        if (component) {
            setSelectedComponent(component);
        }
    }, [components]);

    /**
     * @description 清除选择
     */
    const clearSelection = useCallback(() => {
        setSelectedComponent(null);
    }, []);

    /**
     * @description 选择下一个组件
     */
    const selectNextComponent = useCallback(() => {
        if (!selectedComponent || !components.length) return;

        const allComponents = TreeOps.flattenComponentTree(components);
        const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);

        if (currentIndex !== -1 && currentIndex < allComponents.length - 1) {
            setSelectedComponent(allComponents[currentIndex + 1]);
        }
    }, [components, selectedComponent]);

    /**
     * @description 选择上一个组件
     */
    const selectPrevComponent = useCallback(() => {
        if (!selectedComponent || !components.length) return;

        const allComponents = TreeOps.flattenComponentTree(components);
        const currentIndex = allComponents.findIndex(c => c.id === selectedComponent.id);

        if (currentIndex > 0) {
            setSelectedComponent(allComponents[currentIndex - 1]);
        }
    }, [components, selectedComponent]);

    // 当组件树更新时，更新选中组件
    useEffect(() => {
        if (selectedComponent) {
            const [updated] = TreeOps.findComponentById(components, selectedComponent.id);
            if (updated) {
                setSelectedComponent(updated);
            } else {
                setSelectedComponent(null);
            }
        }
    }, [components, selectedComponent?.id]);

    // ========== 组件树基础操作 ==========

    /**
     * @description 通过ID查找组件
     */
    const findComponentById = useCallback(
        (components: BaseComponent[], id: string) => {
            return TreeOps.findComponentById(components, id);
        },
        []
    );

    /**
     * @description 更新组件
     */
    const updateComponent = useCallback((updated: BaseComponent) => {
        updateComponents(draft => {
            TreeOps.updateComponent(draft, updated);
        });
    }, [updateComponents]);

    /**
     * @description 添加组件
     */
    const addComponent = useCallback((type: ComponentType) => {
        updateComponents(draft => {
            if (!selectedComponent) {
                TreeOps.addComponentToRoot(draft, type);
            } else {
                TreeOps.addChildComponent(draft, selectedComponent.id, type);
            }
        });
    }, [updateComponents, selectedComponent]);

    /**
     * @description 删除组件
     */
    const deleteComponent = useCallback((id: string) => {
        // 如果要删除的是当前选中的组件，找到相邻组件以便之后选中
        if (selectedComponent?.id === id) {
            const allComponents = TreeOps.flattenComponentTree(components);
            const currentIndex = allComponents.findIndex(c => c.id === id);

            let targetComponent: BaseComponent | null = null;

            if (currentIndex > 0) {
                targetComponent = allComponents[currentIndex - 1];
            } else if (currentIndex === 0 && allComponents.length > 1) {
                targetComponent = allComponents[1];
            }

            updateComponents(draft => {
                const { component, parentArray, index } = TreeOps.findComponentLocation(draft, id);
                if (component && index !== -1) {
                    parentArray.splice(index, 1);
                }
            });

            if (targetComponent) {
                setTimeout(() => {
                    selectComponent(targetComponent.id);
                }, 0);
            } else {
                clearSelection();
            }
        } else {
            // 删除的不是当前选中组件，直接删除即可
            updateComponents(draft => {
                const { component, parentArray, index } = TreeOps.findComponentLocation(draft, id);
                if (component && index !== -1) {
                    parentArray.splice(index, 1);
                }
            });
        }
    }, [components, selectedComponent, updateComponents, selectComponent, clearSelection]);

    /**
     * @description 生成唯一ID
     */
    const generateUniqueId = useCallback((type: ComponentType) => {
        return generateComponentId(type);
    }, []);

    // ========== 组件样式和属性操作 ==========

    /**
     * @description 更新组件样式
     */
    const updateComponentStyle = useCallback((
        componentId: string,
        styleProp: string,
        value: any
    ) => {
        updateComponents(draft => {
            TreeOps.updateComponentStyle(draft, componentId, styleProp, value);
        });
    }, [updateComponents]);

    /**
     * @description 更新组件属性
     */
    const updateComponentAttribute = useCallback((
        componentId: string,
        attrKey: string,
        value: any
    ) => {
        updateComponents(draft => {
            TreeOps.updateComponentAttribute(draft, componentId, attrKey, value);
        });
    }, [updateComponents]);

    /**
     * @description 复制组件
     */
    const duplicateComponent = useCallback((componentId: string) => {
        updateComponents(draft => {
            TreeOps.duplicateComponent(draft, componentId);
        });
    }, [updateComponents]);

    // ========== 组件拖放操作 ==========

    /**
     * @description 处理组件拖放
     */
    const handleDrop = useCallback((draggedItem: DragItem, targetId: string | null) => {
        if (!draggedItem.type) return;

        // 拖回原位时不执行任何操作
        if (!draggedItem.isToolItem && draggedItem.id === targetId) return;

        updateComponents(draft => {
            if (draggedItem.isToolItem) {
                const newComponent = TreeOps.createComponent(draggedItem.type);

                if (!targetId) {
                    draft.push(newComponent);
                } else {
                    const { component: targetComponent, parentArray, index } = TreeOps.findComponentLocation(draft, targetId);

                    if (!targetComponent) {
                        draft.push(newComponent);
                    } else {
                        const position = draggedItem.dropPosition || 'after';

                        if (position === 'nested') {
                            if (!targetComponent.children) targetComponent.children = [];
                            targetComponent.children.push(newComponent);
                        } else if (position === 'before') {
                            parentArray.splice(index, 0, newComponent);
                        } else {
                            parentArray.splice(index + 1, 0, newComponent);
                        }
                    }
                }
            } else {
                const { component: sourceComponent, parentArray: sourceParent, index: sourceIndex } =
                    TreeOps.findComponentLocation(draft, draggedItem.id);

                if (!sourceComponent) return;

                if (targetId) {
                    const isDescendant = (parent: BaseComponent, childId: string): boolean => {
                        if (!parent.children) return false;
                        return parent.children.some(child =>
                            child.id === childId || isDescendant(child, childId)
                        );
                    };

                    if (isDescendant(sourceComponent, targetId)) return;
                }

                const componentToMove = JSON.parse(JSON.stringify(sourceComponent));

                sourceParent.splice(sourceIndex, 1);

                if (!targetId) {
                    draft.push(componentToMove);
                } else {
                    const { component: targetComponent, parentArray: targetParent, index: targetIndex } =
                        TreeOps.findComponentLocation(draft, targetId);

                    if (!targetComponent) {
                        draft.push(componentToMove);
                    } else {
                        const position = draggedItem.dropPosition || 'after';

                        if (position === 'nested') {
                            if (!targetComponent.children) targetComponent.children = [];
                            targetComponent.children.push(componentToMove);
                        } else if (position === 'before') {
                            targetParent.splice(targetIndex, 0, componentToMove);
                        } else {
                            targetParent.splice(targetIndex + 1, 0, componentToMove);
                        }
                    }
                }
            }
        });
    }, [updateComponents]);

    /**
     * @description 编辑器区域拖放
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
    // 返回所有编辑器操作
    return {
        // 状态
        components,
        selectedComponent,

        // 选择操作
        selectComponent,
        clearSelection,
        selectNextComponent,
        selectPrevComponent,

        // 基础操作
        updateComponents,
        findComponentById,
        generateUniqueId,

        // 组件树操作
        addComponent,
        updateComponent,
        deleteComponent,

        // 组件属性操作
        updateComponentStyle,
        updateComponentAttribute,
        duplicateComponent,

        // 拖放操作
        handleDrop,
        editorDrop,

    };
} 