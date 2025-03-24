/**
 * @description Animate标签属性库
 */
import { createProperty, propertyStorage } from './types';

// Animate标签属性库
export const ANIMATE_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: ''
    }),

    attributeName: createProperty('select', 'Target Attribute', {
      defaultValue: 'opacity',
      options: [
        { label: 'Opacity', value: 'opacity' },
        { label: 'X Position', value: 'x' },
        { label: 'Y Position', value: 'y' },
        { label: 'Width', value: 'width' },
        { label: 'Height', value: 'height' },
        { label: 'Fill', value: 'fill' },
        { label: 'Stroke', value: 'stroke' },
        { label: 'Transform', value: 'transform' }
      ]
    }),

    from: createProperty('string', 'From Value', {
      defaultValue: '0'
    }),

    to: createProperty('string', 'To Value', {
      defaultValue: '1'
    }),

    by: createProperty('string', 'By Value', {
      defaultValue: '1'
    }),

    values: createProperty('string', 'Values', {
      defaultValue: ''
    }),

    begin: createProperty('trigger', '触发方式', {
      defaultValue: '0s'
    }),

    dur: createProperty('string', 'Duration', {
      defaultValue: '1s'
    }),

    repeatCount: createProperty('string', 'Repeat Count', {
      defaultValue: '1'
    }),

    fill: createProperty('select', 'Fill Mode', {
      defaultValue: 'remove',
      options: [
        { label: 'Freeze', value: 'freeze' },
        { label: 'Remove', value: 'remove' }
      ]
    }),

    keyTimes: createProperty('string', 'Key Times', {
      defaultValue: '0;1'
    }),

    keySplines: createProperty('string', 'Key Splines', {
      defaultValue: '0.42 0 0.58 1'
    }),

    calcMode: createProperty('select', 'Calc Mode', {
      defaultValue: 'linear',
      options: [
        { label: 'Linear', value: 'linear' },
        { label: 'Discrete', value: 'discrete' },
        { label: 'Paced', value: 'paced' },
        { label: 'Spline', value: 'spline' }
      ]
    }),

    restart: createProperty('select', 'Restart', {
      defaultValue: 'always',
      options: [
        { label: 'Always', value: 'always' },
        { label: 'When Not Active', value: 'whenNotActive' },
        { label: 'Never', value: 'never' }
      ]
    })
  },
  style: {
  }
}; 