/**
 * @description Rect标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Rect标签属性库
export const RECT_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      showLabel: true,
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    x: createProperty('string', 'X Position', {
      showLabel: true,
      defaultValue: '0',
      description: '矩形左上角的X坐标',
      placeholder: '输入X坐标'
    }),

    y: createProperty('string', 'Y Position', {
      showLabel: true,
      defaultValue: '0',
      description: '矩形左上角的Y坐标',
      placeholder: '输入Y坐标'
    }),

    width: createProperty('string', 'Width', {
      showLabel: true,
      defaultValue: '100%',
      description: '矩形的宽度',
      placeholder: '输入宽度'
    }),

    height: createProperty('string', 'Height', {
      showLabel: true,
      defaultValue: '100%',
      description: '矩形的高度',
      placeholder: '输入高度'
    }),

    rx: createProperty('string', 'X Radius', {
      defaultValue: '0',
      description: '矩形X方向的圆角半径',
      placeholder: '输入X圆角'
    }),

    ry: createProperty('string', 'Y Radius', {
      defaultValue: '0',
      description: '矩形Y方向的圆角半径',
      placeholder: '输入Y圆角'
    })
  },
  style: {
    fill: createProperty('color', 'Fill Color', {
      defaultValue: '#000000',
      description: '填充颜色',
      presetColors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 'none']
    }),

    stroke: createProperty('color', 'Stroke Color', {
      defaultValue: 'none',
      description: '描边颜色',
      presetColors: ['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', 'none']
    }),

    strokeWidth: createProperty('number', 'Stroke Width', {
      defaultValue: 1,
      min: 0,
      max: 100,
      step: 0.5,
      description: '描边宽度',
      placeholder: '输入描边宽度'
    }),

    opacity: createProperty('slider', 'Opacity', {
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.01,
      description: '元素的透明度',
      inputWidth: '60px'
    }),

    pointerEvents: createProperty('select', 'Pointer Events', {
      defaultValue: 'visible',
      description: '指针事件响应方式',
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Painted', value: 'painted' },
        { label: 'VisiblePainted', value: 'visiblePainted' },
        { label: 'None', value: 'none' }
      ],
      placeholder: '选择指针事件响应方式'
    })
  }
}; 