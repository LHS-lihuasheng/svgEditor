/**
 * @description 组合组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const GROUP_TEMPLATE: BaseComponentTemplate = {
  templateName: 'g分组',
  description: 'SVG组合元素，可以包含多个子元素',
  component: [{
    id: '',
    type: 'g',
    attributes: {
      id: '',
      transform: {
        translate: { x: 0, y: 0 },
        scale: 1,
        rotate: 0
      },
      visibility: 'visible'
    },
    style: {
      opacity: 1
    },
    fixedProperties: [
      'attributes.id'
    ],
    children: []
  }]
}; 