/**
 * @description 组件树工具函数
 */
import { getComponentTemplate } from '@/components/SVGEditor/atomicComponent';
import type { BaseComponent, ComponentType } from '@/types/core';

/**
 * @description 显示添加子组件的菜单
 * @param {string} componentId - 父组件的ID
 * @param {BaseComponent[]} components - 组件数组
 * @param {Function} findComponentById - 查找组件的函数
 * @param {Function} addComponent - 添加组件的函数
 */
export function showAddChildMenu(
    componentId: string,
    components: BaseComponent[],
    findComponentById: (components: BaseComponent[], id: string) => [BaseComponent | null, BaseComponent[] | null],
    addComponent: (type: ComponentType, parentId?: string) => void
) {
    // 获取组件
    const [targetComponent] = findComponentById(components, componentId);
    if (!targetComponent) return;

    // 找出模板允许的子组件类型
    const template = getComponentTemplate(targetComponent.type);
    const allowedChildren = template?.allowedChildren || [];

    if (allowedChildren.length === 0) {
        alert('此组件不允许添加子组件');
        return;
    }

    // 添加第一个允许的子组件类型
    const childType = allowedChildren[0] as ComponentType;
    if (childType) {
        addComponent(childType, componentId);
    }
} 