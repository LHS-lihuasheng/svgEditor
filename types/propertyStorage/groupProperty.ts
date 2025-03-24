/**
 * @description Group标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Group标签属性库
export const GROUP_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: ''
    }),

    transform: createProperty('transform', 'Transform', {
      defaultValue: { translate: { x: 0, y: 0 }, scale: 1, rotate: 0 }
    }),
    visibility: createProperty('select', 'Visibility', {
      defaultValue: 'visible',
      options: [
        { label: 'Visible', value: 'visible' },
        { label: 'Hidden', value: 'hidden' }
      ]
    })
  },
  style: {
    opacity: createProperty('slider', '透明度', {
      defaultValue: 1,
      min: 0,
      max: 1,
      step: 0.01
    }),
    pointerEvents: createProperty('select', 'Pointer Events', {
      defaultValue: 'none',
      options: [
        { label: 'None', value: 'none' },
        { label: 'Visible', value: 'visible' },
        { label: 'Painted', value: 'painted' },
        { label: 'VisiblePainted', value: 'visiblePainted' }
      ]
    })
  }
}; 