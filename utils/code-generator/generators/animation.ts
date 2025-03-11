import type { BaseComponent } from '@/types/core';
import { generateAttributes, processAnimationAttributes } from '../utils/attributes';
import { generateComponentCode } from '../component-generators';

/**
 * @description 生成set动画代码
 * @param {BaseComponent} component - set组件
 * @returns {string} 生成的set代码
 */
export function generateSetCode(component: BaseComponent): string {
  const { attributes = {} } = component;

  // 处理属性 - 特殊处理set动画属性
  const filteredAttributes = processAnimationAttributes(attributes, 'set');

  return `<set ${generateAttributes(filteredAttributes)} />`;
}

/**
 * @description 生成animate动画代码
 * @param {BaseComponent} component - animate组件
 * @returns {string} 生成的animate代码
 */
export function generateAnimateCode(component: BaseComponent): string {
  const { attributes = {}, animationMode } = component;

  // 创建一个新的属性对象
  const processedAttributes = { ...attributes };

  // 直接使用组件的animationMode而不进行推断
  // 确保不输出animationMode到SVG
  delete processedAttributes.animationMode;

  // 根据动画模式选择性保留属性
  // 没有必要检查属性存在与否，直接根据模式清理
  switch (animationMode) {
    case 'values':
      // 仅保留values相关属性
      delete processedAttributes.from;
      delete processedAttributes.to;
      delete processedAttributes.by;
      break;

    case 'fromTo':
      // 仅保留from和to相关属性
      delete processedAttributes.by;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;

    case 'fromBy':
      // 仅保留from和by相关属性
      delete processedAttributes.to;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;

    case 'to':
      // 仅保留to相关属性
      delete processedAttributes.from;
      delete processedAttributes.by;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;

    case 'by':
      // 仅保留by相关属性
      delete processedAttributes.from;
      delete processedAttributes.to;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;
  }

  // 清理所有空值属性
  Object.keys(processedAttributes).forEach(key => {
    const value = processedAttributes[key];
    if (value === undefined || value === null ||
      (typeof value === 'string' && value.trim() === '')) {
      delete processedAttributes[key];
    }
  });

  return `<animate ${generateAttributes(processedAttributes)} />`;
}

/**
 * @description 生成animateTransform动画代码
 * @param {BaseComponent} component - animateTransform组件
 * @returns {string} 生成的animateTransform代码
 */
export function generateAnimateTransformCode(component: BaseComponent): string {
  // 使用解构赋值获取animationMode字段和属性
  const { attributes = {}, animationMode } = component;

  // 创建一个新的属性对象，避免修改原始属性
  const processedAttributes = {
    ...attributes,
    // 确保attributeName和type存在
    attributeName: attributes.attributeName || 'transform',
    type: attributes.type || 'translate'
  };

  // 确保移除animationMode字段，不要输出到SVG
  delete processedAttributes.animationMode;

  // 根据动画模式处理属性，简化逻辑
  switch (animationMode) {
    case 'values':
      // 清除 from/to/by 属性
      delete processedAttributes.from;
      delete processedAttributes.to;
      delete processedAttributes.by;

      // 确保保留values相关属性
      if (!processedAttributes.calcMode) {
        delete processedAttributes.keySplines;
      } else if (processedAttributes.calcMode !== 'spline') {
        delete processedAttributes.keySplines;
      }
      break;

    case 'fromTo':
      // 保留from和to，清除其他
      delete processedAttributes.by;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;

    case 'fromBy':
      // 保留from和by，清除其他
      delete processedAttributes.to;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;

    case 'to':
      // 只保留to，清除其他
      delete processedAttributes.from;
      delete processedAttributes.by;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;

    case 'by':
      // 只保留by，清除其他
      delete processedAttributes.from;
      delete processedAttributes.to;
      delete processedAttributes.values;
      delete processedAttributes.keyTimes;
      delete processedAttributes.keySplines;
      break;
  }

  // 清理所有空值属性
  Object.keys(processedAttributes).forEach(key => {
    const value = processedAttributes[key];
    if (value === undefined || value === null ||
      (typeof value === 'string' && value.trim() === '')) {
      delete processedAttributes[key];
    }
  });

  return `<animateTransform ${generateAttributes(processedAttributes)} />`;
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

  // 检查是否有mpath子元素
  const mpath = children.find(child => child.type === 'mpath');

  if (mpath) {
    return `<animateMotion ${generateAttributes(filteredAttributes)}>
  <mpath ${generateAttributes(mpath.attributes || {})} />
</animateMotion>`;
  } else {
    return `<animateMotion ${generateAttributes(filteredAttributes)} />`;
  }
} 