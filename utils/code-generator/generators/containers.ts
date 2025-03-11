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