/**
 * @description 矩形组件模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';

export const RECT_TEMPLATE: BaseComponentTemplate = {
  label: '矩形',
  icon: '🔲',
  description: 'SVG矩形元素',
  category: '基础形状',
  defaultProperties: {
    style: {
      width: '100px',
      height: '100px',
      backgroundColor: '#3b82f6',
      position: 'relative',
      borderColor: 'transparent',
      borderWidth: 0
    },
    attributes: {
      rx: 0,
      ry: 0
    }
  },
  propertyControls: [
    {
      type: 'select',
      label: '定位方式',
      property: 'style.position',
      options: [
        { label: '相对定位', value: 'relative' },
        { label: '绝对定位', value: 'absolute' }
      ],
      defaultValue: 'relative'
    },
    {
      type: 'number',
      label: 'X坐标',
      property: 'style.left',
      defaultValue: 0
    },
    {
      type: 'number',
      label: 'Y坐标',
      property: 'style.top',
      defaultValue: 0
    },
    {
      type: 'number',
      label: '宽度',
      property: 'style.width',
      defaultValue: 100
    },
    {
      type: 'number',
      label: '高度',
      property: 'style.height',
      defaultValue: 100
    },
    {
      type: 'color',
      label: '背景颜色',
      property: 'style.backgroundColor',
      defaultValue: '#3b82f6'
    },
    {
      type: 'number',
      label: '圆角X',
      property: 'attributes.rx',
      defaultValue: 0
    },
    {
      type: 'number',
      label: '圆角Y',
      property: 'attributes.ry',
      defaultValue: 0
    },
    {
      type: 'color',
      label: '边框颜色',
      property: 'style.borderColor',
      defaultValue: 'transparent'
    },
    {
      type: 'number',
      label: '边框宽度',
      property: 'style.borderWidth',
      defaultValue: 0
    }
  ],
  tags: ['Shape', 'Rectangle'],
  allowedChildren: [] as ComponentType[] // 将在index.ts中设置
}; 