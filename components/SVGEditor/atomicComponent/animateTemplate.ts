/**
 * @description 基础动画组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';
import { SVG_CONTROLS } from '@/types/core/property';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const ANIMATE_TEMPLATE: BaseComponentTemplate = {
  label: '基础动画',
  icon: '🎬',
  description: 'SVG基础动画元素，可动态改变属性值',
  category: '动画',
  defaultProperties: {
    attributes: {
      attributeName: 'opacity',
      from: 1,
      to: 0,
      dur: '1s',
      repeatCount: 1,
      begin: 'click'
    }
  },
  propertyControls: [
    // 固定属性(不可删除)
    createProperty(SVG_CONTROLS.animateAttribute, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.from, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.to, { isDefault: true, isFixed: true }),
    createProperty(SVG_CONTROLS.dur, { isDefault: true, isFixed: true }),

    // 预定属性(可删除)
    createProperty(SVG_CONTROLS.repeatCount, { isDefault: true }),
    createProperty(SVG_CONTROLS.begin, { isDefault: true }),

    // 额外预定属性
    createProperty(SVG_CONTROLS.additive, {
      property: 'attributes.fill',
      label: '填充模式',
      options: [
        { label: 'remove', value: 'remove' },
        { label: 'freeze', value: 'freeze' }
      ],
      defaultValue: 'remove',
      isDefault: true
    })
  ],
  tags: ['Animation', 'Animate'],
  allowedChildren: [] as ComponentType[]
}; 