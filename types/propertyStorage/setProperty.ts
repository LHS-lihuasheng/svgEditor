/**
 * @description Set标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Set标签属性库
export const SET_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    attributeName: createProperty('select', 'Target Attribute', {
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
      defaultValue: 'hidden',
      description: '目标属性值',
      placeholder: '例如: hidden, visible, #ff0000'
    }),

    begin: createProperty('trigger', '触发方式', {
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
      defaultValue: '1ms',
      description: '设置持续时间',
      placeholder: '例如: 1ms, 0s'
    }),

    fill: createProperty('select', 'Fill Mode', {
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