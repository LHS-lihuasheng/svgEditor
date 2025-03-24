/**
 * @description 组合组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const GROUP_TEMPLATE: BaseComponentTemplate = {
  label: 'g分组',
  icon: '🔄',
  description: 'SVG组合元素，可以包含多个子元素',
  defaultProperties: {
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
    }
  },
  fixedProperties: [
    'attributes.id'
  ],
  propertyStorageName: 'GROUP'
}; 