/**
 * @description 动画集模板
 */
import { BaseComponentTemplate } from '@/types/core/template';
import { ComponentType } from '@/types/core';

export const SET_TEMPLATE: BaseComponentTemplate = {
  label: '动画',
  icon: '✨',
  description: 'SVG动画效果',
  category: '动画',
  defaultProperties: {
    attributes: {
      attributeName: 'opacity',
      from: 0,
      to: 1,
      dur: '1s',
      repeatCount: 'indefinite'
    }
  },
  propertyControls: [
    {
      type: 'select',
      label: '目标属性',
      property: 'attributes.attributeName',
      options: [
        { label: '透明度', value: 'opacity' },
        { label: 'X位置', value: 'x' },
        { label: 'Y位置', value: 'y' },
        { label: '宽度', value: 'width' },
        { label: '高度', value: 'height' }
      ],
      defaultValue: 'opacity'
    },
    {
      type: 'string',
      label: '起始值',
      property: 'attributes.from',
      defaultValue: '0'
    },
    {
      type: 'string',
      label: '结束值',
      property: 'attributes.to',
      defaultValue: '1'
    },
    {
      type: 'string',
      label: '持续时间',
      property: 'attributes.dur',
      defaultValue: '1s'
    },
    {
      type: 'select',
      label: '重复次数',
      property: 'attributes.repeatCount',
      options: [
        { label: '无限循环', value: 'indefinite' },
        { label: '1次', value: '1' },
        { label: '2次', value: '2' },
        { label: '3次', value: '3' }
      ],
      defaultValue: 'indefinite'
    }
  ],
  tags: ['Animation'],
  allowedChildren: [] as ComponentType[] // 将在index.ts中设置
}; 