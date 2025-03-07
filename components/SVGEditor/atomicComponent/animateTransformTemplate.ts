/**
 * @description 变换动画组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';
import { SVG_CONTROLS } from '@/types/core/property';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const ANIMATE_TRANSFORM_TEMPLATE: BaseComponentTemplate = {
  label: '变换动画',
  icon: '🔄',
  description: 'SVG变换动画元素，用于旋转、缩放和平移等变换',
  category: '动画',
  defaultProperties: {
    attributes: {
      attributeName: 'transform',
      type: 'rotate',
      from: '0',
      to: '360',
      dur: '3s',
      repeatCount: 'indefinite',
      additive: 'sum'
    }
  },
  propertyControls: [
    // 固定属性(不可删除)
    createProperty(SVG_CONTROLS.transformType, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.from, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.to, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.dur, { isDefault: true, isFixed: true }),
    
    // 预定属性(可删除)
    createProperty(SVG_CONTROLS.repeatCount, { isDefault: true }),
    createProperty(SVG_CONTROLS.additive, { isDefault: true }),
    
    // 可选属性
    SVG_CONTROLS.begin
  ],
  tags: ['Animation', 'Transform'],
  allowedChildren: [] as ComponentType[]
}; 