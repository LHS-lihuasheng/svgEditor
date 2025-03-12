/**
 * @description SVG图片组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { SVG_PROPERTY } from '@/types/core/property/svgProperty';

// 克隆并修改属性
function createProperty(baseProperty: any, overrides: Partial<any> = {}) {
  return { ...baseProperty, ...overrides };
}

export const SVG_PIC_TEMPLATE: BaseComponentTemplate = {
  label: 'SVG图片',
  icon: '🖼️',
  description: 'SVG图片容器，可设置背景图和样式',
  defaultProperties: {
    attributes: {
      viewBox: {
        x: 0,
        y: 0,
        width: 1080,
        height: 1920
      },
    },
    style: {
      backgroundSize: 'cover',
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      backgroundColor: 'transparent'
    }
  },
  propertyControls: [
    createProperty(SVG_PROPERTY.viewBox, { isFixed: true }),
    createProperty(SVG_PROPERTY.backgroundImage, { isDefault: true }),
    createProperty(SVG_PROPERTY.backgroundSize, { isDefault: true }),
  ],
  tags: ['SVG', 'Container', 'Image']
};

// 无缝图片模板
export const SVG_SEAMLESS_PIC_TEMPLATE: BaseComponentTemplate = {
  label: '无缝SVG图片',
  icon: '🔄',
  description: '无缝平铺的SVG图片容器，适用于背景纹理',
  defaultProperties: {
    ...SVG_PIC_TEMPLATE.defaultProperties,
    style: {
      ...SVG_PIC_TEMPLATE.defaultProperties?.style,
      backgroundRepeat: 'repeat',
      margin: { top: -1, right: 0, bottom: 0, left: 0 }
    }
  },
  propertyControls: [
    ...SVG_PIC_TEMPLATE.propertyControls.filter(prop => prop.property !== 'style.backgroundRepeat'),
    createProperty(SVG_PROPERTY.backgroundRepeat, {
      isDefault: true,
      defaultValue: 'repeat'
    })
  ],
  tags: ['SVG', 'Container', 'Image', 'Seamless', 'Pattern']
};

