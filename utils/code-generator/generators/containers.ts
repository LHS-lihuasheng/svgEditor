import type { BaseComponent } from '@/types/core';
import { generateAttributes } from '../utils/attributes';
import { generateStyleAttributes } from '../utils/styles';
import { generateComponentCode } from '../component-generators';

/**
 * @description 生成组代码
 * @param {BaseComponent} component - 组组件
 * @returns {string} 生成的g代码
 */
export function generateGroupCode(component: BaseComponent): string {
  const { style = {}, attributes = {} } = component;
  const children = component.children || [];

  // 生成样式属性
  const styleAttrs = generateStyleAttributes(style);

  // 生成子元素代码
  const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');

  // 生成g标签
  return `<g ${generateAttributes(attributes)} ${styleAttrs}>
  ${childrenCode}
</g>`;
}

/**
 * @description 生成ForeignObject代码
 * @param {BaseComponent} component - foreignObject组件
 * @returns {string} 生成的foreignObject代码
 */
export function generateForeignObjectCode(component: BaseComponent): string {
  const { attributes = {} } = component;
  const children = component.children || [];

  // 不处理样式属性
  // 生成子元素代码
  const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');

  // 生成foreignObject标签，只使用属性
  return `<foreignObject ${generateAttributes(attributes)}>
  ${childrenCode}
</foreignObject>`;
} 