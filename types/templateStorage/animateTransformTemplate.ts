/**
 * @description AnimateTransform动画组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const ANIMATE_TRANSFORM_TEMPLATE: BaseComponentTemplate = {
  templateName: 'AnimateTransform动画',
  description: 'SVG AnimateTransform元素，用于变换属性动画',
  component: [{
    id: '',
    type: 'animateTransform',
    attributes: {
      id: '',
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
    fixedProperties: [
      'attributes.id',
      'attributes.attributeName',
      'attributes.type'
    ],
    animationMode: 'values',
    children: []
  }]
}; 