/**
 * @description 组模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';
import { SVG_CONTROLS } from '@/types/core/property';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const GROUP_TEMPLATE: BaseComponentTemplate = {
  label: '组',
  icon: '🔄',
  description: '用于组合多个组件的容器',
  category: '容器',
  defaultProperties: {
    style: {
      opacity: 1
    },
    transform: {
      translate: { x: 0, y: 0 },
      scale: 1,
      rotate: 0
    }
  },
  propertyControls: [
    // 预定属性(可被删除)
    createProperty(SVG_CONTROLS.opacity, { isDefault: true }),

    // 固定属性(不可删除)
    createProperty(SVG_CONTROLS.translateX, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.translateY, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.scale, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.rotate, { isDefault: true, isFixed: true }),

    // 可选属性
    SVG_CONTROLS.fill,
    SVG_CONTROLS.stroke,
    SVG_CONTROLS.strokeWidth
  ],
  tags: ['Group', 'Container'],
  allowedChildren: [] as ComponentType[]
}; 