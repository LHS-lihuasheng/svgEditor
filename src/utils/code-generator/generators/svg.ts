import type { BaseComponent } from '@/types';
import { generateAttributes } from '../utils/attributes';
import { generateStyleAttributes } from '../utils/styles';
import { generateComponentCode } from '../component-generators';

/**
 * @description 生成SVG图片代码
 * @param {BaseComponent} component - SVG图片组件
 * @returns {string} 生成的SVG代码
 */
export function generateSVGPicCode(component: BaseComponent): string {
  const { style = {}, attributes = {} } = component;
  const children = component.children || [];

  // 处理特殊的viewBox格式 - 将对象转换为字符串
  const processedAttributes = { ...attributes };
  if (processedAttributes.viewBox && typeof processedAttributes.viewBox === 'object') {
    const viewBox = processedAttributes.viewBox;
    processedAttributes.viewBox = `${viewBox.x || 0} ${viewBox.y || 0} ${viewBox.width || 0} ${viewBox.height || 0}`;
  }

  // 生成属性和样式
  const attributesStr = generateAttributes(processedAttributes);
  const styleAttrs = generateStyleAttributes(style);

  // 生成子元素代码
  const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');

  // 生成SVG标签
  return `<svg ${attributesStr} ${styleAttrs}>
  ${childrenCode}
</svg>`;
} 