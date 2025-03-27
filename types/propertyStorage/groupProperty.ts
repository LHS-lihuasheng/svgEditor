/**
 * @description Group标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Group标签属性库
export const GROUP_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      showLabel: true,
      defaultValue: '',
      description: '元素唯一标识符',
      placeholder: '输入标识符'
    }),

    transform: createProperty('transform', 'Transform', {
      defaultValue: { translate: { x: 0, y: 0 }, scale: 1, rotate: 0 },
      description: '元素的变换属性',
      showLabel: true
    }),

    visibility: createProperty('select', 'Visibility', {
      defaultValue: 'visible',
      description: '元素的可见性',
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' }
      ],
      placeholder: '选择可见性'
    })
  },
  style: {
    opacity: createProperty('slider', '透明度', {
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.01,
      description: '元素的透明度',
      inputWidth: '60px'
    }),

    pointerEvents: createProperty('select', 'Pointer Events', {
      defaultValue: 'none',
      description: '指针事件响应方式',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Visible', value: 'visible' },
        { label: 'Painted', value: 'painted' },
        { label: 'VisiblePainted', value: 'visiblePainted' }
      ],
      placeholder: '选择指针事件响应方式'
    })
  }
}; 