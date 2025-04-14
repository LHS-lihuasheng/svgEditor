import type { BaseComponent } from '@/types';
import { generateAttributes, processAnimationAttributes } from '../utils/attributes';
import { generateComponentCode, generateTagCode } from '../component-generators';

/**
 * @description 生成set动画代码
 * @param {BaseComponent} component - set组件
 * @returns {string} 生成的set代码
 */
export function generateSetCode(component: BaseComponent): string {
  const { attributes = {}, children = [] } = component;
  const filteredAttributes = processAnimationAttributes(attributes, 'set');
  const childrenCode = children && children.length > 0
    ? children.map(child => generateComponentCode(child)).join('\n  ')
    : '';

  return generateTagCode('set', generateAttributes(filteredAttributes), '', childrenCode, true);
}

/**
 * @description 生成animate动画代码
 * @param {BaseComponent} component - animate组件
 * @returns {string} 生成的animate代码
 */
export function generateAnimateCode(component: BaseComponent): string {
  const { attributes = {}, animationMode = 'values', children = [] } = component;

  console.log(`Generating animate code with mode: ${animationMode}`);

  // 创建黑名单映射
  const modeExcludeProps = {
    'values': new Set(['from', 'to', 'by', 'animationMode']),
    'fromTo': new Set(['by', 'values', 'keyTimes', 'keySplines', 'animationMode']),
    'fromBy': new Set(['to', 'values', 'keyTimes', 'keySplines', 'animationMode']),
    'to': new Set(['from', 'by', 'values', 'keyTimes', 'keySplines', 'animationMode']),
    'by': new Set(['from', 'to', 'values', 'keyTimes', 'keySplines', 'animationMode'])
  };

  // 获取有效的动画模式
  const validModes = Object.keys(modeExcludeProps);
  const safeMode = validModes.includes(animationMode) ? animationMode : 'values';

  // 创建新的属性对象，排除黑名单中的属性
  const processedAttributes: Record<string, any> = {};
  const excludeProps = modeExcludeProps[safeMode];

  Object.keys(attributes).forEach(key => {
    if (!excludeProps.has(key) && attributes[key] !== null && attributes[key] !== undefined &&
      !(typeof attributes[key] === 'string' && attributes[key].trim() === '')) {
      processedAttributes[key] = attributes[key];
    }
  });

  // 处理子元素
  const childrenCode = children && children.length > 0
    ? children.map(child => generateComponentCode(child)).join('\n  ')
    : '';

  return generateTagCode('animate', generateAttributes(processedAttributes), '', childrenCode);
}

/**
 * @description 生成animateTransform动画代码
 * @param {BaseComponent} component - animateTransform组件
 * @returns {string} 生成的animateTransform代码
 */
export function generateAnimateTransformCode(component: BaseComponent): string {
  const { attributes = {}, animationMode = 'values', children = [] } = component;

  console.log(`Generating animateTransform code with mode: ${animationMode}`);

  // 创建黑名单映射
  const modeExcludeProps = {
    'values': new Set(['from', 'to', 'by', 'animationMode']),
    'fromTo': new Set(['by', 'values', 'keyTimes', 'keySplines', 'animationMode']),
    'fromBy': new Set(['to', 'values', 'keyTimes', 'keySplines', 'animationMode']),
    'to': new Set(['from', 'by', 'values', 'keyTimes', 'keySplines', 'animationMode']),
    'by': new Set(['from', 'to', 'values', 'keyTimes', 'keySplines', 'animationMode'])
  };

  // 获取有效的动画模式
  const validModes = Object.keys(modeExcludeProps);
  const safeMode = validModes.includes(animationMode) ? animationMode : 'values';

  // 创建新的属性对象，排除黑名单中的属性
  const processedAttributes: Record<string, any> = {};
  const excludeProps = modeExcludeProps[safeMode];

  Object.keys(attributes).forEach(key => {
    if (!excludeProps.has(key) && attributes[key] !== null && attributes[key] !== undefined &&
      !(typeof attributes[key] === 'string' && attributes[key].trim() === '')) {
      processedAttributes[key] = attributes[key];
    }
  });

  const childrenCode = children && children.length > 0
    ? children.map(child => generateComponentCode(child)).join('\n  ')
    : '';

  return generateTagCode('animateTransform', generateAttributes(processedAttributes), '', childrenCode);
}

/**
 * @description 生成animateMotion动画代码
 * @param {BaseComponent} component - animateMotion组件
 * @returns {string} 生成的animateMotion代码
 */
export function generateAnimateMotionCode(component: BaseComponent): string {
  const { attributes = {}, children = [] } = component;

  // 处理动画属性
  const filteredAttributes = processAnimationAttributes(attributes, 'animateMotion');

  // 检查是否有子元素
  if (children && children.length > 0) {
    const childrenCode = children.map(child => generateComponentCode(child)).join('\n  ');
    return `<animateMotion ${generateAttributes(filteredAttributes)}>
  ${childrenCode}
</animateMotion>`;
  } else {
    return `<animateMotion ${generateAttributes(filteredAttributes)}></animateMotion>`;
  }
} 