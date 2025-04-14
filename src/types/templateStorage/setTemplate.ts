/**
 * @description Set动画组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const SET_TEMPLATE: BaseComponentTemplate = {
  templateName: 'Set动画',
  icon: '⚡',
  category: 'animation',
  description: 'SVG Set元素，用于设置属性值变化',
  component: [{
    id: '',
    type: 'set',
    attributes: {
      id: '',
      attributeName: 'visibility',
      to: 'hidden',
      begin: 'click',
      dur: '1ms',
      fill: 'freeze'
    },
    fixedProperties: [
      'attributes.id',
      'attributes.attributeName',
      'attributes.to',
      'attributes.begin',
      'attributes.dur',
      'attributes.fill'
    ],
    children: []
  }]
}; 