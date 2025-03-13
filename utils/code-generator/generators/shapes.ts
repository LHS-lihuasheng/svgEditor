import type { BaseComponent } from '@/types/core';
import { generateAttributes } from '../utils/attributes';
import { generateStyleAttributes } from '../utils/styles';
import { generateComponentCode } from '../component-generators';

/**
 * @description 生成矩形代码
 * @param {BaseComponent} component - 矩形组件
 * @returns {string} 生成的rect代码
 */
export function generateRectCode(component: BaseComponent): string {
  const { style = {}, attributes = {} } = component;

  // 生成样式属性
  const styleAttrs = generateStyleAttributes(style);

  // 无论是否有子元素，都使用双标签格式
  const childrenCode = component.children && component.children.length > 0
    ? component.children.map(child => generateComponentCode(child)).join('\n  ')
    : '';

  return `<rect ${generateAttributes(attributes)} ${styleAttrs}>
  ${childrenCode}
</rect>`;
} 