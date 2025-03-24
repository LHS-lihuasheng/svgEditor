import type { BaseComponent } from '@/types';
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

  // 处理 transform 属性
  const processedAttributes = { ...attributes };

  // 确保transform对象存在，即使属性是通过子属性单独设置的
  if (!processedAttributes.transform) {
    processedAttributes.transform = {};
  }

  // 如果 transform 是对象，转换为 SVG transform 字符串
  if (processedAttributes.transform && typeof processedAttributes.transform === 'object') {
    const transform = processedAttributes.transform;
    let transformStr = '';

    // 处理平移
    if (transform.translate) {
      transformStr += `translate(${transform.translate.x || 0},${transform.translate.y || 0}) `;
    }

    // 处理缩放
    if (transform.scale) {
      transformStr += `scale(${transform.scale}) `;
    }

    // 处理旋转 - 添加deg单位
    if (transform.rotate) {
      transformStr += `rotate(${transform.rotate}deg) `;
    }

    processedAttributes.transform = transformStr.trim();
  }

  // 生成属性和样式
  const attributesStr = generateAttributes(processedAttributes);
  const styleAttrs = generateStyleAttributes(style);

  // 生成子元素代码
  const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');

  // 生成g标签
  return `<g ${attributesStr} ${styleAttrs}>
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

/**
 * @description 生成Section代码
 * @param {BaseComponent} component - section组件
 * @returns {string} 生成的section代码
 */
export function generateSectionCode(component: BaseComponent): string {
  const { style = {}, attributes = {} } = component;
  const children = component.children || [];

  // 处理特殊样式属性，如margin和padding对象
  const processedStyle = { ...style };

  // 生成属性和样式
  const attributesStr = generateAttributes(attributes);
  const styleAttrs = generateStyleAttributes(processedStyle);

  // 生成子元素代码
  const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');

  // 生成section标签
  return `<section ${attributesStr} ${styleAttrs}>
  ${childrenCode}
</section>`;
} 