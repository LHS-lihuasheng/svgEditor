import type { BaseComponent } from '@/types/core';
import { generateSVGPicCode } from './generators/svg';
import { generateRectCode } from './generators/shapes';
import { generateGroupCode } from './generators/containers';
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
  'animateMotion': generateAnimateMotionCode
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