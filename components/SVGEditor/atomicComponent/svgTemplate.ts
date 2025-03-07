/**
 * @description SVG图片组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';
import { SVG_CONTROLS } from '@/types/core/property';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const SVG_PIC_TEMPLATE: BaseComponentTemplate = {
  label: 'SVG图片',
  icon: '🖼️',
  description: 'SVG图片容器，可设置背景图和样式',
  category: '容器',
  defaultProperties: {
    attributes: {},
    style: {
      backgroundSize: 'cover',
      backgroundColor: 'transparent',
      margin: {}
    },
    viewBox: {
      x: 0,
      y: 0,
      width: 0,
      height: 0
    }
  },
  propertyControls: [
    // 只有viewBox是固定属性(不可删除)
    createProperty(SVG_CONTROLS.viewBox, { isDefault: true, isFixed: true }),

    // 以下是预定属性(可删除)
    createProperty(SVG_CONTROLS.backgroundImage, { isDefault: true }),
    createProperty(SVG_CONTROLS.margin, { isDefault: true }),
    createProperty(SVG_CONTROLS.backgroundSize, { isDefault: true }),
    createProperty(SVG_CONTROLS.backgroundColor, { isDefault: true }),

    // 可选属性
    SVG_CONTROLS.fill,
    SVG_CONTROLS.stroke,
    SVG_CONTROLS.strokeWidth
  ],
  tags: ['SVG', 'Container', 'Image'],
  allowedChildren: [] as ComponentType[]
};

// 无缝图片模板
export const SVG_SEAMLESS_PIC_TEMPLATE: BaseComponentTemplate = {
  ...SVG_PIC_TEMPLATE,
  label: '无缝SVG图片',
  icon: '🔄',
  description: '无缝平铺的SVG图片容器，适用于背景纹理',
  defaultProperties: {
    ...SVG_PIC_TEMPLATE.defaultProperties,
    style: {
      ...SVG_PIC_TEMPLATE.defaultProperties?.style,
      backgroundRepeat: 'repeat',
      // 特殊设置，使顶部边距为-1，创建无缝效果
      margin: { top: -1, right: 0, bottom: 0, left: 0 }
    }
  },
  propertyControls: [
    ...(SVG_PIC_TEMPLATE.propertyControls || []),
    // 重复方式是预定属性，但不是固定属性(可删除)
    createProperty(SVG_CONTROLS.backgroundRepeat, {
      isDefault: true,
      defaultValue: 'repeat'
    })
  ],
  tags: ['SVG', 'Container', 'Image', 'Seamless', 'Pattern']
};

