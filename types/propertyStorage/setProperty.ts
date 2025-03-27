/**
 * @description Set标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Set标签属性库
export const SET_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      showLabel: true,
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    attributeName: createProperty('select', 'Target Attribute', {
      showLabel: true,
      defaultValue: 'visibility',
      description: '要设置的目标属性',
      options: [
        { label: 'Visibility', value: 'visibility' },
        { label: 'Opacity', value: 'opacity' },
        { label: 'Fill', value: 'fill' },
        { label: 'Stroke', value: 'stroke' },
        { label: 'Transform', value: 'transform' }
      ],
      placeholder: '选择目标属性'
    }),

    to: createProperty('string', 'To Value', {
      showLabel: true,
      defaultValue: 'hidden',
      description: '目标属性值',
      placeholder: '例如: hidden, visible, #ff0000'
    }),

    begin: createProperty('trigger', '触发方式', {
      showLabel: true,
      defaultValue: '0s',
      description: '设置开始触发条件',
      options: [
        { label: "定时开始", value: "time" },
        { label: "Click", value: "click" },
        { label: "TouchStart", value: "touchstart" },
        { label: "TouchEnd", value: "touchend" }
      ]
    }),

    dur: createProperty('string', 'Duration', {
      showLabel: true,
      defaultValue: '1ms',
      description: '设置持续时间',
      placeholder: '例如: 1ms, 0s'
    }),

    fill: createProperty('select', 'Fill Mode', {
      showLabel: true,
      defaultValue: 'freeze',
      description: '设置完成后效果',
      options: [
        { label: 'Freeze', value: 'freeze' },
        { label: 'Remove', value: 'remove' }
      ],
      placeholder: '选择完成效果'
    })
  },
  style: {}
}; 