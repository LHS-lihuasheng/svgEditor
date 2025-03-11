/**
 * @description ForeignObject组件模板
 * 用于在SVG中嵌入HTML或外部内容
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { FOREIGN_OBJECT_PROPERTY } from '@/types/core/property/index';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const FOREIGN_OBJECT_TEMPLATE: BaseComponentTemplate = {
  label: '外部对象',
  icon: '📝',
  description: '可嵌入HTML或外部内容的容器',
  defaultProperties: {
    attributes: {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%',
    }
  },
  propertyControls: [
    createProperty(FOREIGN_OBJECT_PROPERTY.x, { isFixed: true }),
    createProperty(FOREIGN_OBJECT_PROPERTY.y, { isFixed: true }),
    createProperty(FOREIGN_OBJECT_PROPERTY.width, { isFixed: true }),
    createProperty(FOREIGN_OBJECT_PROPERTY.height, { isFixed: true }),
  ],
  tags: ['SVG', 'Container', 'HTML', 'ForeignObject']
}; 