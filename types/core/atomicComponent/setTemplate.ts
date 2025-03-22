/**
 * @description Set动画组件模板
 */
import { BaseComponentTemplate } from '@/types/core/component';
import { SET_PROPERTY } from '@/types/core/property/setProperty';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const SET_TEMPLATE: BaseComponentTemplate = {
  label: 'Set动画',
  icon: '⚡',
  description: 'SVG Set元素，用于设置属性值变化',
  defaultProperties: {
    attributes: {
      attributeName: 'visibility',
      to: 'hidden',
      begin: 'click',
      dur: '1ms',
      fill: 'freeze'
    },
    animationMode: 'to'
  },
  propertyControls: [
    createProperty(SET_PROPERTY.attributeName, { isFixed: true }),
    createProperty(SET_PROPERTY.to, { isFixed: true }),
    createProperty(SET_PROPERTY.begin, { isDefault: true }),
    createProperty(SET_PROPERTY.dur, { isDefault: true }),
    createProperty(SET_PROPERTY.fill, { isDefault: true })
  ]
}; 