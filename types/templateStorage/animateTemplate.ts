/**
 * @description Animate动画组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const ANIMATE_TEMPLATE: BaseComponentTemplate = {
  templateName: 'Animate动画',
  description: 'SVG Animate元素，用于属性值动画',
  component: [{
    id: '',
    type: 'animate',
    attributes: {
      id: '',
      attributeName: 'opacity',
      from: '0',
      to: '1',
      by: '0.5',
      values: '0;0.5;1;0.5;0',
      keyTimes: '0;0.25;0.5;0.75;1',
      calcMode: 'linear',
      begin: 'click',
      dur: '1s',
      repeatCount: '1'
    },
    fixedProperties: [
      'attributes.id',
      'attributes.attributeName'
    ],
    animationMode: 'values',
    children: []
  }]
}; 