/**
 * @description 矩形组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';
import { SVG_CONTROLS } from '@/types/core/property';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const RECT_TEMPLATE: BaseComponentTemplate = {
  label: '矩形',
  icon: '🔲',
  description: 'SVG矩形元素',
  category: '基础形状',
  defaultProperties: {
    style: {
      backgroundColor: '#000000',
      opacity: 1,
      pointerEvents: 'visible'
    },
    attributes: {
      x: 0,
      y: 0,
      width: '100%',
      height: '100%'
    }
  },
  propertyControls: [
    // 固定属性(不可删除)
    createProperty(SVG_CONTROLS.x, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.y, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.width, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.height, { isDefault: true, isFixed: true }),

    // 预定属性(可被删除)
    createProperty(SVG_CONTROLS.backgroundColor, { isDefault: true }),
    createProperty(SVG_CONTROLS.opacity, { isDefault: true }),

    // 可选属性(默认不存在，可添加)
    SVG_CONTROLS.fill,
    SVG_CONTROLS.stroke,
    SVG_CONTROLS.strokeWidth
  ],
  tags: ['Shape', 'Rectangle'],
  allowedChildren: [] as ComponentType[]
}; 