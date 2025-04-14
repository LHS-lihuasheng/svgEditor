/**
 * @description ForeignObject元素属性定义
 */
import { createProperty, propertyStorage } from './types';

export const FOREIGN_OBJECT_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      showLabel: true,
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    x: createProperty('number', 'X坐标', {
      showLabel: true,
      defaultValue: 0,
      step: 1,
      min: -9999,
      max: 9999,
      description: '元素在x轴上的位置',
      placeholder: '输入X坐标'
    }),

    y: createProperty('number', 'Y坐标', {
      showLabel: true,
      defaultValue: 0,
      step: 1,
      min: -9999,
      max: 9999,
      description: '元素在y轴上的位置',
      placeholder: '输入Y坐标'
    }),

    width: createProperty('string', '宽度', {
      showLabel: true,
      defaultValue: '100%',
      description: '元素的宽度',
      placeholder: '输入宽度'
    }),

    height: createProperty('string', '高度', {
      showLabel: true,
      defaultValue: '100%',
      description: '元素的高度',
      placeholder: '输入高度'
    })
  },
  style: {
    overflow: createProperty('select', 'Overflow', {
      defaultValue: 'visible',
      description: '内容溢出处理方式',
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' },
        { label: 'Scroll', value: 'scroll' },
        { label: 'Auto', value: 'auto' }
      ],
      placeholder: '选择溢出处理方式'
    }),

    opacity: createProperty('slider', '透明度', {
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.01,
      description: '元素的透明度',
      inputWidth: '60px'
    })
  }
}; 