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

  // 如果有子元素，则生成复合组件，否则生成单标签
  if (component.children && component.children.length > 0) {
    const childrenCode = component.children.map(child => generateComponentCode(child)).join('\n  ');
    return `<rect ${generateAttributes(attributes)} ${styleAttrs}>
  ${childrenCode}
</rect>`;
  } else {
    return `<rect ${generateAttributes(attributes)} ${styleAttrs} />`;
  }
} 