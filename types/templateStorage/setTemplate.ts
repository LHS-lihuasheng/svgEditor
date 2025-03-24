/**
 * @description Set动画组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const SET_TEMPLATE: BaseComponentTemplate = {
  label: 'Set动画',
  icon: '⚡',
  description: 'SVG Set元素，用于设置属性值变化',
  defaultProperties: {
    attributes: {
      attributeName: 'visibility',
      to: 'hidden',
      begin: '0s',
      dur: '1ms',
      fill: 'freeze'
    }
  },
  fixedProperties: [
    'attributes.id',
    'attributes.attributeName',
    'attributes.to'
  ],
  propertyStorageName: 'SET'
}; 