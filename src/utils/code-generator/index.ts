import type { BaseComponent } from '@/types';
import { generateComponentCode } from './component-generators';

/**
 * @description 主入口：将组件对象转换为HTML代码字符串
 * @param {BaseComponent | BaseComponent[]} components - 组件或组件数组
 * @returns {string} 生成的HTML代码
 */
export function generateCode(components: BaseComponent | BaseComponent[]): string {
    // 统一转换为数组
    const componentsArray = Array.isArray(components) ? components : [components];
    return componentsArray.map(component => generateComponentCode(component)).join('\n\n');
}