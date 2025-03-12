/**
 * @description 矩形组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { RECT_PROPERTY } from '@/types/core/property/rectProperty';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const RECT_TEMPLATE: BaseComponentTemplate = {
  label: '矩形',
  icon: '⬜',
  description: '基础矩形形状',
  defaultProperties: {
    attributes: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
    },
    style: {
      fill: '#000000',
      opacity: 1,
      stroke: 'none',
      strokeWidth: '0'
    }
  },
  propertyControls: [
    createProperty(RECT_PROPERTY.x, { isFixed: true }),
    createProperty(RECT_PROPERTY.y, { isFixed: true }),
    createProperty(RECT_PROPERTY.width, { isFixed: true }),
    createProperty(RECT_PROPERTY.height, { isFixed: true }),
    createProperty(RECT_PROPERTY.fill, { isDefault: true }),
  ],
  tags: ['SVG', 'Shape', 'Rectangle']
}; 