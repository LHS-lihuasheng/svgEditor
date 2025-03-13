import type { BaseComponent } from '@/types/core';
import { generateSVGPicCode } from './generators/svg';
import { generateRectCode } from './generators/shapes';
import { generateGroupCode, generateForeignObjectCode } from './generators/containers';
import {
  generateSetCode,
  generateAnimateCode,
  generateAnimateTransformCode,
  generateAnimateMotionCode
} from './generators/animation';

/**
 * @description 组件类型到代码生成模块的映射表
 */
type CodeGeneratorMap = {
  [key: string]: (component: BaseComponent) => string;
};

/**
 * @description 组件类型到代码生成函数的映射
 */
export const COMPONENT_GENERATORS: CodeGeneratorMap = {
  'svgPic': generateSVGPicCode,
  'svgSeamlessPic': generateSVGPicCode,
  'g': generateGroupCode,
  'rect': generateRectCode,
  'set': generateSetCode,
  'animate': generateAnimateCode,
  'animateTransform': generateAnimateTransformCode,
  'animateMotion': generateAnimateMotionCode,
  'foreignObject': generateForeignObjectCode
};

/**
 * @description 根据组件类型选择并调用对应的生成器函数
 * @param {BaseComponent} component - 组件
 * @returns {string} 生成的组件代码
 */
export function generateComponentCode(component: BaseComponent): string {
  const generator = COMPONENT_GENERATORS[component.type];

  if (generator) {
    return generator(component);
  } else {
    console.warn(`Unsupported component type: ${component.type}`);
    return '';
  }
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