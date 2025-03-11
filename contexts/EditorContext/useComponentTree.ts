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
 * 组件状态设置函数类型
 * 用于更新React状态中的组件树
 */
type SetComponentsFunction = React.Dispatch<React.SetStateAction<BaseComponent[]>>;

/**
 * @description 组件树操作钩子函数
 * @param {SetComponentsFunction} setComponents - 用于更新组件状态的函数
 * @returns {Object} 返回一组组件树操作函数
 */
export function useComponentTree(setComponents: SetComponentsFunction) {
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
     * 保留原始组件的结构，只更新指定的属性
     * @param {BaseComponent} updated - 包含更新内容的组件对象
     */
    const updateComponent = useCallback((updated: BaseComponent) => {
        setComponents(prev => {
            // 创建新的组件树数组，确保不直接修改原始状态（符合React不可变性原则）
            return prev.map(comp => {
                // 找到匹配的组件
                if (comp.id === updated.id) {
                    // 确保保留原始组件的所有字段，并应用更新
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

                // 递归更新子级组件
                if (comp.children && comp.children.length > 0) {
                    return {
                        ...comp,
                        children: updateComponentInArray(comp.children, updated)
                    };
                }

                // 不匹配的组件原样返回
                return comp;
            });
        });
    }, [setComponents]);

    /**
     * @description 辅助函数 - 递归更新组件数组中的指定组件
     * 在组件树的任意深度查找并更新指定ID的组件
     * @param {BaseComponent[]} components - 要处理的组件数组
     * @param {BaseComponent} updated - 包含更新内容的组件对象
     * @returns {BaseComponent[]} 返回更新后的组件数组
     */
    const updateComponentInArray = (components: BaseComponent[], updated: BaseComponent): BaseComponent[] => {
        return components.map(comp => {
            // 找到匹配的组件直接替换
            if (comp.id === updated.id) {
                return updated;
            }

            // 递归检查子组件
            if (comp.children && comp.children.length > 0) {
                return {
                    ...comp,
                    children: updateComponentInArray(comp.children, updated)
                };
            }

            // 不匹配的组件原样返回
            return comp;
        });
    };

    /**
     * @description 删除组件
     * 通过组件ID从组件树中移除特定组件
     * @param {string} id - 要删除的组件ID
     */
    const deleteComponent = useCallback((id: string) => {
        setComponents(prev => removeComponentById(prev, id));
    }, [setComponents]);

    /**
     * @description 递归删除组件
     * 在组件树的任意深度查找并删除指定ID的组件
     * @param {BaseComponent[]} components - 要处理的组件数组
     * @param {string} id - 要删除的组件ID
     * @returns {BaseComponent[]} 返回删除后的组件数组
     */
    const removeComponentById = useCallback((components: BaseComponent[], id: string): BaseComponent[] => {
        if (!Array.isArray(components)) return [];

        return components.filter(comp => {
            if (comp.id === id) return false;

            // 递归处理子组件
            if (Array.isArray(comp.children) && comp.children.length > 0) {
                comp.children = removeComponentById(comp.children, id);
            }

            return true;
        });
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