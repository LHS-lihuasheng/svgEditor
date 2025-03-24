/**
 * @description AnimateTransform标签属性库
 */
import { createProperty, propertyStorage } from './types';

// AnimateTransform标签属性库
export const ANIMATE_TRANSFORM_PROPERTY: propertyStorage = {
  attributes: {
    id: createProperty('string', 'ID', {
      defaultValue: ''
    }),

    attributeName: createProperty('string', 'Attribute Name', {
      defaultValue: 'transform'
    }),

    type: createProperty('select', 'Transform Type', {
      defaultValue: 'translate',
      options: [
        { label: 'Translate', value: 'translate' },
        { label: 'Scale', value: 'scale' },
        { label: 'Rotate', value: 'rotate' },
        { label: 'SkewX', value: 'skewX' },
        { label: 'SkewY', value: 'skewY' }
      ]
    }),

    from: createProperty('string', 'From Value', {
      defaultValue: '0 0'
    }),

    to: createProperty('string', 'To Value', {
      defaultValue: '10 0'
    }),

    by: createProperty('string', 'By Value', {
      defaultValue: '10 0'
    }),

    values: createProperty('string', 'Values', {
      defaultValue: '0 0;10 0;0 0'
    }),

    begin: createProperty('select', 'Begin Trigger', {
      defaultValue: 'click',
      options: [
        { label: 'On Click', value: 'click' },
        { label: 'On Mouse Over', value: 'mouseover' },
        { label: 'On Touch Start', value: 'touchstart' },
        { label: 'Immediately', value: '0s' }
      ]
    }),

    dur: createProperty('string', 'Duration', {
      defaultValue: '1s'
    }),

    repeatCount: createProperty('select', 'Repeat Count', {
      defaultValue: '1',
      options: [
        { label: 'Indefinite', value: 'indefinite' },
        { label: '1', value: '1' },
        { label: '2', value: '2' },
        { label: '3', value: '3' }
      ]
    }),

    fill: createProperty('select', 'Fill Mode', {
      defaultValue: 'freeze',
      options: [
        { label: 'Freeze', value: 'freeze' },
        { label: 'Remove', value: 'remove' }
      ]
    }),

    restart: createProperty('select', 'Restart', {
      defaultValue: 'always',
      options: [
        { label: 'Always', value: 'always' },
        { label: 'Never', value: 'never' },
        { label: 'When Not Active', value: 'whenNotActive' }
      ]
    }),

    keyTimes: createProperty('string', 'Key Times', {
      defaultValue: '0;0.5;1'
    }),

    keySplines: createProperty('string', 'Key Splines', {
      defaultValue: '0.42 0 0.58 1.0; 0.42 0 0.58 1.0'
    }),

    calcMode: createProperty('select', 'Calculation Mode', {
      defaultValue: 'spline',
      options: [
        { label: 'Spline', value: 'spline' },
        { label: 'Linear', value: 'linear' },
        { label: 'Discrete', value: 'discrete' },
        { label: 'Paced', value: 'paced' }
      ]
    })
  },
  style: {
  }
}; 