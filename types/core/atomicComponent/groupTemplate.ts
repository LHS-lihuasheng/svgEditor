/**
 * @description 组合组件模板
 */
import { BaseComponentTemplate } from '@/types/core/component';
import { GROUP_PROPERTY } from '@/types/core/property/groupProperty';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const GROUP_TEMPLATE: BaseComponentTemplate = {
  label: 'g分组',
  icon: '🔄',
  description: 'SVG组合元素，可以包含多个子元素',
  defaultProperties: {
    attributes: {
      transform: {
        translate: { x: 0, y: 0 },
        scale: 1,
        rotate: 0
      }
    },
    style: {
    }
  },
  propertyControls: [
    createProperty(GROUP_PROPERTY.transform, { isDefault: true }),
    createProperty(GROUP_PROPERTY.opacity, { isDefault: true }),
  ]
}; 