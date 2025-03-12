/**
 * @description 组件树操作钩子
 * 提供组件树的基本CRUD操作，包括：
 * 1. 查找组件（通过ID）
 * 2. 更新组件属性
 * 3. 删除组件
 * 4. 生成唯一组件ID
 */
import { useCallback } from 'react';
import { generateComponentId } from '@/utils/component';
import type { BaseComponent, ComponentType } from '@/types/core';

/**
 * Immer 更新函数类型
 */
type UpdateComponentsFunction = (updater: (draft: BaseComponent[]) => void) => void;

/**
 * @description 组件树操作钩子函数
 * @param {UpdateComponentsFunction} updateComponents - 用于更新组件状态的函数
 * @returns {Object} 返回一组组件树操作函数
 */
export function useComponentTree(updateComponents: UpdateComponentsFunction) {
    /**
     * @description 通过ID查找组件和其父数组
     * @param {BaseComponent[]} components - 要搜索的组件数组
     * @param {string} id - 目标组件ID
     * @returns {[BaseComponent | null, BaseComponent[] | null]} 返回找到的组件和它所在的父数组
     */
    const findComponentById = useCallback((
        components: BaseComponent[],
        id: string
    ): [BaseComponent | null, BaseComponent[] | null] => {
        if (!Array.isArray(components)) return [null, null];

        // 在当前层级查找
        const directMatch = components.find(comp => comp.id === id);
        if (directMatch) return [directMatch, components];

        // 在子层级递归查找
        for (const comp of components) {
            if (Array.isArray(comp.children) && comp.children.length > 0) {
                const [found, parentArray] = findComponentById(comp.children, id);
                if (found) return [found, parentArray];
            }
        }

        return [null, null];
    }, []);

    /**
     * @description 更新组件属性
     * 使用Immer直接修改draft状态
     */
    const updateComponent = useCallback((updated: BaseComponent) => {
        updateComponents(draft => {
            const updateInDraft = (items: BaseComponent[]): boolean => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].id === updated.id) {
                        // 直接更新draft中的组件
                        items[i] = {
                            ...items[i],
                            ...updated,
                            // 确保正确合并嵌套字段
                            style: { ...items[i].style, ...updated.style },
                            attributes: { ...items[i].attributes, ...updated.attributes },
                            children: updated.children || items[i].children
                        };
                        return true;
                    }

                    // 递归到子组件
                    if (items[i].children && items[i].children.length > 0) {
                        if (updateInDraft(items[i].children)) {
                            return true;
                        }
                    }
                }
                return false;
            };

            updateInDraft(draft);
        });
    }, [updateComponents]);

    /**
     * @description 删除组件
     * 使用Immer简化删除逻辑
     */
    const deleteComponent = useCallback((id: string) => {
        updateComponents(draft => {
            removeComponentById(draft, id);
        });
    }, [updateComponents]);

    /**
     * @description 递归删除组件
     * 修改为就地删除组件的实现
     */
    const removeComponentById = useCallback((components: BaseComponent[], id: string): boolean => {
        if (!Array.isArray(components)) return false;

        for (let i = 0; i < components.length; i++) {
            if (components[i].id === id) {
                // 直接从数组中删除组件
                components.splice(i, 1);
                return true;
            }

            // 递归处理子组件
            if (components[i].children && components[i].children.length > 0) {
                if (removeComponentById(components[i].children, id)) {
                    return true;
                }
            }
        }

        return false;
    }, []);

    /**
     * @description 生成唯一组件ID
     * 基于组件类型创建一个唯一标识符
     * @param {ComponentType} type - 组件类型
     * @returns {string} 返回生成的唯一ID
     */
    const generateUniqueId = useCallback((type: ComponentType): string => {
        return generateComponentId(type);
    }, []);

    // 返回所有组件树操作方法
    return {
        findComponentById,    // 查找组件
        updateComponent,      // 更新组件
        deleteComponent,      // 删除组件
        generateUniqueId,     // 生成ID
        removeComponentById   // 删除辅助函数（暴露给其他钩子使用）
    };
} 