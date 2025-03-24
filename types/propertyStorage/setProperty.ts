/**
 * @description Set标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Set标签属性库
export const SET_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: ''
    }),

    attributeName: createProperty('select', 'Target Attribute', {
      defaultValue: 'visibility',
      options: [
        { label: 'Visibility', value: 'visibility' },
        { label: 'Opacity', value: 'opacity' },
        { label: 'Fill', value: 'fill' },
        { label: 'Stroke', value: 'stroke' },
        { label: 'Transform', value: 'transform' }
      ]
    }),
    to: createProperty('string', 'To Value', {
      defaultValue: 'hidden'
    }),
    begin: createProperty('string', '触发方式', {
      defaultValue: '0s'
    }),
    dur: createProperty('string', 'Duration', {
      defaultValue: '1ms'
    }),
    fill: createProperty('select', 'Fill Mode', {
      defaultValue: 'freeze',
      options: [
        { label: 'Freeze', value: 'freeze' },
        { label: 'Remove', value: 'remove' }
      ]
    })
  },
  style: {
  }
}; 