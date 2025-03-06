/**
 * @description 组模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';

export const GROUP_TEMPLATE: BaseComponentTemplate = {
  label: '组',
  icon: '🔄',
  description: '用于组合多个组件的容器',
  category: '容器',
  defaultProperties: {
    style: {
      position: 'relative',
      width: 'auto',
      height: 'auto',
      backgroundColor: 'transparent',
      opacity: 1
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
      defaultValue: 'auto'
    },
    {
      type: 'number',
      label: '高度',
      property: 'style.height',
      defaultValue: 'auto'
    },
    {
      type: 'color',
      label: '背景颜色',
      property: 'style.backgroundColor',
      defaultValue: 'transparent'
    },
    {
      type: 'number',
      label: '不透明度',
      property: 'style.opacity',
      min: 0,
      max: 1,
      step: 0.1,
      defaultValue: 1
    }
  ],
  tags: ['Group', 'Container'],
  allowedChildren: [] as ComponentType[] // 将在index.ts中设置
}; 