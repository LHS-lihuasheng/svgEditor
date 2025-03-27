/**
 * @description Set动画组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const SET_TEMPLATE: BaseComponentTemplate = {
  templateName: 'Set动画',
  description: 'SVG Set元素，用于设置属性值变化',
  component: [{
    id: '',
    type: 'set',
    attributes: {
      id: '',
      attributeName: 'visibility',
      to: 'hidden',
      begin: '0s',
      dur: '1ms',
      fill: 'freeze'
    },
    fixedProperties: [
      'attributes.id',
      'attributes.attributeName',
      'attributes.to'
    ],
    children: []
  }]
}; 