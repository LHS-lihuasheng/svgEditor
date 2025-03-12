/**
 * @description AnimateTransform动画组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ANIMATE_TRANSFORM_PROPERTY } from '@/types/core/property/animateTransformProperty';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const ANIMATE_TRANSFORM_TEMPLATE: BaseComponentTemplate = {
  label: 'AnimateTransform动画',
  icon: '🔄',
  description: 'SVG AnimateTransform元素，用于变换属性动画',
  defaultProperties: {
    attributes: {
      attributeName: 'transform',
      type: 'translate',
      from: '0 0',
      to: '10 0',
      by: '5 0',
      values: '0 0;10 0;0 0',
      begin: 'click',
      dur: '1s',
      repeatCount: '1'
    },
    animationMode: 'values'
  },
  propertyControls: [
    createProperty(ANIMATE_TRANSFORM_PROPERTY.attributeName, { isFixed: true }),
    createProperty(ANIMATE_TRANSFORM_PROPERTY.type, { isFixed: true }),

  ],
  tags: ['SVG', 'Animation', 'Transform']
}; 