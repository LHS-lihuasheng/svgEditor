/**
 * @description 组件操作工具函数
 * 提供组件树的通用操作方法
 */
import type { BaseComponent } from '@/types/core';

/**
 * @description 递归查找特定ID的组件
 * @param {BaseComponent[]} components - 要搜索的组件数组
 * @param {string} id - 要查找的组件ID
 * @returns {BaseComponent|undefined} 找到的组件或undefined
 */
export function findComponentById(components: BaseComponent[], id: string): BaseComponent | undefined {
    if (!Array.isArray(components)) return undefined;

    for (const comp of components) {
        if (comp.id === id) return comp;

        if (Array.isArray(comp.children) && comp.children.length > 0) {
            const found = findComponentById(comp.children, id);
            if (found) return found;
        }
    }

    return undefined;
}

/**
 * @description 向组件添加图片背景
 * @param {BaseComponent} component - 要更新的组件
 * @param {string} imagePath - 图片路径
 * @param {Object} dimensions - 图片尺寸
 * @returns {BaseComponent} 更新后的组件副本
 */
export function addImageToComponent(
    component: BaseComponent,
    imagePath: string,
    dimensions: { width: number, height: number }
): BaseComponent {
    // 创建组件的深拷贝
    const updatedComponent = JSON.parse(JSON.stringify(component));

    // 确保style对象存在
    if (!updatedComponent.style) {
        updatedComponent.style = {};
    }

    // 设置背景图片
    updatedComponent.style.backgroundImage = `url('${imagePath}')`;

    // 更新viewBox以匹配图片尺寸
    updatedComponent.viewBox = {
        ...updatedComponent.viewBox,
        width: dimensions.width,
        height: dimensions.height
    };

    return updatedComponent;
} 