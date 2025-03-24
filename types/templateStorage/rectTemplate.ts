/**
 * @description 矩形组件模板
 */
import { BaseComponentTemplate } from '@/types/component';

export const RECT_TEMPLATE: BaseComponentTemplate = {
  label: '矩形',
  icon: '⬜',
  description: '热区',
  defaultProperties: {
    attributes: {
      x: 0,
      y: 0,
      width: 100,
      height: 100
    },
    style: {
      fill: '#000000',
      opacity: 1,
      stroke: 'none',
      strokeWidth: 1
    }
  },
  fixedProperties: [
    'attributes.id',
    'attributes.x',
    'attributes.y',
    'attributes.width',
    'attributes.height', 
  ],
  propertyStorageName: 'RECT'
}; 