import type { BaseComponent } from '@/types/core';
import { generateAttributes } from '../utils/attributes';
import { generateStyleAttributes } from '../utils/styles';
import { generateComponentCode } from '../component-generators';

/**
 * @description 生成SVG图片代码
 * @param {BaseComponent} component - SVG图片组件
 * @returns {string} 生成的SVG代码
 */
export function generateSVGPicCode(component: BaseComponent): string {
  const { style = {}, viewBox = {}, attributes = {} } = component;
  const children = component.children || [];

  // 格式化viewBox
  const viewBoxStr = viewBox ?
    `${viewBox.x || 0} ${viewBox.y || 0} ${viewBox.width || 0} ${viewBox.height || 0}` :
    "0 0 0 0";

  // 生成样式属性
  const styleAttrs = generateStyleAttributes(style);

  // 生成子元素代码
  const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');

  // 生成SVG标签
  return `<svg viewBox="${viewBoxStr}" ${generateAttributes(attributes)} ${styleAttrs}>
  ${childrenCode}
</svg>`;
} 