/**
 * @description 组合组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const GROUP_TEMPLATE: BaseComponentTemplate = {
  templateName: 'g分组',
  icon: '📁',
  category: 'basic',
  description: 'SVG组合元素，可以包含多个子元素，用于分组和隔离动画',
  component: [{
    id: '',
    type: 'g',
    attributes: {
      id: '',
    },
    style: {
    },
    fixedProperties: [
      'attributes.id'
    ],
    children: []
  }]
}; 