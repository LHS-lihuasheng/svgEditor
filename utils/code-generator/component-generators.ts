import type { BaseComponent, BasicTag } from '@/types/component';
import { generateSVGPicCode } from './generators/svg';
import { generateRectCode } from './generators/shapes';
import {
  generateGroupCode,
  generateForeignObjectCode,
  generateSectionCode
} from './generators/containers';
import {
  generateSetCode,
  generateAnimateCode,
  generateAnimateTransformCode,
  generateAnimateMotionCode
} from './generators/animation';

/**
 * @description 组件类型到代码生成函数的映射
 */
export const COMPONENT_GENERATORS: {
  [key in BasicTag]: (component: BaseComponent) => string;
} = {
  'svg': generateSVGPicCode,
  'g': generateGroupCode,
  'rect': generateRectCode,
  'set': generateSetCode,
  'animate': generateAnimateCode,
  'animateTransform': generateAnimateTransformCode,
  'foreignObject': generateForeignObjectCode,
  'section': generateSectionCode
};

/**
 * @description 根据组件类型选择并调用对应的生成器函数
 * @param {BaseComponent} component - 组件
 * @returns {string} 生成的组件代码
 */
export function generateComponentCode(component: BaseComponent): string {
  const generator = COMPONENT_GENERATORS[component.type];

  if (generator) {
    const childrenCode = component.children
      ?.map(child => generateComponentCode(child))
      ?.join('\n') || '';

    return generator({
      ...component,
      children: childrenCode
    });
  }

  console.warn(`Unsupported component tag: ${component.tag}`);
  return '';
}

/**
 * @description 生成通用组件标签代码
 * @param tagName 标签名称
 * @param attributes 属性字符串
 * @param styleAttrs 样式属性字符串
 * @param children 子内容字符串
 * @param selfClosing 是否自闭合（默认false）
 */
export function generateTagCode(
  tagName: string,
  attributes: string,
  styleAttrs: string,
  children: string,
  selfClosing: boolean = false
): string {
  // 如果是set标签或明确要求自闭合，并且没有子内容，使用自闭合格式
  if ((tagName === 'set' || selfClosing) && !children) {
    return `<${tagName} ${attributes} ${styleAttrs} />`;
  }

  // 否则使用双标签格式
  return `<${tagName} ${attributes} ${styleAttrs}>
  ${children}
</${tagName}>`;
} 