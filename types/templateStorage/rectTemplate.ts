/**
 * @description 矩形组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const RECT_TEMPLATE: BaseComponentTemplate = {
  templateName: '矩形热区',
  icon: '⬛',
  category: 'basic',
  description: '基本图形，默认可点击，点击一次后消失，常用作触发热区',
  component: [{
    id: '',
    type: 'rect',
    attributes: {
      id: '热区',
      x: '0',
      y: '0',
      width: '100%',
      height: '100%'
    },
    style: {
      fill: '#000000',
      opacity: 0,
      pointerEvents: 'visible'
    },
    fixedProperties: [
      'attributes.id',
      'attributes.x',
      'attributes.y',
      'attributes.width',
      'attributes.height',
    ],
    children: [{
      id: '',
      type: 'set',
      attributes: {
        id: '隐藏动画',
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
  }]
}; 