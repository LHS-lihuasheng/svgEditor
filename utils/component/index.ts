/**
 * @description 组件操作工具函数
 * 提供通用的组件操作逻辑
 */
import type { BaseComponent, ComponentType } from '@/types/core';

/**
 * @description 深拷贝组件对象
 * @param {BaseComponent} component - 要拷贝的组件
 * @returns {BaseComponent} 拷贝后的组件
 */
export function cloneComponent(component: BaseComponent): BaseComponent {
    return JSON.parse(JSON.stringify(component));
}

/**
 * @description 递归查找组件
 * @param {BaseComponent[]} components - 组件数组
 * @param {string} id - 要查找的组件ID
 * @returns {BaseComponent|undefined} 找到的组件或undefined
 */
export function findComponent(components: BaseComponent[], id: string): BaseComponent | undefined {
    for (const comp of components) {
        if (comp.id === id) return comp;
        if (comp.children) {
            const found = findComponent(comp.children, id);
            if (found) return found;
        }
    }
    return undefined;
}

/**
 * @description 生成唯一的组件ID
 * @param {ComponentType} type - 组件类型
 * @returns {string} 唯一ID
 */
export function generateComponentId(type: ComponentType): string {
    return `${type}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

/**
 * @description 检查组件是否是目标ID组件的后代
 * @param {BaseComponent} component - 要检查的组件
 * @param {string} targetId - 目标组件ID
 * @returns {boolean} 如果是后代，返回true
 */
export function isDescendantOf(component: BaseComponent, targetId: string): boolean {
    if (!component.children) return false;

    return component.children.some(child =>
        child.id === targetId || isDescendantOf(child, targetId)
    );
} 