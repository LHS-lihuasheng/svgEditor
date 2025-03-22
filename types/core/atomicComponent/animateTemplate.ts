/**
 * @description Animate动画组件模板
 */
import { BaseComponentTemplate } from '@/types/core/component';
import { ANIMATE_PROPERTY } from '@/types/core/property/animateProperty';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const ANIMATE_TEMPLATE: BaseComponentTemplate = {
  label: 'Animate动画',
  icon: '🔄',
  description: 'SVG Animate元素，用于属性值动画',
  defaultProperties: {
    attributes: {
      attributeName: 'opacity',
      from: '0',
      to: '1',
      by: '0.5',
      values: '0;0.5;1;0.5;0',
      keyTimes: '0;0.25;0.5;0.75;1',
      calcMode: 'linear',
      begin: 'click',
      dur: '1s',
      repeatCount: '1',
      fill: 'freeze'
    },
    animationMode: 'values'
  },
  propertyControls: [
    createProperty(ANIMATE_PROPERTY.attributeName, { isFixed: true }),
  ]
}; 