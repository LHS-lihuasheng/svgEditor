/**
 * @description 组件树操作钩子
 * 提供组件树的基本CRUD操作
 */
import { useCallback } from 'react';
import { generateComponentId } from '@/utils/component';
import type { BaseComponent, ComponentType } from '@/types/core';

type SetComponentsFunction = React.Dispatch<React.SetStateAction<BaseComponent[]>>;

export function useComponentTree(setComponents: SetComponentsFunction) {
    /**
     * @description 通过ID查找组件和其父数组
     */
    const findComponentById = useCallback((
        components: BaseComponent[],
        id: string
    ): [BaseComponent | null, BaseComponent[] | null] => {
        // 在顶层查找
        for (let i = 0; i < components.length; i++) {
            if (components[i].id === id) {
                return [components[i], components];
            }

            // 递归在子组件中查找
            if (components[i].children && components[i].children.length > 0) {
                const [found, parentArray] = findComponentById(components[i].children as BaseComponent[], id);
                if (found) return [found, parentArray];
            }
        }

        return [null, null];
    }, []);

    /**
     * @description 更新组件属性
     */
    const updateComponent = useCallback((updated: BaseComponent) => {
        setComponents(prev => {
            // 创建新的组件树数组
            return prev.map(comp => {
                if (comp.id === updated.id) {
                    // 确保保留原始组件的所有字段
                    return {
                        ...comp,  // 保留原始字段
                        ...updated, // 覆盖更新的字段
                        // 特殊处理style字段，确保合并而不是替换
                        style: { ...comp.style, ...updated.style },
                        // 特殊处理attributes字段，确保合并
                        attributes: { ...comp.attributes, ...updated.attributes },
                        // 确保子组件保留
                        children: updated.children || comp.children
                    };
                }

                // 递归更新子级
                if (comp.children && comp.children.length > 0) {
                    return {
                        ...comp,
                        children: updateComponentInArray(comp.children, updated)
                    };
                }

                return comp;
            });
        });
    }, [setComponents]);

    // 辅助函数 - 递归更新组件数组中的指定组件
    const updateComponentInArray = (components: BaseComponent[], updated: BaseComponent): BaseComponent[] => {
        return components.map(comp => {
            if (comp.id === updated.id) {
                return updated;
            }

            if (comp.children && comp.children.length > 0) {
                return {
                    ...comp,
                    children: updateComponentInArray(comp.children, updated)
                };
            }

            return comp;
        });
    };

    /**
     * @description 删除组件
     */
    const deleteComponent = useCallback((id: string) => {
        setComponents(prev => removeComponentById(prev, id));
    }, [setComponents]);

    /**
     * @description 递归删除组件
     */
    const removeComponentById = useCallback((components: BaseComponent[], id: string): BaseComponent[] => {
        return components.filter(comp => {
            if (comp.id === id) return false;

            if (comp.children && comp.children.length > 0) {
                comp.children = removeComponentById(comp.children, id);
            }

            return true;
        });
    }, []);

    /**
     * @description 生成唯一组件ID
     */
    const generateUniqueId = useCallback((type: ComponentType): string => {
        return generateComponentId(type);
    }, []);

    return {
        findComponentById,
        updateComponent,
        deleteComponent,
        generateUniqueId,
        removeComponentById
    };
} 